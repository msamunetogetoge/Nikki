"""
nikki 編集、登録、公開範囲の設定などを処理するapi
"""


from http import HTTPStatus
from typing import Union, List
from http.client import HTTPResponse
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from sqlalchemy.exc import NoResultFound, MultipleResultsFound, IntegrityError

from db.model import Nikki, _Nikki, Login, _User, Nikkis, UserStore, utc_str_to_datetime, api_to_orm, create_random_user
from db.crud import get_nikkis, add_nikki, remove_nikki, try_get_one_user, add_user, try_login, edit_nikki, remove_user_and_nikki

app = FastAPI()


@app.get("/")
async def root() -> dict:
    """テスト用

    Returns:
        dict: hello world
    """
    return {"message": "Hello World"}


@app.get("/nikki")
async def get_nikki(created_by: int, from_date: str, number_ob_nikki: int = 10) -> Nikkis:
    """nikkiを取得する。
    Args:
        from_date (str): '%a, %d %b %Y %H:%M:%S %Z' フォーマットのdatetimeに変換されるstr
        max_length (10, optional): _description_. Defaults to 10.

    Returns:
        List[Nikki]: _description_
    """

    from_date = utc_str_to_datetime(utc=from_date)

    nikkis = get_nikkis(user_id=created_by, from_date=from_date,
                        number_of_nikki=number_ob_nikki)

    return nikkis.to_json(ensure_ascii=False)


@app.post("/nikki")
async def register_nikki(nikki: _Nikki) -> HTTPStatus:
    """
    nikki を登録する
    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    nikki: Nikki = api_to_orm(nikki)
    try:
        add_nikki(nikki=nikki)
        return HTTPStatus.OK
    except Exception as e:
        logging.error(e)
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=e.__str__)


@app.put("/nikki/{nikki_id}")
async def update_nikki(nikki_id: int, nikki: _Nikki) -> HTTPResponse:
    """nikkiを編集する

    Args:
        nikki_id (int): 編集するnikkiのid

    Returns:
        HTTPResponse: 成功なら200, 失敗なら400
    """
    try:
        nikki = api_to_orm(nikki)
        edit_nikki(nikki=nikki, nikki_id=nikki_id)
        return HTTPStatus.ACCEPTED
    except NoResultFound:
        HTTPException(HTTPStatus.BAD_REQUEST, "更新失敗")


@app.delete("/nikki/{nikki_id}")
async def delete_nikki(nikki_id: int) -> HTTPResponse:
    """nikkiを削除する

    Args:
        nikki_id (int): 編集するnikkiのid

    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    try:
        remove_nikki(nikki_id=nikki_id)
        return HTTPStatus.OK
    except Exception as error_of_delete_nikki:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail=error_of_delete_nikki.__str__)


@app.post("/user")
async def register_user(user: _User) -> HTTPStatus:
    """
    ユーザー登録する


    Returns:
        HTTPStatus: 成功なら200, 失敗なら500
    """
    try:
        add_user(user_info=user)
        return HTTPStatus.OK
    except IntegrityError as user_id_already_exist:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="既に存在するユーザーID") from user_id_already_exist
    except Exception as exc:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                            detail="api側でエラーが発生") from exc


@app.post("/login")
async def login(user_info: Login) -> UserStore or HTTPException:
    """
    ユーザーを検索する。一件だけデータが取得出来たら成功を返す。


    Returns:
        UserStore or HTTPException: 成功ならUserStoreに情報を格納して返す。 失敗したらHttpExceptionで400を返す
    """
    try:
        user_store = try_login(user_info.user_id, user_info.password)
        return user_store
    except NoResultFound as no_result:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="No Result Found") from no_result
    except MultipleResultsFound as multi_result:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="Multi Result Found") from multi_result


@app.get("/user/{user_id}")
async def is_exist_user_id(user_id: str) -> HTTPStatus or HTTPException:
    """ 既に存在するユーザーIDか調べる

    Args:
        user_id (str): ユーザーID

    Returns:
        bool: 存在すればtrue
    """
    try:
        try_get_one_user(user_id=user_id)
        return True
    except Exception:
        return False


@app.delete("/user/{user_id}")
async def delete_user_and_nikkis(user_id: str) -> HTTPStatus or HTTPException:
    """ ユーザーと、そのユーザーが作成したNikkiを削除する

    Args:
        user_id (str): User.user_id

    Returns:
        HTTPStatus or HTTPException: 成功なら200, 失敗なら400か500
    """
    # todo: user,nikki 削除部分を作ってテストする -> nikki_nuxt/pages/index.vue#L102 を見る
    try:
        remove_user_and_nikki(user_id=user_id)

        return HTTPStatus.ACCEPTED
    except Exception as e:
        print(f"in delete_user_and_nikkis, error = {e}")
        return HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "ユーザー情報削除失敗")


@app.get("/random")
async def publish_random_user() -> UserStore or HTTPException:
    try:
        user = create_random_user()
        id = add_user(user_info=user)
        user_store = UserStore(
            id=id, user_id=user.user_id, user_name=user.user_name)
        print(f"in publish_Random_user user_info={user_store}")
        return user_store
    except Exception as e:
        print(e)
        return HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "ランダムなユーザーを払いだすのに失敗した")
