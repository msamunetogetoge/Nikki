from datetime import datetime
import logging
from unicodedata import name
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import NoResultFound, MultipleResultsFound

from db.model import Nikki, Nikkis, User, _User, UserStore
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
        Nikki.created_at <= from_date).filter(Nikki.created_by == user_id).order_by(Nikki.created_at.desc()).limit(number_of_nikki)
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

# todo:main.py からedit_nikkiを呼ぶようにする。


def edit_nikki(nikki: Nikki, nikki_id: int) -> None or Exception:
    """Nikkiをupdateする。

    Args:
        nikki (Nikki): Nikkiデータ
        nikki_id (int): 更新したいNikkiのid

    Raises:
        no_result: データが取得出来ないときのエラー

    Returns:
        None or Exception: _description_
    """
    session = Session()
    try:
        nikki_edit = session.query(Nikki).filter(Nikki.id == nikki_id).one()
        nikki_edit.summary = nikki.summary
        nikki_edit.content = nikki.content
        nikki_edit.goodness = nikki.goodness
        session.commit()
        return None
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


def try_get_one_user(user_id: str) -> None or Exception:
    """DBにuserの情報があるか検索する。user_id, passwordのペアで検索して、一つだけデータが取得出来たらNoneを返す。

    Args:
        user_name (str): User.user_id
        password (str): User.password

    Raises:
        no_result: データが一つも取得できないか、二つ以上取得出来た時にraise

    Returns:
        None or Exception: okかエラー
    """
    session = Session()
    try:
        _ = session.query(User).filter(User.user_id == user_id).one()

    except NoResultFound as no_result:
        logging.error(no_result)
        raise no_result
    except MultipleResultsFound as multi_result:
        logging.error(multi_result)
        raise multi_result
    finally:
        session.close()
    return


def try_login(user_id: str, password: str) -> UserStore or Exception:
    """DBにuserの情報があるか検索する。user_id, passwordのペアで検索して、一つだけデータが取得出来たらNoneを返す。

    Args:
        user_name (str): User.user_id
        password (str): User.password

    Raises:
        no_result: データが一つも取得できないか、二つ以上取得出来た時にraise

    Returns:
        UserStore or Exception: userの情報かエラー
    """
    session = Session()
    try:
        user_info = session.query(User).filter(User.user_id == user_id).filter(
            User.password == password).one()
        session.close()
        return UserStore(id=user_info.id, user_id=user_info.user_id, user_name=user_info.user_name)
    except NoResultFound as no_result:
        logging.error(no_result)
        raise no_result
    except MultipleResultsFound as multi_result:
        logging.error(multi_result)
        raise multi_result


def add_user(user_info: _User) -> int:
    """ ユーザーを登録する。

    Args:
        user_info (_User):  ユーザー情報

    Raises:
        e: 登録エラー
    """
    session = Session()
    user = User(id=None, user_id=user_info.user_id,
                user_name=user_info.user_name, password=user_info.password)
    session.add(user)
    try:
        session.commit()
        created_user = session.query(User).filter(
            User.user_id == user.user_id).one()
        return created_user.id
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def remove_user_and_nikki(user_id: str) -> None or Exception:
    """_summary_

    Args:
        user_id (str): _description_

    Raises:
        e: _description_

    Returns:
        None or Exception: _description_
    """
    try:
        session = Session()
        user = session.query(User).filter(User.user_id == user_id).one()
        print(user)
        id = user.id
        session.delete(user)
        session.commit()
    except Exception as e:
        session.rollback()
        logging.error(e)
        print(f"remove_user_and_nikki, error={e}")
        raise e
    try:
        nikkis = session.query(Nikki).filter(Nikki.created_by == id)
        if len(nikkis.all()) == 0:  # データが無い時は処理終了
            return
        nikkis.delete()
        session.commit()
    except Exception as e:
        logging.error(e)
        session.rollback()
        raise e
    finally:
        session.close()
