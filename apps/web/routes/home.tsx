import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { PublicUser } from "@domain/entities/User.ts";

export const handler: Handlers<PublicUser> = {
  GET(req, ctx) {
    const user = ctx.state.user as PublicUser | undefined;
    if (!user) {
      return Response.redirect(new URL("/", req.url), 302);
    }
    return ctx.render(user);
  },
};

export default function Home({ data }: PageProps<PublicUser>) {
  return (
    <>
      <Head>
        <title>Nikki | Home</title>
      </Head>
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 80% 10%, #16243a 0, #0f172a 40%, #0b1223 80%)",
          color: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
        }}
      >
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
              ようこそ、{data.user_name} さん
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "14px" }}>
              ユーザーID: {data.user_id}
            </p>
          </header>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
      </main>
    </>
  );
}
