const express = require("express");
const { createClient } = require("redis");
const { LeaderboardStore } = require("./leaderboardStore");

const app = express();
app.use(express.json());

const PORT = process.env.RANKING_PORT || 50053;
const REDIS_URL = process.env.REDIS_URL;
const memoryStore = new LeaderboardStore();
let redisClient = null;

async function getRedisClient() {
  if (!REDIS_URL) return null;
  if (redisClient) return redisClient;

  redisClient = createClient({ url: REDIS_URL });
  redisClient.on("error", (err) => console.warn("Redis leaderboard warning:", err.message));
  await redisClient.connect();
  return redisClient;
}

async function incrementCounter(entityType, entityId, amount = 1) {
  const client = await getRedisClient();
  if (client) {
    const key = `ranking:${entityType}:${entityId}`;
    return client.incrBy(key, amount);
  }

  return memoryStore.increment(entityType, entityId, amount);
}

async function getLeaderboard(entityType, limit = 10) {
  const client = await getRedisClient();
  if (client) {
    try {
      const keys = await client.keys(`ranking:${entityType}:*`);
      const items = await Promise.all(
        keys.map(async (key) => {
          const score = await client.get(key);
          return {
            id: key.replace(`ranking:${entityType}:`, ""),
            score: Number(score || 0),
          };
        })
      );
      return items.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (err) {
      console.warn("Redis leaderboard read failed, falling back to memory:", err.message);
    }
  }

  return memoryStore.getLeaderboard(entityType, limit);
}

app.post("/events/popularity", async (req, res) => {
  const { entityType, entityId, amount = 1 } = req.body;

  if (!entityType || !entityId) {
    return res.status(400).json({ error: "entityType dan entityId wajib diisi" });
  }

  const score = await incrementCounter(entityType, entityId, amount);
  res.json({ ok: true, entityType, entityId, score });
});

app.get("/leaderboard/jobs", async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const items = await getLeaderboard("job", limit);
  res.json({ items });
});

app.get("/leaderboard/candidates", async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const items = await getLeaderboard("candidate", limit);
  res.json({ items });
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Ranking Service jalan di port ${PORT}`);
});
