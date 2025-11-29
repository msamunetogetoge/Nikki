# Nikki (Deno Rewrite)

このディレクトリ (`docs/`) は、Nikki プロジェクトを Deno, Fresh, React, MUI
で書き直すためのドキュメントを管理しています。

## 目的

既存の Nuxt.js + FastAPI の構成から、Deno
ベースのモダンなフルスタック構成へ移行します。

## ドキュメント一覧

- **[architecture.md](./architecture.md)**: 新旧アーキテクチャの比較と移行戦略
- **[architecture_concepts.md](./architecture_concepts.md)**: Islands
  Architecture (FE) と Clean Architecture (BE) の解説
- **[folder_structure.md](./folder_structure.md)**: Deno モノレポのフォルダ構成
- **[api_list.md](./api_list.md)**: 既存のバックエンド API 一覧
- **[frontend_list.md](./frontend_list.md)**:
  既存のフロントエンド画面・コンポーネント一覧
- **[sqlite_schema.sql](./sqlite_schema.sql)**: ローカル開発用 SQLite スキーマ

## 開発用ドキュメント

- **[dev/](./dev/)**: 機能ごとの詳細設計書
  - **[login/](./dev/login/)**: ログイン機能の設計
    - 実装計画ファイルの命名規則: {issue_number}_{FE/BE}_plan.md (例:
      97_FE_plan.md)
  - **[home/](./dev/home/)**: Home 画面/関連 API の設計

### docs/dev/ 以下の標準構成
- `docs/dev/<feature>/README.md`: その機能ドキュメントの案内
- `docs/dev/<feature>/be_design.md`: バックエンド設計（API, Clean Architecture 配置）
- `docs/dev/<feature>/fe_design.md`: フロントエンド設計（画面/挙動）
- `docs/dev/<feature>/implementation_plan/`: 実装計画
  - 命名規則: `{issue_number}_{FE/BE}_plan.md`（例: `97_FE_plan.md`, `100_BE_plan.md`）

## 開発サイクル

1. **Issue**: 機能追加・バグ修正ごとに Issue を作成する。
2. **Coding**: `deno` ブランチから作業用ブランチを作成し (例:
   `feat/login`)、実装を行う。
3. **Review**: Pull Request を作成し、レビューを依頼する。
4. **Merge**: 承認後、`deno` ブランチにマージする。

### ワークツリー運用
- 作成: `git worktree add worktrees/<name> -b <branch> origin/deno`
  - 例: `git worktree add worktrees/BE_100_hash -b BE_100_hash origin/deno`
- 削除: `git worktree remove worktrees/<name>`
  - 削除できない場合は使用中プロセスを停止して再実行する。

## ローカル起動（FE/BE）

- フロントエンド (Fresh) ＋ バックエンド API（同一サーバー）:
  - `cd apps/web`
  - 開発起動: `deno task start`（API ルートも同時に起動）
  - ビルド: `deno task build`
  - プレビュー: `deno task preview`
