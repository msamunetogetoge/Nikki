from datetime import datetime
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import NoResultFound

from db.model import Nikki, Nikkis
from db.dbconfig import DATABASE_URI


engine = create_engine(DATABASE_URI)
Session = sessionmaker(engine)


def get_nikkis(user_id: int, from_date: datetime, number_of_nikki: int = 10) -> Nikkis:
    """nikkiを取得する、

    Args:
        user_id (int): nikkiを書いたユーザーのid
        from_date (datetime): 最新のnikki作成日
        number_of_nikki (int, optional): nikkiを何件取り出すか Defaults to 10.

    Returns:
        Nikkis: 条件で取得した日記
    """
    session = Session()
    queryed_nikkis = session.query(Nikki).filter(
        Nikki.created_at >= from_date).filter(Nikki.created_by == user_id).order_by(Nikki.created_at.desc()).limit(number_of_nikki)
    nikkis = Nikkis(nikkis=list())
    for nikki in queryed_nikkis:
        nikkis.nikkis.append(nikki)
    return nikkis


def get_nikki(nikki_id: int) -> Nikki or NoResultFound:
    """Nikki.id でデータを取得する

    Args:
        nikki_id (int): nikkiのid

    Raises:
        e: NoResultFound idで検索してデータが取得できない時にエラーを排出する

    Returns:
        Nikki or NoResultFound: データを一件だけ取得出来ればデータを返す
    """
    session = Session()
    try:
        nikki = session.query(Nikki).filter(Nikki.id == nikki_id).one()
        session.close()
        return nikki
    except NoResultFound as no_result:
        logging.error(no_result)
        print(no_result)
        raise no_result


def add_nikki(nikki: Nikki) -> None or Exception:
    """dbにnikkiを登録する

    Args:
        nikki (Nikki): 登録したいnikki

    Returns:
        None or Exception: insert時にエラーが起きたらexception
    """
    session = Session()
    session.add(nikki)
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


def remove_nikki(nikki_id: int) -> None or NoResultFound:
    """ idを使ってnikkiを削除する。

    Args:
        nikki_id (int): nikkiのid

    Raises:
        error_of_select: nikki_idでnikkiが見つからない時のエラー
        e: 削除する。

    Returns:
        None or NoResultFound or Exception: 成功ならNone 失敗ならエラー
    """
    try:
        session = Session()
        nikki = session.query(Nikki).filter(Nikki.id == nikki_id).one()
        session.delete(nikki)
        session.commit()
    except NoResultFound as no_result:
        logging.error(no_result)
        raise no_result
