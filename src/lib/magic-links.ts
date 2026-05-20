import crypto from "crypto";
import { getDb } from "./mongodb";

const COLLECTION = "magic_links";
const TOKEN_TTL_MIN = 15;
const RATE_LIMIT_WINDOW_MIN = 10;
const RATE_LIMIT_MAX = 3;

export type MagicLinkRecord = {
  token: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
  ip?: string;
  ua?: string;
};

let indexesEnsured = false;
async function ensureIndexes() {
  if (indexesEnsured) return;
  const db = await getDb();
  const col = db.collection<MagicLinkRecord>(COLLECTION);
  await col.createIndex({ token: 1 }, { unique: true });
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await col.createIndex({ email: 1, createdAt: -1 });
  indexesEnsured = true;
}

export async function isRateLimited(email: string): Promise<boolean> {
  await ensureIndexes();
  const db = await getDb();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000);
  const count = await db
    .collection<MagicLinkRecord>(COLLECTION)
    .countDocuments({ email, createdAt: { $gte: since } });
  return count >= RATE_LIMIT_MAX;
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://cejoptucuman.com"
  );
}

export async function createMagicLink(
  email: string,
  meta: { ip?: string; ua?: string } = {},
): Promise<{ token: string; url: string; expiresAt: Date }> {
  await ensureIndexes();
  const db = await getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MIN * 60 * 1000);

  await db.collection<MagicLinkRecord>(COLLECTION).insertOne({
    token,
    email,
    createdAt: now,
    expiresAt,
    consumedAt: null,
    ...meta,
  });

  const url = `${appBaseUrl()}/api/cande/verify?token=${token}`;
  return { token, url, expiresAt };
}

export async function consumeMagicLink(token: string): Promise<string | null> {
  if (!token || typeof token !== "string") return null;
  await ensureIndexes();
  const db = await getDb();
  const now = new Date();

  const result = await db
    .collection<MagicLinkRecord>(COLLECTION)
    .findOneAndUpdate(
      {
        token,
        consumedAt: null,
        expiresAt: { $gt: now },
      },
      { $set: { consumedAt: now } },
      { returnDocument: "after" },
    );

  if (!result) return null;
  return result.email;
}

export const MAGIC_LINK_TTL_MINUTES = TOKEN_TTL_MIN;
