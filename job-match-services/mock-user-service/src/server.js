const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { candidates, jobs } = require("./seedData");

const PROTO_PATH = path.join(__dirname, "../../proto/user.proto");
const PORT = process.env.USER_SERVICE_PORT || 50052;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).userservice;

function getCandidateProfile(call, callback) {
  const found = candidates.find((c) => c.id === call.request.id);
  if (!found) {
    return callback({ code: grpc.status.NOT_FOUND, message: "Candidate not found" });
  }
  callback(null, found);
}

function getJobProfile(call, callback) {
  const found = jobs.find((j) => j.id === call.request.id);
  if (!found) {
    return callback({ code: grpc.status.NOT_FOUND, message: "Job not found" });
  }
  callback(null, found);
}

function listCandidates(call, callback) {
  const { limit } = call.request;
  const result = limit > 0 ? candidates.slice(0, limit) : candidates;
  callback(null, { candidates: result });
}

function listJobs(call, callback) {
  const { limit } = call.request;
  const result = limit > 0 ? jobs.slice(0, limit) : jobs;
  callback(null, { jobs: result });
}

function main() {
  const server = new grpc.Server();

  server.addService(userProto.UserService.service, {
    GetCandidateProfile: getCandidateProfile,
    GetJobProfile: getJobProfile,
    ListCandidates: listCandidates,
    ListJobs: listJobs,
  });

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error("Gagal bind mock-user-service:", err);
        return;
      }
      console.log(`[MOCK] User Service jalan di port ${boundPort}`);
      console.log("Ganti service ini dengan implementasi asli Rehanu kalau udah siap.");
    }
  );
}

main();
