import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { PublicUser } from "@domain/entities/User.ts";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

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
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Home
              </Typography>
              <Typography variant="h4" gutterBottom>
                ようこそ、{data.user_name} さん
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ユーザーID: {data.user_id}
              </Typography>
            </Box>
            <Button variant="contained" color="primary" href="/new">
              New Entry
            </Button>
          </Stack>
          <Typography variant="body1">
            Welcome to your diary dashboard.
          </Typography>
          {/* NikkiList will go here (Issue #102) */}
        </Box>
      </Container>
    </>
  );
}
