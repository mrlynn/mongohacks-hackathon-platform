"use client";

import { useState, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Search as SearchIcon, CheckCircle as CheckIcon } from "@mui/icons-material";
import { UnsplashSearchResult } from "@/types/unsplash";

interface UnsplashImagePickerProps {
  onSelect: (photo: {
    url: string;                // urls.regular -- the hero background URL
    photographerName: string;   // user.name
    photographerUrl: string;    // user.profileUrl (already has UTM params)
    unsplashPhotoUrl: string;   // photoUrl (already has UTM params)
    downloadLocation: string;   // for download tracking (TOS)
  }) => void;
  selectedUrl?: string;         // currently selected URL for highlight ring
}

export default function UnsplashImagePicker({
  onSelect,
  selectedUrl,
}: UnsplashImagePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnsplashSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchPhotos = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/unsplash/search?query=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) {
        if (res.status === 429) {
          setError("Rate limit reached. Please wait a minute and try again.");
        } else if (res.status === 503) {
          setError("Unsplash search is not configured. Contact your administrator.");
        } else {
          setError("Failed to search photos. Please try again.");
        }
        return;
      }
      const data = await res.json();
      setResults(data.photos);
      setTotal(data.total);
    } catch {
      setError("Failed to search photos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setError("");
      setTotal(0);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchPhotos(value);
    }, 400);
  }

  return (
    <Box>
      {/* Section header */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Search Unsplash
      </Typography>

      {/* Search input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search free high-resolution photos..."
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {/* Error state */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty state -- only show after a search with zero results */}
      {!loading && !error && query.trim() && results.length === 0 && total === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 3, textAlign: "center" }}
        >
          No photos found for &quot;{query}&quot;. Try a different search term.
        </Typography>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <>
          <Grid container spacing={1.5}>
            {results.map((photo) => {
              const isSelected = selectedUrl === photo.urls.regular;
              return (
                <Grid key={photo.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    onClick={() =>
                      onSelect({
                        url: photo.urls.regular,
                        photographerName: photo.user.name,
                        photographerUrl: photo.user.profileUrl,
                        unsplashPhotoUrl: photo.photoUrl,
                        downloadLocation: photo.downloadLocation,
                      })
                    }
                    elevation={isSelected ? 4 : 1}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: 2,
                      borderColor: isSelected ? "primary.main" : "divider",
                      transition: "all 0.15s",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                      },
                      position: "relative",
                    }}
                  >
                    {/* Thumbnail -- use standard img, not next/image (external Unsplash URLs) */}
                    <Box
                      component="img"
                      src={photo.urls.small}
                      alt={photo.description || `Photo by ${photo.user.name}`}
                      sx={{
                        width: "100%",
                        height: 100,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* Photographer name overlay (DATA-04) */}
                    <Box sx={{ p: 0.75, textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {photo.user.name}
                      </Typography>
                    </Box>
                    {/* Selection indicator */}
                    {isSelected && (
                      <CheckIcon
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          color: "primary.main",
                          fontSize: 18,
                          bgcolor: "background.paper",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Unsplash attribution (TOS) */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5, textAlign: "center" }}
          >
            Photos provided by{" "}
            <Box
              component="a"
              href="https://unsplash.com/?utm_source=mongohacks&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "text.secondary", textDecoration: "underline" }}
            >
              Unsplash
            </Box>
          </Typography>
        </>
      )}
    </Box>
  );
}
