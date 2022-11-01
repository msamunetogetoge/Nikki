from dataclasses import dataclass
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.sql import func
from typing import List

from pydantic import BaseModel
from dataclasses_json import dataclass_json

from db.dbconfig import DATABASE_URI


engine = create_engine(DATABASE_URI)


Base = declarative_base()

# table 定義


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


@dataclass_json
@dataclass
class Nikkis():
    """ Nikkiクラスのリスト
    """
    nikkis: List[Nikki]


class _Nikki(BaseModel):
    """FastAPIでdbのモデルを扱う為のクラス

    """
    id: int = None
    created_by: int
    title: str
    goodness: int
    summary: str
    content: str
    created_at: str

    class Config:
        """ sqlalchemy model -> pydantic modelの変換を許す設定
        """
        orm_mode = True


def api_to_orm(_nikki: _Nikki) -> Nikki or ValueError:
    """_Nikki をNikkiに変換する

    Args:
        _nikki (_Nikki): FastAPIで使用されるクラス

    Returns:
        Nikki or ValueError: 変換されたクラス or ValueError
    """
    try:
        created_at = utc_str_to_datetime(_nikki.created_at)
    except ValueError as error_of_utc_str_to_datetime:
        raise error_of_utc_str_to_datetime
    nikki = Nikki(id=_nikki.id,
                  created_by=_nikki.created_by,
                  title=_nikki.title,
                  goodness=_nikki.goodness,
                  summary=_nikki.summary,
                  content=_nikki.content,
                  created_at=created_at)
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


class User(Base):
    """DBにユーザー情報を格納する為のモデル

    Args:
        Base (_type_): _description_
    """
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f'<User id={self.id},user_id={self.user_id}, user_name={self.user_name}>'


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


@dataclass_json
@dataclass
class UserStore():
    id: int
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
    try:
        Base.metadata.create_all(engine)
        print("create table")
    except Exception as e:
        print(e)
        print("failed create table")
        pass
