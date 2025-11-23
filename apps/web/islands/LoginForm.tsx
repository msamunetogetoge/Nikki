import { JSX } from "preact";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { saveSession } from "../utils/session.ts";

interface LoginResponse {
  id: number;
  user_id: string;
  user_name: string;
  token?: string;
}

export default function LoginForm() {
  const userId = useSignal("");
  const password = useSignal("");
  const showPassword = useSignal(false);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);
  const message = useSignal<string | null>(null);

  useEffect(() => {
    return () => {
      loading.value = false;
    };
  }, []);

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    error.value = null;
    message.value = null;

    if (!userId.value.trim() || !password.value.trim()) {
      error.value = "ユーザーIDとパスワードを入力してください。";
      return;
    }

    loading.value = true;
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.value.trim(),
          password: password.value,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        & Partial<
          LoginResponse
        >
        & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "ログインに失敗しました。");
      }

      const user: LoginResponse = {
        id: data.id ?? 0,
        user_id: data.user_id ?? userId.value.trim(),
        user_name: data.user_name ?? data.user_id ?? userId.value.trim(),
        token: data.token,
      };

      saveSession(user);
      message.value = `ようこそ、${user.user_name} さん`;

      setTimeout(() => {
        if (typeof globalThis !== "undefined" && globalThis.location) {
          globalThis.location.href = "/home";
        }
      }, 450);
    } catch (err) {
      const fallback = err instanceof Error
        ? err.message
        : "ログインに失敗しました。";
      error.value = fallback;
    } finally {
      loading.value = false;
    }
  };

  const labelStyle: JSX.CSSProperties = {
    display: "block",
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "6px",
  };

  const inputStyle: JSX.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #1f2937",
    background: "#0f172a",
    color: "#e5e7eb",
    fontSize: "15px",
    outline: "none",
  };

  const buttonStyle: JSX.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    background: loading.value ? "#334155" : "#0ea5e9",
    color: "#0b1223",
    border: "none",
    cursor: loading.value ? "not-allowed" : "pointer",
    fontSize: "15px",
    fontWeight: 600,
    transition: "opacity 160ms ease",
  };

  const secondaryButtonStyle: JSX.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "transparent",
    color: "#e5e7eb",
    border: "1px solid #1f2937",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
      <div>
        <label style={labelStyle} htmlFor="userId">
          ユーザーID
        </label>
        <input
          id="userId"
          name="userId"
          type="text"
          autoComplete="username"
          value={userId.value}
          onInput={(event) => {
            const target = event.currentTarget as HTMLInputElement;
            userId.value = target.value;
          }}
          style={inputStyle}
          placeholder="example_user"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="password">
          パスワード
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={showPassword.value ? "text" : "password"}
            autoComplete="current-password"
            value={password.value}
            onInput={(event) => {
              const target = event.currentTarget as HTMLInputElement;
              password.value = target.value;
            }}
            style={{ ...inputStyle, paddingRight: "44px" }}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => (showPassword.value = !showPassword.value)}
            aria-label={showPassword.value ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {showPassword.value ? "非表示" : "表示"}
          </button>
        </div>
      </div>

      {error.value && (
        <div
          style={{
            background: "#3f1d2e",
            border: "1px solid #7f1d1d",
            color: "#fecdd3",
            borderRadius: "12px",
            padding: "12px 14px",
            fontSize: "14px",
          }}
        >
          {error.value}
        </div>
      )}

      {message.value && (
        <div
          style={{
            background: "#0f2f27",
            border: "1px solid #0f766e",
            color: "#c7ffef",
            borderRadius: "12px",
            padding: "12px 14px",
            fontSize: "14px",
          }}
        >
          {message.value}
        </div>
      )}

      <button type="submit" style={buttonStyle} disabled={loading.value}>
        {loading.value ? "サインイン中..." : "ログイン"}
      </button>

      <div style={{ display: "grid", gap: "10px", marginTop: "4px" }}>
        <a href="/signup" style={secondaryButtonStyle}>
          サインアップへ
        </a>
        <a href="/trial" style={secondaryButtonStyle}>
          お試しログイン
        </a>
      </div>
    </form>
  );
}
