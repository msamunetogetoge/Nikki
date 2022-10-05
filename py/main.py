"""
nikki 編集、登録、公開範囲の設定などを処理するapi
"""


from typing import Union
from http.client import HTTPResponse
from fastapi import FastAPI
from pydantic import BaseModel

from db.model import Nikki, _Nikki, User, _User

app = FastAPI()


@app.get("/")
async def root() -> dict:
    """テスト用

    Returns:
        dict: hello world
    """
    return {"message": "Hello World"}


@app.post("/nikki")
async def register_nikki(nikki: _Nikki) -> HTTPResponse:
    """
    nikki を登録する
    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    return


@app.put("/nikki/{nikki_id}")
async def edit_nikki(nikki_id: int) -> HTTPResponse:
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

    return


@app.post("/user")
async def register_user(user: _User) -> HTTPResponse:
    """
    ユーザー登録する


    Returns:
        HTTPResponse: 成功なら200, 失敗なら500
    """
    return
