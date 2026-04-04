import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let cachedClient: MongoClient | null = null;

function getClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
    }
    return global._mongoClient;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
  }
  return cachedClient;
}

export async function getDb(): Promise<Db> {
  const client = getClient();
  await client.connect();
  const suffix = process.env.MONGODB_DB_SUFFIX || "production";
  return client.db(`cejop_${suffix}`);
}
