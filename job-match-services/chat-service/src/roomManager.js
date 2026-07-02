const { randomUUID } = require("crypto");

/**
 * In-memory chat room store.
 *
 * roomId = matchId (1 match = 1 room, dibuat otomatis begitu Matchmaking
 * Service memberitahu ada match baru lewat POST /internal/rooms).
 *
 * CATATAN buat scaling nanti (sama kayak matchmaking): kalau chat-service
 * di-scale >1 instance, state ini harus pindah ke Redis/DB biar konsisten
 * antar instance. Untuk prototype ini in-memory cukup.
 */
class RoomManager {
  constructor() {
    // roomId -> { candidateId, hrdId, jobId, messages: [], sockets: Map<userId, Set<socket>> }
    this.rooms = new Map();
  }

  createRoom({ matchId, candidateId, hrdId, jobId }) {
    if (this.rooms.has(matchId)) {
      return this.rooms.get(matchId); // idempotent, match yang sama gak bikin room dobel
    }

    const room = {
      roomId: matchId,
      candidateId,
      hrdId,
      jobId,
      messages: [],
      sockets: new Map(),
    };

    this.rooms.set(matchId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  isParticipant(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.candidateId === userId || room.hrdId === userId;
  }

  joinSocket(roomId, userId, socket) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    if (!room.sockets.has(userId)) room.sockets.set(userId, new Set());
    room.sockets.get(userId).add(socket);
  }

  leaveSocket(roomId, userId, socket) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.sockets.get(userId)?.delete(socket);
  }

  addMessage(roomId, senderId, text) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message = {
      id: randomUUID(),
      roomId,
      senderId,
      text,
      status: "sent", // "sent" -> "read"
      timestamp: Date.now(),
    };

    room.messages.push(message);
    return message;
  }

  markRead(roomId, messageId, readerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message = room.messages.find((m) => m.id === messageId);
    if (!message) return null;

    // Cuma penerima (bukan pengirim) yang bisa nandain pesan sebagai "read"
    if (message.senderId === readerId) return null;

    message.status = "read";
    return message;
  }

  getHistory(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.messages : [];
  }

  getSocketsFor(roomId, userId) {
    return this.rooms.get(roomId)?.sockets.get(userId) || new Set();
  }

  getAllSocketsInRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return [...room.sockets.values()].flatMap((set) => [...set]);
  }
}

module.exports = new RoomManager();
