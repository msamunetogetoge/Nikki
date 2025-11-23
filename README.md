# Nikki

ユーザー登録して日記を書いて保存。友達と共有したりするアプリになる予定。
友達と共有する部分は後日実装予定。

## デモ

https://nikkinuxt-al3xm4xtvq-nn.a.run.app
にアクセスして試せる。

## 技術スタック

### フロントエンド

- **Framework**: Nuxt.js (Vue.js)
- **UI Library**: Vuetify
- **Language**: TypeScript

### バックエンド

- **Framework**: FastAPI
- **Language**: Python
- **ORM**: SQLAlchemy
- **Migration**: Alembic
- **Database**: PostgreSQL (Cloud SQL)

### インフラ

- **Platform**: Google Cloud Run
- **Container**: Docker

## ディレクトリ構成

- `nikki_nuxt/`: フロントエンド (Nuxt.js) のソースコード
- `py/`: バックエンド (FastAPI) のソースコード

## ローカル開発環境のセットアップ

### フロントエンド (nikki_nuxt)

```bash
cd nikki_nuxt
npm install
npm run dev
```

### バックエンド (py)

```bash
cd py
pip install -r requirements.txt
uvicorn main:app --reload
```
