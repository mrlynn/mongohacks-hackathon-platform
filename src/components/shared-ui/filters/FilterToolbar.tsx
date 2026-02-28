"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Drawer,
  IconButton,
  Badge,
  Button,
  Divider,
  Typography,
  Stack,
} from "@mui/material";
import {
  FilterListOutlined,
  CloseOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import SearchBar from "./SearchBar";
import SortControl from "./SortControl";
import FilterChips from "./FilterChips";

interface SortOption {
  value: string;
  label: string;
}

interface FilterToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Sort
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortFieldChange: (field: string) => void;
  onSortDirectionChange: (direction: "asc" | "desc") => void;
  sortOptions: SortOption[];

  // Filters
  children?: React.ReactNode; // Filter components
  activeFilters: Array<{ key: string; label: string; value: string }>;
  onRemoveFilter: (key: string) => void;
  onClearAllFilters: () => void;

  // Optional actions
  rightActions?: React.ReactNode;
}

/**
 * Master toolbar for data views
 * 
 * Combines:
 * - Search bar (with Cmd+K shortcut)
 * - Sort controls
 * - Filter drawer (mobile-friendly)
 * - Active filter chips
 * - Custom action buttons
 */
export default function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  sortOptions,
  children,
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
  rightActions,
}: FilterToolbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasFilters = React.Children.count(children) > 0;

  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        {/* Top row: Search + Sort + Actions */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <Box sx={{ flex: "1 1 300px", minWidth: 200 }}>
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              fullWidth
            />
          </Box>

          {/* Sort */}
          <SortControl
            sortField={sortField}
            sortDirection={sortDirection}
            onSortFieldChange={onSortFieldChange}
            onSortDirectionChange={onSortDirectionChange}
            options={sortOptions}
          />

          {/* Filters button */}
          {hasFilters && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                border: 1,
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "primary.50",
                },
              }}
            >
              <Badge badgeContent={activeFilters.length} color="primary">
                <TuneOutlined />
              </Badge>
            </IconButton>
          )}

          {/* Custom actions */}
          {rightActions}
        </Box>

        {/* Active filter chips */}
        <FilterChips
          filters={activeFilters}
          onRemove={onRemoveFilter}
          onClearAll={onClearAllFilters}
        />
      </Paper>

      {/* Filter drawer */}
      {hasFilters && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: "100%", sm: 400 },
              maxWidth: "100%",
            },
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterListOutlined color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Filters
                </Typography>
                {activeFilters.length > 0 && (
                  <Badge badgeContent={activeFilters.length} color="primary" />
                )}
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)} edge="end">
                <CloseOutlined />
              </IconButton>
            </Stack>
          </Box>

          {/* Filter groups */}
          <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>{children}</Box>

          {/* Footer */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Stack spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setDrawerOpen(false)}
              >
                Apply Filters
              </Button>
              {activeFilters.length > 0 && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onClearAllFilters();
                    setDrawerOpen(false);
                  }}
                >
                  Clear All
                </Button>
              )}
            </Stack>
          </Box>
        </Drawer>
      )}
    </>
  );
}
