const { randomUUID } = require("crypto");
const userClient = require("./userServiceClient");
const { SagaCoordinator } = require("./sagaCoordinator");

const sagaCoordinator = new SagaCoordinator();

// swipesByActor: Map<actorId, Map<targetId, "LEFT"|"RIGHT">>
const swipesByActor = new Map();

// matches: Map<matchId, MatchInfo>
const matches = new Map();

// notification listeners per user (buat streaming gRPC)
const listeners = new Map(); // userId -> [callback]

// popularity counters untuk ranking service, fallback ke memory kalau Redis belum tersedia
const popularityCounters = new Map();

function recordSwipe(actorId, targetId, direction) {
  if (!swipesByActor.has(actorId)) swipesByActor.set(actorId, new Map());
  swipesByActor.get(actorId).set(targetId, direction);
}

function getSwipe(actorId, targetId) {
  return swipesByActor.get(actorId)?.get(targetId);
}

async function getFeed(userId, role, limit = 20) {
  const alreadySwiped = swipesByActor.get(userId) || new Map();

  if (role === "CANDIDATE") {
    // Ambil profil kandidat buat tau skill-nya (dipakai buat scoring)
    // NOTE: kalau candidate profile belum ke-seed di mock, fallback ke skill kosong
    let mySkills = [];
    try {
      const me = await userClient.getCandidateProfile(userId);
      mySkills = me.skills;
    } catch {
      // user belum ada di mock data, gpp, tetep tampilin feed tanpa personalisasi
    }

    const jobs = await userClient.listJobs(mySkills, 0);
    return jobs
      .filter((j) => !alreadySwiped.has(j.id))
      .map((j) => ({
        target_id: j.id,
        title: j.title,
        subtitle: j.company_name,
        tags: j.required_skills,
        relevance_score: _scoreOverlap(mySkills, j.required_skills),
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit || 20);
  }

  if (role === "HRD") {
    // Untuk HRD, kita ambil skill gabungan dari semua job yang dia posting
    const allJobs = await userClient.listJobs([], 0);
    const myJobs = allJobs.filter((j) => j.hrd_id === userId);
    const requiredSkills = [...new Set(myJobs.flatMap((j) => j.required_skills))];

    const candidates = await userClient.listCandidates(requiredSkills, 0);
    return candidates
      .filter((c) => !alreadySwiped.has(c.id))
      .map((c) => ({
        target_id: c.id,
        title: c.name,
        subtitle: `${c.experience_years} tahun pengalaman`,
        tags: c.skills,
        relevance_score: _scoreOverlap(requiredSkills, c.skills),
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit || 20);
  }

  return [];
}

function _scoreOverlap(skillsA, skillsB) {
  const setB = new Set((skillsB || []).map((s) => s.toLowerCase()));
  const overlap = (skillsA || []).filter((s) => setB.has(s.toLowerCase())).length;
  return overlap;
}

async function swipe(actorId, actorRole, targetId, direction) {
  recordSwipe(actorId, targetId, direction);

  if (direction !== "RIGHT") {
    return { recorded: true, matched: false, match_id: "" };
  }

  try {
    if (actorRole === "CANDIDATE") {
      const job = await userClient.getJobProfile(targetId);
      const hrdSwipe = getSwipe(job.hrd_id, actorId);

      if (hrdSwipe === "RIGHT") {
        const match = await _createMatch(actorId, job.id, job.hrd_id);
        if (match) {
          return { recorded: true, matched: true, match_id: match.match_id };
        }
      }
    }

    if (actorRole === "HRD") {
      const allJobs = await userClient.listJobs([], 0);
      const myJobs = allJobs.filter((j) => j.hrd_id === actorId);

      for (const job of myJobs) {
        if (getSwipe(targetId, job.id) === "RIGHT") {
          const match = await _createMatch(targetId, job.id, actorId);
          if (match) {
            return { recorded: true, matched: true, match_id: match.match_id };
          }
        }
      }
    }
  } catch (err) {
    console.error("Error saat cek match:", err.message);
  }

  return { recorded: true, matched: false, match_id: "" };
}

async function _createMatch(candidateId, jobId, hrdId) {
  const matchId = randomUUID();
  const match = {
    match_id: matchId,
    candidate_id: candidateId,
    job_id: jobId,
    hrd_id: hrdId,
    matched_at: Date.now(),
  };

  const sagaResult = await sagaCoordinator.run({
    id: matchId,
    execute: async () => {
      await _requestChatRoomCreation(match);
      await _trackPopularity(match);
      return { created: true };
    },
    compensate: async () => {
      return { removed: !matches.has(matchId), matchId };
    },
  });

  if (sagaResult.status === "COMPENSATED") {
    console.warn(`Saga dikompensasi untuk match ${matchId}:`, sagaResult.error?.message || "chat room creation failed");
    return null;
  }

  matches.set(matchId, match);
  _notify(candidateId, match);
  _notify(hrdId, match);
  return match;
}

async function _requestChatRoomCreation(match) {
  const chatServiceUrl = process.env.CHAT_SERVICE_URL || "http://localhost:4000";

  const res = await fetch(`${chatServiceUrl}/internal/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: match.match_id,
      candidate_id: match.candidate_id,
      hrd_id: match.hrd_id,
      job_id: match.job_id,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat Service merespon status ${res.status}`);
  }
}

async function _trackPopularity(match) {
  const rankingServiceUrl = process.env.RANKING_SERVICE_URL || "http://localhost:50053";
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    const key = `popularity:${match.job_id}`;
    popularityCounters.set(key, (popularityCounters.get(key) || 0) + 1);
    return { tracked: false, fallback: true };
  }

  try {
    const { createClient } = require("redis");
    const client = createClient({ url: redisUrl });
    client.on("error", (err) => console.error("Redis popularity error:", err.message));
    await client.connect();

    await client.incr(`ranking:popularity:${match.job_id}`);
    await client.incr(`ranking:popularity:${match.candidate_id}`);
    await client.incr(`ranking:popularity:${match.hrd_id}`);
    await client.disconnect();

    await fetch(`${rankingServiceUrl}/events/popularity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType: "job", entityId: match.job_id, amount: 1 }),
    });

    return { tracked: true, fallback: false };
  } catch (err) {
    console.warn("Redis popularity counter unavailable, memakai fallback memory:", err.message);
    const key = `popularity:${match.job_id}`;
    popularityCounters.set(key, (popularityCounters.get(key) || 0) + 1);
    return { tracked: false, fallback: true };
  }
}

function getMatchesForUser(userId) {
  return [...matches.values()].filter(
    (m) => m.candidate_id === userId || m.hrd_id === userId
  );
}

function subscribe(userId, callback) {
  if (!listeners.has(userId)) listeners.set(userId, []);
  listeners.get(userId).push(callback);
}

function unsubscribe(userId, callback) {
  const arr = listeners.get(userId);
  if (!arr) return;
  listeners.set(userId, arr.filter((cb) => cb !== callback));
}

function _notify(userId, match) {
  const arr = listeners.get(userId);
  if (!arr) return;
  arr.forEach((cb) => cb(match));
}

module.exports = {
  getFeed,
  swipe,
  getMatchesForUser,
  subscribe,
  unsubscribe,
};
