declare module 'better-sqlite3' {
  interface Statement {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): void;
    close(): void;
    pragma(pragma: string): unknown;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: { readonly?: boolean; fileMustExist?: boolean }): Database;
  }

  const Database: DatabaseConstructor;
  export default Database;
}

declare module 'mongodb' {
  interface MongoClient {
    connect(): Promise<void>;
    close(): Promise<void>;
    db(name?: string): Db;
  }

  interface Db {
    collection<T = Document>(name: string): Collection<T>;
  }

  interface Collection<T = Document> {
    createIndex(keys: Record<string, 1 | -1>, options?: { unique?: boolean }): Promise<string>;
    insertOne(doc: T): Promise<{ insertedId: unknown }>;
    findOne(filter: Record<string, unknown>): Promise<T | null>;
    find(filter: Record<string, unknown>): Cursor<T>;
    updateOne(
      filter: Record<string, unknown>,
      update: { $set: Partial<T> }
    ): Promise<{ modifiedCount: number }>;
    deleteOne(filter: Record<string, unknown>): Promise<{ deletedCount: number }>;
    deleteMany(filter: Record<string, unknown>): Promise<{ deletedCount: number }>;
  }

  interface Cursor<T> {
    sort(sort: Record<string, 1 | -1>): Cursor<T>;
    limit(n: number): Cursor<T>;
    toArray(): Promise<T[]>;
  }

  interface Document {
    _id?: unknown;
  }

  export class MongoClient {
    constructor(uri: string);
    connect(): Promise<void>;
    close(): Promise<void>;
    db(name?: string): Db;
  }
}

declare module '@qdrant/js-client-rest' {
  interface QdrantPoint {
    id: string;
    vector: number[];
    payload: Record<string, unknown>;
  }

  interface QdrantSearchResult {
    id: string;
    score: number;
    payload: Record<string, unknown>;
  }

  interface QdrantFilter {
    must?: Array<{ key: string; match: { value: unknown } }>;
  }

  export class QdrantClient {
    constructor(options: { url: string; apiKey?: string });
    getCollections(): Promise<{ collections: Array<{ name: string }> }>;
    createCollection(
      name: string,
      config: { vectors: { size: number; distance: string } }
    ): Promise<void>;
    upsert(collection: string, options: { points: QdrantPoint[] }): Promise<void>;
    search(
      collection: string,
      options: {
        vector: number[];
        limit: number;
        score_threshold?: number;
        filter?: QdrantFilter;
      }
    ): Promise<QdrantSearchResult[]>;
    delete(collection: string, options: { filter: QdrantFilter }): Promise<void>;
  }
}
