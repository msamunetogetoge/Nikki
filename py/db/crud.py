
from datetime import datetime
from dataclasses import dataclass, field
import logging

from pydantic import BaseModel, Field


from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import NoResultFound, MultipleResultsFound

from db.model import Nikki, User, Tag
from db.nuxt_model.model import _User, UserStore, utc_str_to_datetime
# from db.nuxt_model.user import _User, UserStore
# from db.nuxt_model.nikki import utc_str_to_datetime
from db.dbconfig import DATABASE_URI
from secure.crypto import CIPHER, decrypt_from_url_row_to_int

engine = create_engine(DATABASE_URI)
Session = sessionmaker(engine)


@dataclass
class NikkiSearchParams:
    """
        created_by (int): User.id Nikki作成者
        to_date (str): Nikki作成日to
        from_date (str|None, optional): Nikki作成日from. Defaults to None.
        title_or_contents (str|None, optional): Nikki.title, Nikki.content, Nikki.summary. Defaults to None.
        goodness_min (int, optional): Nikki.goodness 最低. Defaults to 0.
        goodness_max (int, optional): Nikki.goodness 最高. Defaults to 10.
        number_of_nikki (int, optional): Nikkiを何件まで取得するか. Defaults to 50.
    """
    created_by: int
    to_date: str
    from_date: str | None = None
    title_or_contents: str | None = None
    goodness_min: int = 0
    goodness_max: int = 10
    number_of_nikki: int = 50
    tags: list[int] = field(default_factory=list)


class NikkiSearchParamsEncrypted(BaseModel):
    """
        created_byが暗号化された
        created_by (str): User.id Nikki作成者
        to_date (str): Nikki作成日to
        from_date (str|None, optional): Nikki作成日from. Defaults to None.
        title_or_contents (str|None, optional): Nikki.title, Nikki.content, Nikki.summary. Defaults to None.
        goodness_min (int, optional): Nikki.goodness 最低. Defaults to 0.
        goodness_max (int, optional): Nikki.goodness 最高. Defaults to 10.
        number_of_nikki (int, optional): Nikkiを何件まで取得するか. Defaults to 50.
        tags: タグのidたち
    """
    created_by: str
    to_date: str
    from_date: str | None = None
    title_or_contents: str | None = None
    goodness_min: int = 0
    goodness_max: int = 10
    number_of_nikki: int = 50
    tags: list[int] = Field(default_factory=list)

    def to_decrypted(self) -> NikkiSearchParams:
        """created_by をintに複合化して、NikkiSearchParamsを作成する

        Returns:
            NikkiSearchParams:
        """
        created_by = decrypt_from_url_row_to_int(self.created_by)
        return NikkiSearchParams(created_by, self.to_date, self.from_date, self.title_or_contents, self.goodness_min, self.goodness_max, tags=self.tags)


def get_nikkis(user_id: int, from_date: datetime, number_of_nikki: int = 10) -> list[Nikki]:
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
        Nikki.created_at <= from_date).filter(Nikki.created_by == user_id).order_by(Nikki.created_at.desc()).limit(number_of_nikki).all()

    return queryed_nikkis


def search_nikkis(search_params: NikkiSearchParams) -> list[Nikki] | ValueError:
    """ もらったsearchp_aramsでNikkiを検索する。

    Args:

    Returns:
        Nikkis: 検索に引っかかったNikki. from_date, to_dateのフォーマットが変な時はValueError
    """
    session = Session()
    to_date = utc_str_to_datetime(utc=search_params.to_date)
    queryed_nikkis = session.query(Nikki).filter(
        Nikki.created_by == search_params.created_by).filter(Nikki.created_at <= to_date)
    if search_params.from_date is not None:
        from_date = search_params.from_date
        from_date = utc_str_to_datetime(utc=from_date)
        queryed_nikkis = queryed_nikkis.filter(
            from_date <= Nikki.created_at)
    if search_params.title_or_contents is not None:
        title_or_contents = search_params.title_or_contents
        queryed_nikkis = queryed_nikkis.filter(or_(Nikki.content.contains(title_or_contents),
                                                   Nikki.title.contains(
                                                       title_or_contents),
                                                   Nikki.summary.contains(title_or_contents))
                                               )
    if search_params.goodness_min != 0:
        queryed_nikkis = queryed_nikkis.filter(
            search_params.goodness_min <= Nikki.goodness)
    if search_params.goodness_max != 10:
        queryed_nikkis = queryed_nikkis.filter(
            Nikki.goodness <= search_params.goodness_max)
    if len(search_params.tags) > 0:
        for tag in queryed_nikkis.tags:
            queryed_nikkis = queryed_nikkis.filter(tag in Nikki.tags)
    queryed_nikkis = queryed_nikkis.order_by(Nikki.created_at.desc())
    queryed_nikkis = queryed_nikkis.limit(search_params.number_of_nikki).all()

    return queryed_nikkis


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
        raise no_result
    finally:
        session.close()


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
        nikki_edit.tags = nikki.tags
        session.commit()
        return None
    except NoResultFound as no_result:
        logging.error(no_result)
        raise no_result
    finally:
        session.close()


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
    finally:
        session.close()


def get_tags(user_id: int) -> list[Tag]:
    """user_id(User.id)と、Tag.created_byとを結び付けてセレクトする。

    Args:
        user_id (int): User.id

    Returns:
        Tags: 検索で取得したtag
    """
    session = Session()
    queryed_tags = session.query(Tag).filter(Tag.created_by == user_id).all()
    session.close()
    return queryed_tags


def register_tags(tags: list[Tag]) -> None | Exception:
    """tagを登録する

    Args:
        tags (Tags): tagたち

    Raises:
        error_of_register_tag: 登録エラー

    Returns:
        None | Exception:成功すればNone を返す
    """
    session = Session()
    session.add_all(tags)
    try:
        session.commit()
        return
    except Exception as error_of_register_tag:
        session.rollback()
        raise error_of_register_tag
    finally:
        session.close()


def delete_tag(tag_ids: list[int]) -> None | Exception:
    """tagのTag.idのリストからタグを削除する。

    Args:
        tag_ids (list[int]): list[Tag.id]

    Raises:
        delete_failed: 削除に失敗したときのエラー

    Returns:
        None | Exception: 成功すればNoneを返す。
    """
    try:
        session = Session()
        tags = session.query(Tag).filter(Tag.id.in_(tag_ids))
        if len(tags.all()) == 0:
            return
        tags.delete()
        session.commit()
    except Exception as delete_failed:
        session.rollback()
        raise delete_failed
    finally:
        session.close()


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
    finally:
        session.close()


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
        userid = CIPHER.encrypt(str(user_info.id))
        return UserStore(id=userid, user_id=user_info.user_id, user_name=user_info.user_name)
    except NoResultFound as no_result:
        logging.error(no_result)
        raise no_result
    except MultipleResultsFound as multi_result:
        logging.error(multi_result)
        raise multi_result
    finally:
        session.close()


def add_user(user_info: _User) -> int or Exception:
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
        id = user.id
        session.delete(user)
        session.commit()
    except Exception as e:
        session.rollback()
        logging.error(e)
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
