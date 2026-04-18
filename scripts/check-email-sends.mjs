import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const suffix = process.env.MONGODB_DB_SUFFIX || "test";
const client = new MongoClient(uri);
await client.connect();
const db = client.db(`cejop_${suffix}`);

const sends = await db
  .collection("email_sends")
  .find({})
  .sort({ sentAt: -1 })
  .limit(10)
  .toArray();

console.log(`---Últimos 10 registros en email_sends (cejop_${suffix}):`);
for (const s of sends) {
  console.log(JSON.stringify({
    mail: s.mail,
    campaign: s.campaign,
    status: s.status,
    error: s.error,
    sentAt: s.sentAt,
    resendId: s.resendId,
  }, null, 2));
}

const feedbackSends = await db
  .collection("email_sends")
  .find({ campaign: "gracias-feedback-encuentro-1" })
  .sort({ sentAt: -1 })
  .limit(5)
  .toArray();

console.log(`\n---Solo feedback: ${feedbackSends.length} registros`);

const feedbacks = await db
  .collection("feedback_encuentro_1")
  .find({})
  .sort({ createdAt: -1 })
  .limit(5)
  .toArray();

console.log(`\n---Últimos feedbacks (${feedbacks.length}):`);
for (const f of feedbacks) {
  console.log(JSON.stringify({ mail: f.mail, createdAt: f.createdAt }, null, 2));
}

await client.close();
