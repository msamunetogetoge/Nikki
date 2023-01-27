"""
nikki 編集、登録、公開範囲の設定などを処理するapi
HttpStatusを返したくなったらhttps://fastapi.tiangolo.com/ja/advanced/additional-status-codes/ を参照する。
"""


from secure.crypto import CIPHER, decrypt_from_url_row_to_int
from http import HTTPStatus
import logging
from fastapi import FastAPI, HTTPException


from sqlalchemy.exc import NoResultFound, MultipleResultsFound, IntegrityError

from db.model import Nikki, Tag
from db.nuxt_model.model import _NikkiOut, to_decrypted_nikki, to_crypted_nikki, NikkiWithTagIn, utc_str_to_datetime, _User, _UserInfo, UserStore, Login, create_random_user, _TagOut, to_crypted_tag
from db.crud import get_nikkis, add_nikki, remove_nikki, try_get_one_user, add_user, try_login, edit_nikki, remove_user_and_nikki, search_nikkis, update_user, NikkiSearchParamsEncrypted, get_tags, delete_tag

app = FastAPI()


@app.get("/")
async def root():
    """テスト用

    Returns:
        dict: hello world
    """
    return {"message": "Hello World"}


@app.get("/nikki", response_model=list[_NikkiOut])
def get_nikki(created_by: str, from_date: str, number_of_nikki: int = 10) -> list[_NikkiOut]:
    """nikkiを取得する。
    Args:
        from_date (str): '%a, %d %b %Y %H:%M:%S %Z' フォーマットのdatetimeに変換されるstr
        max_length (10, optional): _description_. Defaults to 10.

    Returns:
        List[Nikki]: 検索結果のNikkiのリスト
    """
    try:
        from_date = utc_str_to_datetime(utc=from_date)
        created_by: int = decrypt_from_url_row_to_int(created_by)

        nikkis = get_nikkis(user_id=created_by, from_date=from_date,
                            number_of_nikki=number_of_nikki)

        nikkis: list[_NikkiOut] = [to_crypted_nikki(nikki) for nikki in nikkis]
        return nikkis
    except Exception as value_error:
        print(value_error)
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            "データの改ざんがあった") from value_error


@app.post("/search/nikki", response_model=list[_NikkiOut])
def search_nikki_detail(search_params_encrypted: NikkiSearchParamsEncrypted) -> list[_NikkiOut]:
    """色々なパラメーターを指定して、Nikkiを検索する。
    from_date, to_dateは、from_date ~ to_date の間に作成したNikkiを取得するのに使う。
    from_date, to_dateはjsのDate.toUtcString() で変換されたフォーマット("%a, %d %b %Y %H:%M:%S %Z")でないとエラーになる

    Args:
        search_params: 検索パラメータ

    Returns:
        Nikkis: 検索に引っかかったNikki
    """
    nikkis = []

    try:
        search_params = search_params_encrypted.to_decrypted()
        nikkis = search_nikkis(search_params)
        nikkis: list[_NikkiOut] = [to_crypted_nikki(nikki) for nikki in nikkis]
        return nikkis
    except Exception as exception_of_search_nikki:
        print(exception_of_search_nikki)
        return HTTPException(HTTPStatus.BAD_REQUEST, detail="検索に失敗した")


@app.post("/nikki")
async def register_nikki(nikki: NikkiWithTagIn):
    """
    nikki を登録する
    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    nikki: Nikki = to_decrypted_nikki(nikki)
    try:
        add_nikki(nikki=nikki)
        return HTTPStatus.OK
    except Exception as e:
        logging.error(e)
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="登録に失敗した")


@app.put("/nikki/{nikki_id}")
async def update_nikki(nikki_id: int, _nikki: NikkiWithTagIn):
    """nikkiを編集する

    Args:
        nikki_id (int): 編集するnikkiのid

    Returns:
        HTTPResponse: 成功なら200, 失敗なら400
    """
    try:
        nikki = to_decrypted_nikki(_nikki)

        edit_nikki(nikki=nikki, nikki_id=nikki_id)
        return HTTPStatus.ACCEPTED
    except NoResultFound:
        raise HTTPException(HTTPStatus.BAD_REQUEST, "更新失敗")


@app.delete("/nikki/{nikki_id}")
async def delete_nikki(nikki_id: int):
    """nikkiを削除する

    Args:
        nikki_id (int): 編集するnikkiのid

    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    try:
        remove_nikki(nikki_id=nikki_id)
        return HTTPStatus.ACCEPTED
    except Exception as error_of_delete_nikki:
        print(error_of_delete_nikki)
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="削除に失敗した")


