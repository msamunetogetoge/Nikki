import { Handlers } from "$fresh/server.ts";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { getCookies } from "std/http/cookie";
import {
  SESSION_COOKIE_NAME,
  validateSession,
} from "../utils/session.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const token = cookies[SESSION_COOKIE_NAME];
    const session = token ? validateSession(token) : null;

    if (!session) {
      return Response.redirect(new URL("/", req.url), 302);
    }

    ctx.state.user = { user_id: session.userId };
    return await ctx.render();
  },
};

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" gutterBottom>
            Nikki Home
          </Typography>
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
  );
}
