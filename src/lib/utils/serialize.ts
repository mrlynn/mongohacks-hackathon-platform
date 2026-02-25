/**
 * Serialize Mongoose documents to plain objects for Next.js Client Components
 * Converts ObjectIds to strings and Dates to ISO strings
 */

export function serializeDoc<T extends Record<string, any>>(doc: T): any {
  if (!doc) return doc;

  const serialized: any = {};

  for (const key in doc) {
    const value: unknown = doc[key];

    if (value === null || value === undefined) {
      serialized[key] = value;
    } else if (typeof value === "object" && value !== null && (value as Record<string, unknown>)._bsontype === "ObjectId") {
      // Serialize ObjectId to string
      serialized[key] = String(value);
    } else if (value instanceof Date) {
      // Serialize Date to ISO string
      serialized[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      // Recursively serialize arrays
      serialized[key] = value.map((item: unknown) =>
        typeof item === "object" && item !== null ? serializeDoc(item as Record<string, unknown>) : item
      );
    } else if (typeof value === "object" && value !== null && !Buffer.isBuffer(value as never)) {
      // Recursively serialize nested objects (but not Buffers)
      serialized[key] = serializeDoc(value as Record<string, unknown>);
    } else {
      serialized[key] = value;
    }
  }

  return serialized;
}

export function serializeDocs<T extends Record<string, any>>(docs: T[]): any[] {
  return docs.map(serializeDoc);
}
