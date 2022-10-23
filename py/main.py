"""
nikki 編集、登録、公開範囲の設定などを処理するapi
"""


from http import HTTPStatus
from typing import Union, List
from http.client import HTTPResponse
import logging
from fastapi import FastAPI
from pydantic import BaseModel

from sqlalchemy.exc import NoResultFound

from db.model import Nikki, _Nikki, User, _User, Nikkis, utc_str_to_datetime, api_to_orm
from db.crud import get_nikkis, add_nikki, remove_nikki

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
    print(f"from_date = {from_date}")
    from_date = utc_str_to_datetime(utc=from_date)
    print(f"from_date = {from_date}")
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
        print(e)
        return HTTPStatus.BAD_REQUEST


@app.put("/nikki/{nikki_id}")
async def edit_nikki(nikki: _Nikki) -> HTTPResponse:
    """nikkiを編集する

    Args:
        nikki_id (int): 編集するnikkiのid

    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    return


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
    except Exception:
        return HTTPStatus.BAD_REQUEST


@app.post("/user")
async def register_user(user: _User) -> HTTPResponse:
    """
    ユーザー登録する


    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    return
