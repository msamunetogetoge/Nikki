# アーキテクチャ概要 (Next.js + Hono)

## 現在のアーキテクチャ (初期分析時点)

### フロントエンド

-   **フレームワーク**: Nuxt.js (Vue.js 2)
-   **UIライブラリ**: Vuetify (Material Design)
-   **状態管理**: Vuex
-   **ルーティング**: Nuxtファイルシステムルーティング
-   **デプロイ**: Google Cloud Run

### バックエンド

-   **フレームワーク**: FastAPI (Python)
-   **データベース**: PostgreSQL
-   **ORM**: SQLAlchemy
-   **マイグレーション**: Alembic
-   **認証**: カスタム実装 (ユーザーID/パスワードをBase64で暗号化)

## 目標アーキテクチャ (Next.js + Hono)

### フロントエンド

-   **フレームワーク**: Next.js (App Router, React Server Components & Client Components)
-   **UIライブラリ**: React + Material-UI (MUI)
-   **状態管理**: React Context, Zustand/Jotai, またはローカルなReact状態 (useState)
-   **ルーティング**: Next.jsファイルシステムルーティング (App Router)
-   **デプロイ**: Vercel (推奨) またはカスタムNode.js環境

### バックエンド

-   **フレームワーク**: Hono (Node.js/TypeScript)
-   **データベース**: PostgreSQL (既存のものを再利用)
-   **ORM**: Prisma
-   **認証**: カスタムロジック (AES-CBC複合) の再現

## モノレポ構造 (npm Workspaces)

プロジェクトは、フロントエンド、バックエンド、および共有パッケージを格納するために、npmワークスペースを使用したモノレポ構造を採用します。この構造は、コード共有を促進し、依存関係の管理を簡素化します。

-   `apps/web`: Next.jsアプリケーション (フロントエンド)。
-   `apps/api`: Hono APIサーバー (すべてのバックエンドロジックを処理)。
-   `packages/db`: Prismaスキーマ、マイグレーションスクリプト、およびデータベース操作用のPrismaクライアントが含まれます。
-   `packages/core`: フロントエンドとバックエンドの両方で利用できる共有の型定義、ユーティリティ関数、ドメインロジック。

## 移行戦略

-   **フロントエンド**: VueコンポーネントをMaterial-UI (MUI) を使用してReactコンポーネントにリライトします。Nuxt.jsのファイルシステムルーティングをNext.jsのApp Routerルーティングに適応させます。データフェッチは、Next.jsのサーバーコンポーネントと必要に応じてクライアントサイドフェッチを利用します。
-   **バックエンド**: FastAPIのエンドポイントをHono APIハンドラーにリライトします。Prismaを使用してデータベース操作を実装します。既存のユーザーデータとの互換性のために、カスタムのAES-CBC認証ロジックをTypeScriptで再現することが重要です。
-   **データベース**: 既存のPostgreSQLデータベースを再利用します。Prismaはこのデータベースを管理し、操作するように設定されます。

### クリーンアーキテクチャの原則

Honoバックエンドと共有`packages/core`内で、クリーンアーキテクチャの原則を適用することを目指します。

-   **`packages/core/domain`**: コアビジネスエンティティ (User, Nikki, Tag)。
-   **`packages/core/usecase`**: アプリケーション固有のビジネスロジック、リポジトリインターフェースの定義。
-   **`packages/db/infrastructure`**: Prismaを使用したリポジトリインターフェースの実装。
-   **`apps/api/controllers`**: Hono APIルート、ユースケースを呼び出す。
-   **`apps/web`**: Next.jsフロントエンド、Hono APIと統合。

## 主な移行タスク

1.  **プロジェクト設定**: npmワークスペース内でNext.jsとHonoプロジェクトを初期化します。
2.  **データベース層**: 既存のPostgreSQLデータベーススキーマでPrismaを設定します。
3.  **認証**: AES-CBC暗号化/復号化ロジックをTypeScriptで再実装します。
4.  **バックエンドAPI (Hono)**: すべてのFastAPIエンドポイントをHonoハンドラーに変換し、Prismaと新しい認証ロジックを介してCRUD操作を実装します。
5.  **フロントエンドページ (Next.js)**: Nuxt.jsのページをNext.jsのページ/コンポーネントとして再作成し、Hono APIと統合します。
6.  **フロントエンドコンポーネント (React/MUI)**: VueコンポーネントをMUIを使用したReactコンポーネントに変換します。
7.  **状態管理**: React用の適切な状態管理ソリューションを実装します。
8.  **テスト**: 単体テスト、結合テスト、エンドツーエンドテストのフレームワークを確立します。
9.  **デプロイ**: Next.jsとHonoのデプロイを設定します。
