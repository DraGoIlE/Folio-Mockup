const test = require("node:test");
const assert = require("node:assert/strict");
const { SagaCoordinator } = require("../src/sagaCoordinator");

test("commits saga when the step succeeds", async () => {
  const coordinator = new SagaCoordinator();
  const state = await coordinator.run({
    id: "match-1",
    execute: async () => ({ ok: true }),
    compensate: async () => ({ rolledBack: true }),
  });

  assert.equal(state.status, "COMMITTED");
  assert.deepEqual(state.result, { ok: true });
});

test("compensates saga when the step fails", async () => {
  const coordinator = new SagaCoordinator();
  let compensated = false;

  const state = await coordinator.run({
    id: "match-2",
    execute: async () => {
      throw new Error("chat room failed");
    },
    compensate: async () => {
      compensated = true;
      return { rolledBack: true };
    },
  });

  assert.equal(state.status, "COMPENSATED");
  assert.equal(compensated, true);
  assert.equal(state.error.message, "chat room failed");
});
