/**
 * Convert array of objects to CSV and download
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Determine columns
  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));

  // Build CSV
  const headers = cols.map((col) => col.label);
  const rows = data.map((item) =>
    cols.map((col) => {
      const value = item[col.key];
      
      // Handle different types
      if (value === null || value === undefined) {
        return "";
      }
      
      if (Array.isArray(value)) {
        return `"${value.join(", ")}"`;
      }
      
      if (typeof value === "object") {
        return `"${JSON.stringify(value)}"`;
      }
      
      // Escape quotes and wrap in quotes if contains comma/newline
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    })
  );

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  // Download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
