class LeaderboardStore {
  constructor() {
    this.store = new Map();
  }

  increment(entityType, entityId, amount = 1) {
    const key = `${entityType}:${entityId}`;
    const nextValue = (this.store.get(key) || 0) + amount;
    this.store.set(key, nextValue);
    return nextValue;
  }

  getLeaderboard(entityType, limit = 10) {
    return [...this.store.entries()]
      .filter(([key]) => key.startsWith(`${entityType}:`))
      .map(([key, score]) => ({
        id: key.replace(`${entityType}:`, ""),
        score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = { LeaderboardStore };
