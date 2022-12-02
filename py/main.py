"""
nikki 編集、登録、公開範囲の設定などを処理するapi
"""


from secure.crypto import CIPHER
from http import HTTPStatus
from http.client import HTTPResponse
import logging
from fastapi import FastAPI, HTTPException


from sqlalchemy.exc import NoResultFound, MultipleResultsFound, IntegrityError

from db.model import Nikki, _Nikki, Login, _User, Nikkis, UserStore, utc_str_to_datetime, api_to_orm, create_random_user
from db.crud import get_nikkis, add_nikki, remove_nikki, try_get_one_user, add_user, try_login, edit_nikki, remove_user_and_nikki, search_nikkis, NikkiSearchParams, NikkiSearchParamsEncrypted

app = FastAPI()


@app.get("/")
async def root() -> dict:
    """テスト用

    Returns:
        dict: hello world
    """
    return {"message": "Hello World"}


@app.get("/nikki")
def get_nikki(created_by: str, from_date: str, number_ob_nikki: int = 10) -> Nikkis:
    """nikkiを取得する。
    Args:
        from_date (str): '%a, %d %b %Y %H:%M:%S %Z' フォーマットのdatetimeに変換されるstr
        max_length (10, optional): _description_. Defaults to 10.

    Returns:
        List[Nikki]: 検索結果のNikkiのリスト
    """
    try:
        from_date = utc_str_to_datetime(utc=from_date)
        created_by = created_by.replace(" ", "+")  # + が " "になってるので変換する
        created_by: int = CIPHER.decrypt_to_int(bytes(created_by, 'utf-8'))

        nikkis = get_nikkis(user_id=created_by, from_date=from_date,
                            number_of_nikki=number_ob_nikki)
        return nikkis.to_json(ensure_ascii=False)
    except Exception as value_error:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            "データの改ざんがあった") from value_error


@app.post("/search/nikki")
def search_nikki_detail(search_params_encrypted: NikkiSearchParamsEncrypted) -> Nikkis:
    """色々なパラメーターを指定して、Nikkiを検索する。
    from_date, to_dateは、from_date ~ to_date の間に作成したNikkiを取得するのに使う。
    from_date, to_dateはjsのDate.toUtcString() で変換されたフォーマット("%a, %d %b %Y %H:%M:%S %Z")でないとエラーになる

    Args:
        search_params: 検索パラメータ

    Returns:
        Nikkis: 検索に引っかかったNikki
    """
    nikkis = Nikkis([])

    try:
        search_params = search_params_encrypted.toDecrypted()
        nikkis = search_nikkis(search_params)
        return nikkis.to_json(ensure_ascii=False)
    except Exception as exception_of_search_nikki:
        print(exception_of_search_nikki)
        return HTTPException(HTTPStatus.BAD_REQUEST, detail="検索に失敗した")


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
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="登録に失敗した")


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
        raise HTTPException(HTTPStatus.BAD_REQUEST, "更新失敗")


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
        print(error_of_delete_nikki)
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="削除に失敗した")


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
        print(user_store)
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
        id_of_user = add_user(user_info=user)
        id_of_user = CIPHER.encrypt(id_of_user)
        user_store = UserStore(
            id=id_of_user, user_id=user.user_id, user_name=user.user_name)
        print(f"in publish_Random_user user_info={user_store}")
        return user_store
    except Exception as e:
        print(e)
        return HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "ランダムなユーザーを払いだすのに失敗した")
