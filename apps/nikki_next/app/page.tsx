"use client"

import { ChangeEvent, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { login } from "../lib/api"

type FormStatus = "idle" | "success" | "error"

export default function Home() {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<FormStatus>("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => userId.trim().length > 0 && password.trim().length > 0 && !isSubmitting,
    [userId, password, isSubmitting],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("idle")
    setIsSubmitting(true)

    try {
      await login({ user_id: userId, password })
      setStatus("success")
    } catch (error) {
      console.error("Login failed", error)
      setStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper elevation={3} sx={{ width: "100%", p: 4, borderRadius: 3 }}>
        <Stack spacing={3} alignItems="stretch">
          <Box textAlign="center">
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Nikki
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to continue your journaling.
            </Typography>
          </Box>

          {status === "success" && <Alert severity="success">Login Success</Alert>}
          {status === "error" && <Alert severity="error">Login Failed</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="User ID"
                value={userId}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setUserId(event.target.value)
                }
                fullWidth
                required
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPassword(event.target.value)
                }
                fullWidth
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!canSubmit}
                sx={{ height: 48 }}
              >
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : "Login"}
              </Button>
            </Stack>
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Link href="/signup" underline="hover">
              Don&apos;t have an account? Sign Up
            </Link>
            <Button variant="text" size="small">
              Try Demo
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
