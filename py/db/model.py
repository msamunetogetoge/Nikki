from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.sql import func

from pydantic import BaseModel


DATABASE_URI = 'postgresql+psycopg2://nikki_user:PHJUPQm7nprzF3EzcqOZ854l3AqygjvU@dpg-cctn76pa6gdgmf2lgfqg-a.oregon-postgres.render.com/nikki'

engine = create_engine(DATABASE_URI)


Base = declarative_base()

# table 定義


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
    created_at: datetime = Column(DateTime(timezone=True), default=func.now())


class _Nikki(BaseModel):
    """FastAPIでdbのモデルを扱う為のクラス

    """
    id: int
    created_by: int
    title: str
    goodness: int
    summary: str
    content: str
    created_at: datetime = None

    class Config:
        """ sqlalchemy model -> pydantic modelの変換を許す設定
        """
        orm_mode = True


def api_to_orm(_nikki: _Nikki) -> Nikki:
    """_Nikki をNikkiに変換する

    Args:
        _nikki (_Nikki): FastAPIで使用されるクラス

    Returns:
        Nikki: 変換されたクラス
    """
    nikki = Nikki(id=_nikki.id,
                  created_by=_nikki.created_by,
                  title=_nikki.title,
                  goodness=_nikki.goodness,
                  summary=_nikki.summary,
                  content=_nikki.content,
                  created_at=_nikki.created_at)
    return nikki


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


class _User(BaseModel):
    """pydantic でUserを扱う為のクラス

    """
    id: int
    user_id: str
    user_name: str
    password: str

    class Config:
        """ sqlalchemy model -> pydantic modelの変換を許す設定
        """
        orm_mode = True


class PublicNikki(Base):
    __tablename__ = 'public_nikki'
    user_id = Column(Integer, primary_key=True)
    other_user_id = Column(Integer, primary_key=True)
    nikki_id = Column(Integer, primary_key=True)


# table 作成
try:
    Base.metadata.create_all(engine)
    print("create table")
except Exception as e:
    print(e)
    print("failed create table")
    pass
