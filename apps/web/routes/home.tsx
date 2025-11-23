import { Head } from "$fresh/runtime.ts";
import HomeShell from "../islands/HomeShell.tsx";

export default function Home() {
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
        <HomeShell />
      </main>
    </>
  );
}