@app.get("/tag", response_model=list[_TagOut])
def get_tag(created_by: str) -> list[_TagOut]:
    """nikkiを取得する。
    Args:
        created_by : 暗号化されたUser.id

    Returns:
        List[Nikki]: 検索結果のNikkiのリスト
    """
    try:
        created_by: int = decrypt_from_url_row_to_int(created_by)
        tags: list[Tag] = get_tags(user_id=created_by)
        tags: list[_TagOut] = [to_crypted_tag(tag) for tag in tags]
        return tags
    except Exception as value_error:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            "データの改ざんがあった") from value_error


# todo: post,put を別々にする
# @app.post("/tag")
# def post_tag(tags:_TagIn) -> None | HTTPException:
#     """tagを保存する。(updateも含む?)
#         todo: sqlalchemy の仕様を確認した方がいい。単純にadd_allが駄目なら put で(個別に)アップデート専用にするか、アップデートはしない。
#     Args:
#         tags (_Tags): tagのリスト

#     Raises:
#         e: 失敗したらHttpExceptionでBadRequestを返す
#     """
#     try:
#         decrypted_tags: Tags = tags.to_decrypted()
#         register_tags(decrypted_tags)
#         return
#     except Exception as register_failed:
#         print(register_failed)
#         raise HTTPException(HTTPStatus.BAD_REQUEST,
#                             "登録に失敗した") from register_failed


@app.post("/tag/delete")
def delete_tags(tag_ids: list[int]):
    """タグのid(Tag.id)のリストからタグを削除する。
    delete でなくてpostなのに注意。

    Args:
        tag_ids (list[int]): タグのid(Tag.id)のリスト

    Raises:
        HTTPException: 削除失敗

    Returns:
        None | HTTPException: 成功ならNone(HttpStatus.Ok?)
    """
    try:
        delete_tag(tag_ids)
        return HTTPStatus.ACCEPTED
    except Exception as delete_failed:
        print(delete_failed)
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            "削除に失敗した") from delete_failed


@app.post("/user")
async def register_user(user: _User):
    """
    ユーザー登録する


    Returns:
        HTTPStatus: 成功なら200, 失敗なら500
    """
    try:
        crepted_id = add_user(user_info=user)
        return crepted_id
    except IntegrityError as user_id_already_exist:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="既に存在するユーザーID") from user_id_already_exist
    except Exception as exc:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                            detail="api側でエラーが発生") from exc


@app.put("/user")
def register_trial_user(user: _UserInfo):
    """お試しユーザーを登録する。

    Args:
        user (_TrialUser): ユーザー情報

    Raises:
        HTTPException: _description_
    """
    try:
        update_user(user)
        return user.crypted_id
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="お試しユーザー登録に失敗した。")


@app.post("/login", response_model=UserStore)
async def login(user_info: Login):
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
async def is_exist_user_id(user_id: str):
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
async def delete_user_and_nikkis(user_id: str):
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


@app.get("/random", response_model=UserStore)
async def publish_random_user():
    """ランダムに作成した文字列のID,passwordを持ったユーザーを払いだす

    Returns:
        UserStore | HTTPException: 成功したらユーザー情報、失敗したらexception
    """
    try:
        user = create_random_user()
        id_of_user = add_user(user_info=user)
        user_store = UserStore(
            id=id_of_user, user_id=user.user_id, user_name=user.user_name)
        return user_store
    except Exception as e:
        print(e)
        return HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "ランダムなユーザーを払いだすのに失敗した")
