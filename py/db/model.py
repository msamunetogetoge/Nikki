import random
import string
from typing import List
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import Table, Column, Integer, String, DateTime, UniqueConstraint, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker


from pydantic import BaseModel
from dataclasses_json import dataclass_json

from db.dbconfig import DATABASE_URI
from secure.crypto import CIPHER


engine = create_engine(DATABASE_URI)
Session = sessionmaker(engine)

Base = declarative_base()

# table 定義

# todo:https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html#many-to-many
# を読んで nikkis, users の中間テーブルにする


nikkitag_table = Table(  # nikkis とtag の中間テーブル
    "nikkitag",
    Base.metadata,
    Column("nikki_id", ForeignKey("nikki.id"), primary_key=True),
    Column("tag_id", ForeignKey("tag.id"), primary_key=True),
)


# class NikkiTag(Base):
#     """Nikkiとtagを結びつけるテーブル

#     Args:
#         Base (_type_): _description_
#     """
#     __tablename__ = "nikkitag"
#     niiki_id = Column(Integer, ForeignKey("nikkis.id"), primary_key=True)
#     tag_id = Column(Integer, ForeignKey("users.id"), primary_key=True)


@dataclass_json
@dataclass
class Nikki(Base):
    """DBに日記を格納する為のモデル
    """
    __tablename__ = 'nikki'
    id: int = Column(Integer, primary_key=True, index=True)
    created_by: int = Column(Integer, nullable=False)
    title: str = Column(String, nullable=False)
    goodness: int = Column(Integer, default=10)
    summary: str = Column(String, nullable=False)
    content: str = Column(String, nullable=False)
    created_at: datetime = Column(DateTime(timezone=False), default=func.now())
    tags = relationship("Tag", secondary=nikkitag_table,
                        back_populates="nikkis")

    def __repr__(self) -> str:
        return f"<id={self.id}, created_by={self.created_by},title={self.title},tags={[tag.name for tag in self.tags]}>"


@dataclass_json
@dataclass
class Tag(Base):
    """DBにユーザーが作成したタグを保存するテーブル
    """
    __tablename__ = 'tag'
    id: int = Column(Integer, primary_key=True, index=True)
    created_by: int = Column(Integer, nullable=False)
    name: str = Column(String(50), nullable=False)
    nikkis = relationship("Nikki", secondary=nikkitag_table,
                          back_populates="tags")
    __table_args__ = (UniqueConstraint("created_by", "name",
                                       name="created_by_name_unique_constraint"),)

    def __repr__(self) -> str:
        return f"<id={self.id}, created_by={self.created_by}, name={self.name}, nikkis={[nikki.id for nikki in self.nikkis]}>"


@dataclass_json
@dataclass
class Tags():
    """Tagのリスト
    """
    tags: list[Tag]


class User(Base):
    """DBにユーザー情報を格納する為のモデル

    Args:
        Base (_type_): _description_
    """
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, unique=True)
    user_name = Column(String, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f'<User id={self.id},user_id={self.user_id}, user_name={self.user_name}>'


@dataclass_json
@dataclass
class Nikkis():
    """ Nikkiクラスのリスト
    """
    nikkis: list[Nikki]


class _Nikki(BaseModel):
    """FastAPIでdbのモデルを扱う為のクラス

    """
    id: int = None
    created_by: str
    title: str
    goodness: int
    summary: str
    content: str
    created_at: str
    tags: list[int]  # Tag.id のリスト

    class Config:
        """ sqlalchemy model -> pydantic modelの変換を許す設定
        """
        orm_mode = True


class _Tag(BaseModel):
    """ apiで使うTag
    """
    id: int | None
    name: str
    created_by: str
    nikkis: List[int]  # Nikki.idのリスト

    class Config:
        """ sqlalchemy model -> pydantic modelの変換を許す設定
        """
        orm_mode = True


class _Tags(BaseModel):
    """ front側からもらうtagのリスト。created_by が暗号化されている。

    Args:
        BaseModel (_type_): _description_
    """
    tags: list[_Tag]

    def to_decrypted(self) -> Tags:
        """
        created_by を複合化して、_Tag -> Tagに変換する

        Returns:
            Tags: tagのリスト
        """
        tags = []
        for _tag in self.tags:
            # + が " "になってるので変換する
            created_by = _tag.created_by.replace(" ", "+")
            created_by: int = CIPHER.decrypt_to_int(bytes(created_by, 'utf-8'))
            tag = Tag()
            tag.id = _tag.id
            tag.name = _tag.name
            tag.created_by = created_by
            tags.append(tag)
            tag.nikkis = get_nikkis_from_ids(_tag.nikkis)
        tags = Tags(tags=tags)
        return tags


def get_nikkis_from_ids(nikkis: list[int]) -> list[Nikki]:
    """list[Tag.id]から、tagを取得する

    Args:
        tags (list[int]): Tag.idのリスト

    Returns:
        list[Tag]: 検索で取得したTagのリスト
    """
    session = Session()
    nikkis = session.query(Nikki).filter(Nikki.id.in_(nikkis)).all()
    session.close()
    return nikkis


def get_tags_from_ids(tags: list[int]) -> list[Tag]:
    """list[Tag.id]から、tagを取得する

    Args:
        tags (list[int]): Tag.idのリスト

    Returns:
        list[Tag]: 検索で取得したTagのリスト
    """
    session = Session()
    tags = session.query(Tag).filter(Tag.id.in_(tags)).all()
    session.close()
    return tags


def api_to_orm(_nikki: _Nikki) -> Nikki or ValueError:
    """_Nikki をNikkiに変換する

    Args:
        _nikki (_Nikki): FastAPIで使用されるクラス

    Returns:
        Nikki or ValueError: 変換されたクラス or ValueError
    """
    try:
        created_at = utc_str_to_datetime(_nikki.created_at)
        created_by = CIPHER.decrypt_to_int(bytes(_nikki.created_by, "utf-8"))
        tags = get_tags_from_ids(_nikki.tags)
    except ValueError as error_of_utc_str_to_datetime:
        raise error_of_utc_str_to_datetime
    nikki = Nikki(id=_nikki.id,
                  created_by=created_by,
                  title=_nikki.title,
                  goodness=_nikki.goodness,
                  summary=_nikki.summary,
                  content=_nikki.content,
                  created_at=created_at,
                  )
    nikki.tags = tags
    return nikki


# todo: error のlogging する。loggingの設定必要
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
class UserStore():
    """nuxt側でユーザー情報を格納する為に使う
    """
    id: bytes
    user_id: str
    user_name: str


class Login(BaseModel):
    """loginの可否判定に使うクラス

    Args:
        BaseModel (_type_): 
    """
    user_id: str
    password: str


class PublicNikki(Base):
    __tablename__ = 'public_nikki'
    user_id = Column(Integer, primary_key=True)
    other_user_id = Column(Integer, primary_key=True)
    nikki_id = Column(Integer, primary_key=True)


# table 作成
def create_table():
    """テーブル作成
    """
    try:
        Base.metadata.create_all(engine)
        print("create table")
    except Exception as e:
        print(e)
        print("failed create table")
        pass
