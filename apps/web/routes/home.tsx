import { Handlers } from "$fresh/server.ts";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

/**
 * Home page handler with SSR auth check.
 * Redirects to /login if no auth cookie is present.
 * TODO: Cookie name and validation will be finalized in Issue #105.
 */
export const handler: Handlers = {
  GET(req, ctx) {
    const cookies = req.headers.get("cookie");

    // Check for auth_token cookie (name may change based on Issue #105)
    const hasAuthToken = cookies?.split(";")
      .some((c) => c.trim().startsWith("auth_token="));

    if (!hasAuthToken) {
      return new Response("", {
        status: 307,
        headers: { Location: "/login" },
      });
    }

    // TODO: Validate token validity with backend (Issue #105)

    return ctx.render();
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
