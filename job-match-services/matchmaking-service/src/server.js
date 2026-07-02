const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const matchLogic = require("./matchLogic");

const PROTO_PATH = path.join(__dirname, "../../proto/matchmaking.proto");
const PORT = process.env.MATCHMAKING_PORT || 50051;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: Number,
  enums: String, // enum dikirim/diterima sebagai string: "CANDIDATE", "RIGHT", dst
  defaults: true,
  oneofs: true,
});

const matchmakingProto = grpc.loadPackageDefinition(packageDefinition).matchmaking;

async function getFeed(call, callback) {
  try {
    const { user_id, role, limit } = call.request;
    const cards = await matchLogic.getFeed(user_id, role, limit);
    callback(null, { cards });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function swipe(call, callback) {
  try {
    const { actor_id, actor_role, target_id, direction } = call.request;
    const result = await matchLogic.swipe(actor_id, actor_role, target_id, direction);
    callback(null, result);
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function getMatches(call, callback) {
  const { user_id } = call.request;
  const matches = matchLogic.getMatchesForUser(user_id);
  callback(null, { matches });
}

function streamMatchNotifications(call) {
  const { user_id } = call.request;

  const onMatch = (match) => call.write(match);
  matchLogic.subscribe(user_id, onMatch);

  call.on("cancelled", () => matchLogic.unsubscribe(user_id, onMatch));
  call.on("end", () => {
    matchLogic.unsubscribe(user_id, onMatch);
    call.end();
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(matchmakingProto.MatchmakingService.service, {
    GetFeed: getFeed,
    Swipe: swipe,
    GetMatches: getMatches,
    StreamMatchNotifications: streamMatchNotifications,
  });

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error("Gagal bind matchmaking-service:", err);
        return;
      }
      console.log(`Matchmaking Service jalan di port ${boundPort}`);
      console.log(
        `Narik data dari User Service di ${process.env.USER_SERVICE_ADDR || "localhost:50052"}`
      );
    }
  );
}

main();
