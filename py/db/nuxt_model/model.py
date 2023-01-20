from datetime import datetime
import random
import string

from dataclasses import dataclass


from dataclasses_json import dataclass_json

from pydantic import BaseModel

from db.model import Nikki, Tag
from secure.crypto import CIPHER, decrypt_from_url_row_to_int


# nikki models


class _NikkiIn(BaseModel):
    """FastAPIでNuxt側からデータをもらう為のクラス

    """
    id: int = None
    created_by: str
    title: str
    goodness: int
    summary: str
    content: str
    created_at: str


class _TagIn(BaseModel):
    """ nuxtからもらうTagオブジェクト
    """
    id: int | None
    name: str
    created_by: str


class NikkiWithTagIn(BaseModel):
    """nikkiとtagのペアを表すオブジェクト
    tagをあばば
    """
    nikki: _NikkiIn
    tags: list[_TagIn]


class _TagOut(BaseModel):
    """nuxtへ渡すTagオブジェクト
    Args:
        BaseModel (_type_): _description_
    """
    id: int
    name: str
    created_by: str

    class Config:
        orm_mode = True


class _NikkiOut(BaseModel):
    """FastAPIでNuxt側へデータをあげる為のクラス

    """
    id: int
    created_by: str
    title: str
    goodness: int
    summary: str
    content: str
    created_at: float
    tags: list[_TagOut]

    class Config:
        orm_mode = True


def utc_str_to_datetime(utc: str) -> datetime or ValueError:
    """js のdateObj.toUTCString() で生成された文字列をdatetimeに変換する

    Args:
        utc (str): Www, dd Mmm yyyy hh:mm:ss GMT

    Raises:
        e: datetime.strptime から排出されるエラー

    Returns:
        datetime or ValueError: datetime.strptime(utc, "%a, %d %b %Y %H:%M:%S %Z") の結果
    """
    try:
        date_time = datetime.strptime(utc, "%a, %d %b %Y %H:%M:%S %Z")
        return date_time
    except ValueError as error_of_strptime:

        raise error_of_strptime


def to_decrypted_nikki(_nikki: NikkiWithTagIn) -> Nikki or ValueError:
    """_Nikki をNikkiに変換する

    Args:
        _nikki (_Nikki): FastAPIで使用されるクラス

    Returns:
        Nikki or ValueError: 変換されたクラス or ValueError
    """
    try:
        created_at = utc_str_to_datetime(_nikki.nikki.created_at)
        created_by = CIPHER.decrypt_to_int(
            bytes(_nikki.nikki.created_by, "utf-8"))
        tags = to_decrypted_tags(_nikki.tags)
    except ValueError as error_of_utc_str_to_datetime:
        raise error_of_utc_str_to_datetime
    nikki = Nikki(id=_nikki.nikki.id,
                  created_by=created_by,
                  title=_nikki.nikki.title,
                  goodness=_nikki.nikki.goodness,
                  summary=_nikki.nikki.summary,
                  content=_nikki.nikki.content,
                  created_at=created_at)
    nikki.tags = tags
    return nikki


def to_crypted_nikki(nikki: Nikki) -> _NikkiOut:
    """ nikkiの作成者を暗号化して返す。

    Args:
        nikki (Nikki): Nikkiオブジェクト

    Returns:
        _NikkiOut:nuxtに渡すnikkiオブジェクト
    """
    created_at = nikki.created_at.timestamp()
    crypted_tags = [to_crypted_tag(tag) for tag in nikki.tags]
    _nikki = _NikkiOut(id=nikki.id,
                       created_by=CIPHER.encrypt(str(nikki.created_by)),
                       created_at=created_at,
                       title=nikki.title,
                       goodness=nikki.goodness,
                       content=nikki.content,
                       summary=nikki.summary,
                       tags=crypted_tags)
    return _nikki


class TagWithNikkiIn(BaseModel):
    """tagとnikkiのペアを表すオブジェクト
    nuxtから貰う予定
    """
    tag: _TagIn
    nikkis: list[_NikkiIn]


def to_decrypted_tags(tags_in: list[_TagIn], ) -> list[Tag]:
    """
       created_by を複合化して、_Tag -> Tagに変換する

       Returns:
           Tags: tagのリスト
       """
    tags = []
    for _tag in tags_in:
        created_by = decrypt_from_url_row_to_int(_tag.created_by)
        tag = Tag()
        tag.id = _tag.id
        tag.name = _tag.name
        tag.created_by = created_by
        tags.append(tag)

    return tags


def to_crypted_tag(tag: Tag) -> _TagOut:
    """ Tag オブジェクトの作成者を暗号化する。

    Args:
        tag (Tag): dbから持ってきたデータ

    Returns:
        _TagOut: 暗号化したデータ
    """
    _tag = _TagOut(id=tag.id, name=tag.name,
                   created_by=CIPHER.encrypt(str(tag.created_by)))
    return _tag

# user models


class _User(BaseModel):
    """pydantic でUserを扱う為のクラス

    """
    id: int or None = None
    user_id: str
    user_name: str
    password: str

    class Config:
        """ sqlalchemy model -> pydantic modelの変換を許す設定
        """
        orm_mode = True


def create_random_user() -> _User:
    """ ユーザー登録せずにNikkiを利用したい時、適当なユーザー情報を作る為に使用する。
    ランダムな文字列([a-zA-Z])を使用してユーザー情報を作成する。user_nameは固定。

    Returns:
        _User: user_id,password がランダムな文字列なユーザー情報
    """
    user_id = get_random_str()
    password = get_random_str()
    user_name = "おためしNikkiユーザー"
    return _User(id=None, user_id=user_id, user_name=user_name, password=password)


def get_random_str(min_length=5, max_length=32) -> str:
    """[a-zA-Z]からランダムに文字を取得して文字列を作成する。文字列の長さは、min_lengthからmax_lengthの間の数字からランダムに選んで決める。

    Args:
        min_length (int, optional): 文字列の長さの最小値. Defaults to 5.
        max_length (int, optional): 文字列の長さの最大値. Defaults to 32.

    Returns:
        str: 生成された文字列
    """
    random_str = ""
    str_length = random.randrange(min_length, max_length)
    for _ in range(str_length):
        random_str += random.choice(string.ascii_letters)
    return random_str


@dataclass_json
@dataclass
class UserStore(BaseModel):
    """nuxt側でユーザー情報を格納する為に使う
    """
    id: bytes
    user_id: str
    user_name: str


class Login(BaseModel):
    """loginの可否判定に使うクラス

    """
    user_id: str
    password: str
