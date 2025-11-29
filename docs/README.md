# Nikki (Next.js + Honoによるリライト)

このディレクトリ (`docs/`) には、Next.js、Hono、React、MUIを使用してリライトされているNikkiプロジェクトのドキュメントが含まれています。

## 目的

既存のNuxt.js + FastAPIスタックから、Next.jsとHonoを使用したモダンなTypeScriptベースのフルスタックアーキテクチャへ移行すること。

## ドキュメント一覧

-   **[architecture.md](./architecture.md)**: 新旧アーキテクチャの比較と移行戦略。
-   **[api_list.md](./api_list.md)**: 既存のバックエンドAPIリスト（FastAPIからHonoへ再実装予定）。
-   **[frontend_list.md](./frontend_list)**: 既存のフロントエンド画面とコンポーネントリスト（Nuxt.jsからNext.js/Reactへ再実装予定）。
-   **[sqlite_schema.sql](./sqlite_schema.sql)**: ローカル開発用のSQLiteスキーマ（参照用）。

## 開発ドキュメント

-   **[dev/](./dev/)**: 各機能の詳細設計ドキュメント。
    -   **[login/](./dev/login/)**: ログイン機能の設計。
    -   **[home/](./dev/home/)**: ホーム画面と関連APIの設計。

### `docs/dev/`内の標準構造
-   `docs/dev/<feature>/README.md`: 機能のドキュメント案内。
-   `docs/dev/<feature>/be_design.md`: バックエンド設計（API、クリーンアーキテクチャの配置）。
-   `docs/dev/<feature>/fe_design.md`: フロントエンド設計（画面/挙動）。
-   `docs/dev/<feature>/implementation_plan/`: 実装計画。
    -   命名規則: `{issue_number}_{FE/BE}_plan.md`（例: `97_FE_plan.md`、`100_BE_plan.md`）。

## 開発サイクル

1.  **Issue**: 新機能またはバグ修正ごとにIssueを作成します。
2.  **Coding**: `next`ブランチから作業ブランチ（例: `feat/login`）を作成し、変更を実装します。
3.  **Review**: Pull Requestを作成し、レビューを依頼します。
4.  **Merge**: 承認後、`next`ブランチにマージします。

### ワークツリー管理
-   **作成**: \`git worktree add worktrees/<name> -b <branch> origin/next\`
    -   例: \`git worktree add worktrees/BE_100_hash -b BE_100_hash origin/next\`
-   **削除**: \`git worktree remove worktrees/<name>\`
    -   削除できない場合は、アクティブなプロセスを停止して再試行してください。

## ローカル起動 (FE/BE)

-   **フロントエンド (Next.js) + バックエンドAPI (Hono)**:
    -   `cd Nikki` (ルートディレクトリ)
    -   開発起動: `npm run dev` (Next.jsとHono APIを同時に起動します)
    -   Next.js（フロントエンド）は`http://localhost:3000`で利用可能です。
    -   Hono（バックエンド）は`http://localhost:8787`で利用可能です。

---

## アーカイブされたDeno/Freshドキュメント

-   **[archive_deno_fresh/](./archive_deno_fresh/)**: 以前のDeno/Freshリライト計画に関するオリジナルドキュメント。プロジェクトがNext.jsとHonoをターゲットとしているため、アーカイブされました。

