import { Handlers } from "$fresh/server.ts";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

export const handler: Handlers = {
  GET(req, ctx) {
    const cookies = req.headers.get("cookie");
    // TODO: Verify the correct cookie name with the backend team.
    // Assuming 'auth_token' or similar for now.
    // If no cookie is present at all, definitely redirect.
    if (!cookies) {
      return new Response("", {
        status: 307,
        headers: { Location: "/login" },
      });
    }

    // TODO: Validate token validity if possible or rely on API calls to fail.

    return ctx.render();
  },
};

export default function Home() {
  // @ts-ignore: MUI types with Preact/Fresh
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Nikki Home
          </Typography>
          <Button variant="contained" color="primary" href="/new">
            New Entry
          </Button>
        </Stack>
        <Typography variant="body1">
          Welcome to your diary dashboard.
        </Typography>
        {/* NikkiList will go here */}
      </Box>
    </Container>
  );
}
