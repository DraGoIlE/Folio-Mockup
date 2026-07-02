const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "../../proto/user.proto");
const USER_SERVICE_ADDR = process.env.USER_SERVICE_ADDR || "localhost:50052";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).userservice;

const client = new userProto.UserService(
  USER_SERVICE_ADDR,
  grpc.credentials.createInsecure()
);

// Bungkus jadi Promise biar enak dipakai async/await
function listCandidates(preferredSkills = [], limit = 20) {
  return new Promise((resolve, reject) => {
    client.ListCandidates(
      { preferred_skills: preferredSkills, limit },
      (err, res) => (err ? reject(err) : resolve(res.candidates))
    );
  });
}

function listJobs(candidateSkills = [], limit = 20) {
  return new Promise((resolve, reject) => {
    client.ListJobs(
      { candidate_skills: candidateSkills, limit },
      (err, res) => (err ? reject(err) : resolve(res.jobs))
    );
  });
}

function getJobProfile(jobId) {
  return new Promise((resolve, reject) => {
    client.GetJobProfile({ id: jobId }, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

function getCandidateProfile(candidateId) {
  return new Promise((resolve, reject) => {
    client.GetCandidateProfile({ id: candidateId }, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
}

module.exports = { listCandidates, listJobs, getJobProfile, getCandidateProfile };
