import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { formatDate } from "../utils/dateFormat.ts";
import type { NikkiFromApi } from "../types/nikki.ts";

type NikkiListProps = {
  userId: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default function NikkiList({ userId }: NikkiListProps) {
  const nikkiList = useSignal<NikkiFromApi[]>([]);
  const isLoading = useSignal(false);
  const isLastNikki = useSignal(false);
  const error = useSignal<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchNikkiList = async (fromDate: Date) => {
    if (isLoading.value || isLastNikki.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        from_date: fromDate.toUTCString(),
        created_by: userId,
      });
      const response = await fetch(`/api/nikki?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Nikkiの取得に失敗しました。");
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Nikkiのレスポンス形式が不正です。");
      }

      if (data.length === 0) {
        isLastNikki.value = true;
        return;
      }

      const nextEntries = data as NikkiFromApi[];
      const merged = [...nikkiList.value];
      for (const entry of nextEntries) {
        const exists = merged.some((item) => item.id === entry.id);
        if (!exists) {
          merged.push(entry);
        }
      }
      nikkiList.value = merged;
    } catch (err) {
      const fallbackMessage = err instanceof Error
        ? err.message
        : "Nikkiの取得に失敗しました。";
      error.value = fallbackMessage;
    } finally {
      isLoading.value = false;
    }
  };

  useEffect(() => {
    nikkiList.value = [];
    isLastNikki.value = false;
    error.value = null;
    fetchNikkiList(new Date());
  }, [userId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting || isLoading.value || isLastNikki.value) {
        return;
      }

      const lastNikki = nikkiList.value[nikkiList.value.length - 1];
      const nextFromDate = lastNikki
        ? new Date((lastNikki.created_at * 1000) - DAY_MS)
        : new Date();

      fetchNikkiList(nextFromDate);
    }, { rootMargin: "160px" });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [userId]);

  return (
    <Stack spacing={2}>
      {nikkiList.value.map((nikki) => (
        <Card
          key={nikki.id}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <EditNoteIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                {nikki.title}
              </Typography>
            </Stack>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              {nikki.summary}
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                {formatDate(nikki.created_at)}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FavoriteIcon color="error" fontSize="small" />
                <Typography variant="body2">{nikki.goodness}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {error.value && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "error.light",
            color: "error.main",
            borderRadius: 2,
            p: 2,
            bgcolor: "error.light",
          }}
        >
          <Typography variant="body2">{error.value}</Typography>
        </Box>
      )}

      {nikkiList.value.length === 0 && !isLoading.value && !error.value && (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">まだ Nikki がありません。</Typography>
        </Box>
      )}

      {isLoading.value && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          py={2}
        >
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            読み込み中...
          </Typography>
        </Stack>
      )}

      {isLastNikki.value && nikkiList.value.length > 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={2}
        >
          最後のNikkiです
        </Typography>
      )}

      <div ref={sentinelRef} />
    </Stack>
  );
}
