
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import Table, Column, Integer, String, DateTime, UniqueConstraint, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from dataclasses_json import dataclass_json

from db.dbconfig import DATABASE_URI


engine = create_engine(DATABASE_URI)

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
    tags = relationship("Tag", secondary=nikkitag_table)

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
    __table_args__ = (UniqueConstraint("created_by", "name",
                                       name="created_by_name_unique_constraint"),)

    def __repr__(self) -> str:
        return f"<id={self.id}, created_by={self.created_by}, name={self.name}>"


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
