# Nikki - Next.js & Honoによるリライト

このプロジェクトは、Nikki（日記）アプリケーションを最新のTypeScript中心のスタックでリライトするものです。

## 技術スタック

-   **フロントエンド**: [Next.js](https://nextjs.org/) (App Router使用)
-   **UI**: [React](https://react.dev/) & [Material-UI (MUI)](https://mui.com/)
-   **バックエンドAPI**: [Hono](https://hono.dev/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **データベース**: PostgreSQL
-   **パッケージマネージャー**: [npm](https://docs.npmjs.com/cli/v10/configuring-npm/install) (ワークスペース使用)

## モノレポ構造

このプロジェクトは、npmワークスペースを使用して、フロントエンドおよびバックエンドアプリケーションをモノレポとして管理します。

-   `apps/web`: Next.jsフロントエンドアプリケーション。
-   `apps/api`: HonoバックエンドAPIサーバー。
-   `packages/db`: Prismaスキーマ、クライアント、およびデータベース関連スクリプト。
-   `packages/core`: 型定義、ユーティリティ関数、コアビジネスロジックなどの共有コード。
-   `docs/`: アーキテクチャや設計仕様を含むプロジェクトドキュメント。

## はじめに

### 1. 前提条件

-   [Node.js](https://nodejs.org/) (v18以降)
-   [npm](https://docs.npmjs.com/cli/v10/configuring-npm/install)

### 2. インストール

リポジトリをクローンし、npmを使用して依存関係をインストールします。

```bash
git clone <repository-url>
cd Nikki
npm install
```

### 3. 環境変数

データベース接続のために`.env`ファイルを作成する必要があります。例のファイルをコピーしてください。

```bash
cp packages/db/.env.example packages/db/.env
```

その後、`packages/db/.env`をPostgreSQLの接続文字列で編集してください。

### 4. 開発サーバーの起動

Next.jsフロントエンドとHonoバックエンドの両方を同時に起動するには、プロジェクトのルートから`dev`スクリプトを実行します。

```bash
npm run dev
```

-   Next.js（フロントエンド）は`http://localhost:3000`で利用可能です。
-   Hono（バックエンド）は`http://localhost:8787`で利用可能です。