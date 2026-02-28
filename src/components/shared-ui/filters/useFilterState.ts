import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface FilterState {
  search: string;
  status: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  [key: string]: any;
}

/**
 * URL-synced filter state management
 * 
 * Features:
 * - Sync filters to URL params (shareable views)
 * - Track active filter count
 * - Clear all filters
 * - Type-safe filter updates
 */
export function useFilterState<T extends FilterState>(defaultFilters: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const [filters, setFilters] = useState<T>(() => {
    const urlFilters: any = { ...defaultFilters };

    searchParams.forEach((value, key) => {
      // Parse arrays (e.g., "tags=a,b,c")
      if (value.includes(",")) {
        urlFilters[key] = value.split(",");
      } else {
        urlFilters[key] = value;
      }
    });

    return urlFilters;
  });

  // Update single filter
  const updateFilter = useCallback(
    (key: keyof T, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      // Sync to URL
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) {
          // Convert arrays to comma-separated
          if (Array.isArray(v) && v.length > 0) {
            params.set(k, v.join(","));
          } else if (!Array.isArray(v)) {
            params.set(k, String(v));
          }
        }
      });

      const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(url, { scroll: false });
    },
    [filters, pathname, router]
  );

  // Batch update filters
  const updateFilters = useCallback(
    (updates: Partial<T>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);

      // Sync to URL
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) {
          if (Array.isArray(v) && v.length > 0) {
            params.set(k, v.join(","));
          } else if (!Array.isArray(v)) {
            params.set(k, String(v));
          }
        }
      });

      const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(url, { scroll: false });
    },
    [filters, pathname, router]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    router.replace(pathname);
  }, [defaultFilters, pathname, router]);

  // Count active filters (excluding defaults)
  const activeCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T];
      const hasValue = Array.isArray(value) ? value.length > 0 : value !== "";
      const isDifferent = value !== defaultValue;
      if (hasValue && isDifferent) count++;
    });
    return count;
  }, [filters, defaultFilters]);

  // Get active filter labels for chips
  const activeFilters = useMemo(() => {
    const active: Array<{ key: string; label: string; value: string }> = [];

    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T];
      const hasValue = Array.isArray(value) ? value.length > 0 : value !== "";
      const isDifferent = value !== defaultValue;

      if (hasValue && isDifferent) {
        // Format label
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

        // Format value
        let displayValue: string;
        if (Array.isArray(value)) {
          displayValue = value.length > 2 ? `${value.length} selected` : value.join(", ");
        } else {
          displayValue = String(value);
        }

        active.push({ key, label, value: displayValue });
      }
    });

    return active;
  }, [filters, defaultFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    activeCount,
    activeFilters,
  };
}
