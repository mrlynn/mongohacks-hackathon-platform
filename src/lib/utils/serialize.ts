/**
 * Serialize Mongoose lean documents to plain objects for Next.js Client Components.
 *
 * Uses JSON round-trip which leverages the built-in .toJSON() on ObjectId (→ string)
 * and Date (→ ISO string), and automatically strips functions, Uint8Arrays, Symbols,
 * and any other non-JSON-serializable values that would cause
 * "Functions cannot be passed directly to Client Components" or
 * "Uint8Array objects are not supported" errors.
 */

export function serializeDoc<T>(doc: T): any {
  if (!doc) return doc;
  return JSON.parse(JSON.stringify(doc));
}

export function serializeDocs<T>(docs: T[]): any[] {
  if (!docs) return [];
  return JSON.parse(JSON.stringify(docs));
}
