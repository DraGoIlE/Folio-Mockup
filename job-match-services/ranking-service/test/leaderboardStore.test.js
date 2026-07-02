const test = require("node:test");
const assert = require("node:assert/strict");
const { LeaderboardStore } = require("../src/leaderboardStore");

test("increments and sorts leaderboard entries", () => {
  const store = new LeaderboardStore();
  store.increment("job", "job-1", 2);
  store.increment("job", "job-2", 5);
  store.increment("job", "job-1", 1);

  const leaderboard = store.getLeaderboard("job", 5);

  assert.deepEqual(leaderboard, [
    { id: "job-2", score: 5 },
    { id: "job-1", score: 3 },
  ]);
});
