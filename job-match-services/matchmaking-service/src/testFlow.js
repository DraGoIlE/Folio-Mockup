// Simulasi alur lengkap: candidate & HRD saling swipe kanan -> harus match.
//
// Jalanin: node src/testFlow.js

const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "../../proto/matchmaking.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
});
const matchmakingProto = grpc.loadPackageDefinition(packageDefinition).matchmaking;

const client = new matchmakingProto.MatchmakingService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

function call(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

async function main() {
  console.log("=== 1. Kandidat cand-1 minta feed loker ===");
  const feed = await call("GetFeed", { user_id: "cand-1", role: "CANDIDATE", limit: 5 });
  console.log(feed.cards);

  console.log("\n=== 2. HRD hrd-1 minta feed kandidat ===");
  const hrdFeed = await call("GetFeed", { user_id: "hrd-1", role: "HRD", limit: 5 });
  console.log(hrdFeed.cards);

  console.log("\n=== 3. cand-1 swipe kanan job-1 ===");
  const swipe1 = await call("Swipe", {
    actor_id: "cand-1",
    actor_role: "CANDIDATE",
    target_id: "job-1",
    direction: "RIGHT",
  });
  console.log(swipe1); // matched: false (HRD belum swipe)

  console.log("\n=== 4. hrd-1 swipe kanan cand-1 (harusnya MATCH!) ===");
  const swipe2 = await call("Swipe", {
    actor_id: "hrd-1",
    actor_role: "HRD",
    target_id: "cand-1",
    direction: "RIGHT",
  });
  console.log(swipe2); // matched: true, ada match_id

  console.log("\n=== 5. Cek daftar match cand-1 ===");
  const matches = await call("GetMatches", { user_id: "cand-1" });
  console.log(matches.matches);
}

main().catch(console.error);
