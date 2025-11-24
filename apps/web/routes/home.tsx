import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Box, Container, Stack, Typography } from "@mui/material";
import { getCookies } from "std/http/cookie";
import { SESSION_COOKIE_NAME, validateSession } from "../utils/session.ts";
import NikkiList from "../islands/NikkiList.tsx";
import type { PublicUser } from "@domain/entities/User.ts";

type HomePageData = {
  user: PublicUser;
};

export const handler: Handlers<HomePageData> = {
  GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const token = cookies[SESSION_COOKIE_NAME];
    const user = token ? validateSession(token) : null;

    if (!user) {
      return new Response("", {
        status: 302,
        headers: { Location: "/" },
      });
    }

    return ctx.render({ user });
  },
};

export default function Home({ data }: PageProps<HomePageData>) {
  const { user } = data;

  return (
    <>
      <Head>
        <title>Nikki | Home</title>
      </Head>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              ホーム
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ようこそ、{user.user_name}さん
            </Typography>
          </Box>

          <NikkiList userId={user.user_id} />
        </Stack>
      </Container>
    </>
  );
}
