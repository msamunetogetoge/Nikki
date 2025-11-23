import { Head } from "$fresh/runtime.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Nikki | Login</title>
      </Head>
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 20% 20%, #233143 0, #0f172a 40%, #0b1223 80%)",
          color: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "720px",
            background: "rgba(12, 18, 35, 0.8)",
            border: "1px solid #1e293b",
            borderRadius: "18px",
            boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            padding: "32px",
          }}
        >
          <header style={{ marginBottom: "24px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.35em",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Welcome to Nikki
            </p>
            <h1
              style={{
                marginTop: "10px",
                fontSize: "28px",
                fontWeight: 600,
                color: "#f8fafc",
              }}
            >
              サインインして続ける
            </h1>
            <p
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: "#cbd5e1",
              }}
            >
              既存のユーザーIDでログインするか、サインアップ/お試しログインに進んでください。
            </p>
          </header>
          <LoginForm />
        </section>
      </main>
    </>
  );
}
