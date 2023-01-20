import argparse

from sqlalchemy import create_engine, MetaData, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text


from db.model import Nikki, User, Tag, PublicNikki, Base

# コマンドライン引数受け取り設定
parser = argparse.ArgumentParser()
parser.add_argument("old_DB_URI", type=str, help="the 'OLD' DB URI")
parser.add_argument("new_DB_URI", type=str, help="the 'NEW' DB URI")
parser.add_argument("-v", "--verbose", action="count",
                    help="show old db schema 1-> old only, 2>= -> old and new")
args = parser.parse_args()


# 旧DB
OLD_URI = args.old_DB_URI
# 新DB
NEW_URI = args.new_DB_URI
test_sql = text("SELECT 1")


### 接続チェック始まり ###

try:
    old_engine = create_engine(OLD_URI)
except Exception as e:
    print("old_DB_URI が不正")
    raise e
try:
    old_engine.execute(test_sql)
    print("古いDBに接続成功")
except Exception as e:
    print(e)
    print("old DB URI に接続できなかった")
    raise e

if args.verbose is not None and args.verbose >= 1:
    print("OLD DB SCHEMA")
    metadata = MetaData()
    metadata.reflect(old_engine)
    insp = inspect(old_engine)

    for table_name in metadata.tables:
        print(table_name)
        for column in insp.get_columns(table_name):
            for name, value in column.items():
                print('  ', end='')
                if value:
                    field = name if value in [True, 'auto'] else value
                    print(field, end=' ')
            print()

try:
    new_engine = create_engine(NEW_URI)
except Exception as e:
    print("new_DB_URI が不正")
    raise e
try:
    new_engine.execute(test_sql)
    print("新しいDBに接続成功")
except Exception as e:
    print(e)
    print("new DB URI に接続できなかった")
    raise e
### 接続チェック終わり ###

### table 等コピー ###
print("新しい環境の掃除")
Base.metadata.drop_all(new_engine)
print("新しい環境の掃除終わり")
print("テーブル作成開始")
Base.metadata.create_all(new_engine)
print("テーブル作成終了")
if args.verbose is not None and args.verbose >= 2:
    print("新しいDBのスキーマ")
    metadata = MetaData()
    metadata.reflect(new_engine)
    insp = inspect(new_engine)

    for table_name in metadata.tables:
        print(table_name)
        for column in insp.get_columns(table_name):
            for name, value in column.items():
                print('  ', end='')
                if value:
                    field = name if value in [True, 'auto'] else value
                    print(field, end=' ')
            print()

### table 等コピー終わり ###

### データコピー開始 ###
# todo: tags の登録の時はupsert する
try:
    old_sessionmaker = sessionmaker(old_engine)
    new_sessionmaker = sessionmaker(new_engine)
    old_session = old_sessionmaker()
    new_session = new_sessionmaker()
    # users
    print("users テーブルコピー開始")
    users = old_session.query(User).all()
    if len(users) > 0:
        users_new = []
        for user in users:
            # print(f"adding user:{user}")
            new_user = User(id=user.id, user_id=user.user_id,
                            user_name=user.user_name, password=user.password)
            users_new.append(new_user)
        new_session.add_all(users_new)
    print("users テーブルコピー終わり")

    # nikkis
    print("nikkisテーブルコピー開始")
    nikkis = old_session.query(Nikki).all()
    if len(nikkis) > 0:
        nikkis_new = []
        tags_new = []
        for nikki in nikkis:
            new_nikki = Nikki(id=nikki.id, created_by=nikki.created_by, title=nikki.title, goodness=nikki.goodness,
                              summary=nikki.summary, content=nikki.content, created_at=nikki.created_at)
            tags = [Tag(id=tag.id, created_by=tag.created_by, name=tag.name)
                    for tag in nikki.tags]
            new_nikki.tags = tags
            tags_new.extend(tags)
            nikkis_new.append(new_nikki)
        new_session.add_all(nikkis_new)
    print("nikkisテーブルコピー終わり")
    print("tags 登録前に、一度コミット")
    new_session.commit()
    print("コミット成功")
    # tags
    print("tagsテーブルコピー開始")
    tags = old_session.query(Tag).all()
    if len(tags) > 0:
        # tags_new = []
        for tag in tags:
            new_tag = Tag(id=tag.id, created_by=tag.created_by, name=tag.name)
            # tags_new.append(new_tag)
            if tag not in tags_new:
                new_session.add(new_tag)

    print("tagsテーブルコピー終わり")
    # public nikki
    print("public_nikki テーブルコピー開始")
    publics = old_session.query(PublicNikki).all()
    if len(publics) > 0:
        nikkis_new = []
        for nikki in publics:
            new_public = PublicNikki(
                user_id=nikki.user_id, other_user_id=nikki.other_user_id, nikki_id=nikki.nikki_id)
            nikkis_new.append(nikki)
        new_session.add_all(nikkis_new)
    print("public_nikki テーブルコピー終了")
    print("コミット開始")
    new_session.commit()
    print("コミット成功")
except Exception as e:
    print("データコピーでエラーが起きた")
    print("新しいDBにコピーした情報を削除します")
    Base.metadata.drop_all(new_engine)
    raise e
### データコピー終わり ###

### sequence のチェック ###
print("sequenceチェック開始")
try:
    nikkis_sequence_sql = text("SELECT last_value FROM nikki_id_seq")
    users_sequence_sql = text("SELECT last_value FROM users_id_seq")
    tag_sequence_sql = text("SELECT last_value FROM tag_id_seq")

    nikki_sequence_val = next(
        iter(old_session.execute(nikkis_sequence_sql)))[0]
    users_sequence_val = next(iter(old_session.execute(users_sequence_sql)))[0]
    tag_sequence_val = next(iter(old_session.execute(tag_sequence_sql)))[0]

    nikkis_set_sequence_sql = text(
        f"select SETVAL('nikki_id_seq', {nikki_sequence_val});")
    users_set_sequence_sql = text(
        f"select SETVAL('users_id_seq', {users_sequence_val});")
    tag_set_sequence_sql = text(
        f"select SETVAL('tag_id_seq', {tag_sequence_val});")

    new_session.execute(nikkis_set_sequence_sql)
    new_session.execute(users_set_sequence_sql)
    new_session.execute(tag_set_sequence_sql)

    new_nikki_sequence_val = next(
        iter(new_session.execute(nikkis_sequence_sql)))[0]
    new_users_sequence_val = next(
        iter(new_session.execute(users_sequence_sql)))[0]
    new_tag_sequence_val = next(iter(new_session.execute(tag_sequence_sql)))[0]
    assert nikki_sequence_val == new_nikki_sequence_val, "nikki のシーケンスがおかしい"
    assert users_sequence_val == new_users_sequence_val, "users のシーケンスがおかしい"
    assert tag_sequence_val == new_tag_sequence_val, "tag のシーケンスがおかしい"
    print("sequenceチェック終了")

except Exception as e:
    print("シーケンスチェックでエラーが起きた")
    print("新しいDBにコピーした情報を削除します")
    Base.metadata.drop_all(new_engine)
    raise e
### sequence のチェック終わり ###

print("コピー終了")

print("古いDBシーケンスの値")
print(f"nikki_id_seq={nikki_sequence_val}")
print(f"users_id_seq={users_sequence_val}")
print(f"tag_id_seq={tag_sequence_val}")
print("新しいDBのシーケンスの値")
print(f"nikki_id_seq={new_nikki_sequence_val}")
print(f"users_id_seq={new_users_sequence_val}")
print(f"tag_id_seq={new_tag_sequence_val}")
