/**
 * Serialize Mongoose documents to plain objects for Next.js Client Components
 * Converts ObjectIds to strings and Dates to ISO strings
 */

export function serializeDoc<T extends Record<string, any>>(doc: T): any {
  if (!doc) return doc;

  const serialized: any = {};

  for (const key in doc) {
    const value = doc[key];

    if (value === null || value === undefined) {
      serialized[key] = value;
    } else if (typeof value === "object" && value._bsontype === "ObjectId") {
      // Serialize ObjectId to string
      serialized[key] = value.toString();
    } else if (value instanceof Date) {
      // Serialize Date to ISO string
      serialized[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      // Recursively serialize arrays
      serialized[key] = value.map((item) =>
        typeof item === "object" && item !== null ? serializeDoc(item) : item
      );
    } else if (typeof value === "object" && value !== null && !Buffer.isBuffer(value)) {
      // Recursively serialize nested objects (but not Buffers)
      serialized[key] = serializeDoc(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized;
}

export function serializeDocs<T extends Record<string, any>>(docs: T[]): any[] {
  return docs.map(serializeDoc);
}
