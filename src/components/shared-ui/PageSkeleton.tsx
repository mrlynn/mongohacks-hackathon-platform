"use client";

import { Container, Skeleton, Box, Grid, Card, CardContent } from "@mui/material";

/** Full-page skeleton with a header area and content cards */
export function PageHeaderSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} />
    </Box>
  );
}

/** Card grid skeleton — renders n placeholder cards */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="50%" height={20} />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

/** Table skeleton — renders header + n rows */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={24} />
          ))}
        </Box>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} variant="text" width={`${100 / columns}%`} height={20} />
            ))}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

/** Form skeleton — renders labeled input placeholders */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
        {Array.from({ length: fields }).map((_, i) => (
          <Box key={i} sx={{ mb: 2.5 }}>
            <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" width="100%" height={40} />
          </Box>
        ))}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Skeleton variant="rounded" width={120} height={40} />
          <Skeleton variant="rounded" width={100} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
}

/** Detail page skeleton — header + content area */
export function DetailSkeleton() {
  return (
    <>
      <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="50%" height={32} />
              <Skeleton variant="text" width="30%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={100} height={36} />
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
