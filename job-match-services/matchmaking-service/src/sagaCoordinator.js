class SagaCoordinator {
  constructor() {
    this.state = new Map();
  }

  async run({ id, execute, compensate }) {
    const sagaId = id || `saga-${Date.now()}`;
    const state = {
      id: sagaId,
      status: "RUNNING",
      result: null,
      error: null,
      compensation: null,
    };

    this.state.set(sagaId, state);

    try {
      state.result = await execute();
      state.status = "COMMITTED";
      return state;
    } catch (error) {
      state.error = error;
      try {
        state.compensation = await compensate();
        state.status = "COMPENSATED";
      } catch (compensateError) {
        state.compensation = { error: compensateError.message };
        state.status = "COMPENSATION_FAILED";
      }
      return state;
    }
  }
}

module.exports = { SagaCoordinator };
