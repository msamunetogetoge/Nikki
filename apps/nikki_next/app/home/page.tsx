"use client"

import { useEffect, useMemo, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Fab,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material"
import Link from "next/link"
import type { NikkiListItem } from "../../../../packages/core/src/api/nikki.ts"
import { fetchNikkis } from "../../lib/api"
import { useAuth } from "../auth-context"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))

function NikkiCard({ nikki }: { nikki: NikkiListItem }) {
  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(16,185,129,0.05) 100%)",
      }}
    >
      <CardContent sx={{ display: "grid", gap: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            {formatDate(nikki.date)}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {nikki.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ textTransform: "capitalize" }}
              />
            ))}
          </Stack>
        </Stack>
        <Typography
          variant="h6"
          component="h3"
          sx={{ lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {nikki.content}
        </Typography>
      </CardContent>
    </Card>
  )
}

function NikkiList({ items }: { items: NikkiListItem[] }) {
  if (items.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 3,
          background: "rgba(59,130,246,0.03)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          No entries yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start a new Nikki to see it appear here.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
      }}
    >
      {items.map((nikki) => (
        <Box key={nikki.id} sx={{ height: "100%" }}>
          <NikkiCard nikki={nikki} />
        </Box>
      ))}
    </Box>
  )
}

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth()
  const [items, setItems] = useState<NikkiListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initials = useMemo(() => (user?.name ? user.name.slice(0, 2).toUpperCase() : ""), [user])

  const loadNikkis = async () => {
    setLoading(true)
    setError(null)
    try {
      const { items: response } = await fetchNikkis({ limit: 50, offset: 0 })
      setItems(response)
    } catch (err) {
      console.error("Failed to fetch nikki list", err)
      setError("Failed to load your entries. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadNikkis()
    }
  }, [authLoading])

  return (
    <Box sx={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 20%, #e0f2fe, transparent 25%), radial-gradient(circle at 80% 0%, #d1fae5, transparent 25%)" }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: "1px solid", borderColor: "divider", backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}>
        <Toolbar sx={{ display: "flex", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            Nikki
          </Typography>
          <Box sx={{ flex: 1 }} />
          {user && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "#0ea5e9", color: "#fff", width: 34, height: 34 }}>
                {initials}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {user.name}
              </Typography>
            </Stack>
          )}
          <Button variant="outlined" size="small" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(120deg, rgba(14,165,233,0.12), rgba(16,185,129,0.12))",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Welcome back{user ? `, ${user.name}` : ""}!
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={640}>
              Your recent Nikki entries are below. Keep the streak alive and capture today&apos;s moments.
            </Typography>
            <Stack direction="row" spacing={1.5} mt={2}>
              <Button variant="contained" size="small" onClick={loadNikkis} disabled={loading}>
                Refresh
              </Button>
              <Button variant="outlined" size="small" component={Link} href="/nikki/new">
                New Entry
              </Button>
            </Stack>
          </Box>

          {error && (
            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "error.light", background: "rgba(239,68,68,0.05)" }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Loading your Nikkis...
              </Typography>
            </Stack>
          ) : (
            <NikkiList items={items} />
          )}
        </Stack>
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        component={Link}
        href="/nikki/new"
        sx={{ position: "fixed", bottom: 24, right: 24, boxShadow: 3 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
