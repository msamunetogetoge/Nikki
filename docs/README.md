# Nikki (Deno Rewrite)

このディレクトリ (`docs/`) は、Nikki プロジェクトを Deno, Fresh, React, MUI で書き直すためのドキュメントを管理しています。

## 目的
既存の Nuxt.js + FastAPI の構成から、Deno ベースのモダンなフルスタック構成へ移行します。

## ドキュメント一覧

*   **[architecture.md](./architecture.md)**: 新旧アーキテクチャの比較と移行戦略
*   **[architecture_concepts.md](./architecture_concepts.md)**: Islands Architecture (FE) と Clean Architecture (BE) の解説
*   **[folder_structure.md](./folder_structure.md)**: Deno モノレポのフォルダ構成
*   **[api_list.md](./api_list.md)**: 既存のバックエンド API 一覧
*   **[frontend_list.md](./frontend_list.md)**: 既存のフロントエンド画面・コンポーネント一覧
*   **[sqlite_schema.sql](./sqlite_schema.sql)**: ローカル開発用 SQLite スキーマ

## 開発用ドキュメント
*   **[dev/](./dev/)**: 機能ごとの詳細設計書
    *   **[login/](./dev/login/)**: ログイン機能の設計

## 開発サイクル

1.  **Issue**: 機能追加・バグ修正ごとに Issue を作成する。
2.  **Coding**: `deno` ブランチから作業用ブランチを作成し (例: `feat/login`)、実装を行う。
3.  **Review**: Pull Request を作成し、レビューを依頼する。
4.  **Merge**: 承認後、`deno` ブランチにマージする。

