import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { clearSession, loadSession, SessionUser } from "../utils/session.ts";

export default function HomeShell() {
  const user = useSignal<SessionUser | null>(null);

  useEffect(() => {
    user.value = loadSession();
  }, []);

  if (!user.value) {
    return (
      <section
        style={{
          background: "rgba(12, 18, 35, 0.65)",
          border: "1px solid #1e293b",
          borderRadius: "18px",
          padding: "24px",
          maxWidth: "640px",
          margin: "0 auto",
          color: "#e5e7eb",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>
          ログインが必要です
        </h2>
        <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "16px" }}>
          セッションが見つかりません。ログインページに戻ってサインインしてください。
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#0ea5e9",
            color: "#0b1223",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ログインへ戻る
        </a>
      </section>
    );
  }

  return (
    <section
      style={{
        background: "rgba(12, 18, 35, 0.65)",
        border: "1px solid #1e293b",
        borderRadius: "18px",
        padding: "24px",
        maxWidth: "720px",
        margin: "0 auto",
        color: "#e5e7eb",
      }}
    >
      <header style={{ marginBottom: "12px" }}>
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          Home
        </p>
        <h2 style={{ fontSize: "24px", margin: "4px 0", color: "#f8fafc" }}>
          ようこそ、{user.value.user_name} さん
        </h2>
        <p style={{ color: "#cbd5e1", fontSize: "14px" }}>
          ユーザーID: {user.value.user_id}
        </p>
      </header>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          onClick={() => {
            clearSession();
            if (typeof globalThis !== "undefined" && globalThis.location) {
              globalThis.location.href = "/";
            }
          }}
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#0ea5e9",
            color: "#0b1223",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
          type="button"
        >
          ログアウト
        </button>
        <a
          href="/"
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #1e2937",
            color: "#e5e7eb",
            textDecoration: "none",
          }}
        >
          トップへ
        </a>
      </div>
    </section>
  );
}
