const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const roomManager = require("./roomManager");

const PORT = process.env.CHAT_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-ganti-nanti";
const JWT_SKIP_VERIFY = process.env.JWT_SKIP_VERIFY === "true";

const app = express();
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }, // longgarin buat dev, ketatin lagi pas production
});

// ---------------------------------------------------------------------
// REST internal: dipanggil Matchmaking Service begitu ada match baru.
// Ini titik integrasi Saga Pattern (Tahap 3): nanti Matchmaking Service
// akan menganggap panggilan ini sebagai salah satu langkah transaksi,
// dan rollback match kalau panggilan ini gagal.
// ---------------------------------------------------------------------
app.post("/internal/rooms", (req, res) => {
  const { match_id, candidate_id, hrd_id, job_id } = req.body;

  if (!match_id || !candidate_id || !hrd_id) {
    return res.status(400).json({ error: "match_id, candidate_id, hrd_id wajib diisi" });
  }

  const room = roomManager.createRoom({
    matchId: match_id,
    candidateId: candidate_id,
    hrdId: hrd_id,
    jobId: job_id,
  });

  console.log(`Room chat dibuat buat match ${match_id} (${candidate_id} <-> ${hrd_id})`);

  // Kasih tau user yang lagi online kalau room baru muncul, biar
  // UI-nya bisa auto-redirect ke halaman chat
  io.to(`user:${candidate_id}`).emit("room_created", { room_id: room.roomId });
  io.to(`user:${hrd_id}`).emit("room_created", { room_id: room.roomId });

  res.status(201).json({ room_id: room.roomId });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---------------------------------------------------------------------
// Socket.io: chat real-time
// ---------------------------------------------------------------------
io.use((socket, next) => {
  const { token, userId } = socket.handshake.auth || {};

  if (JWT_SKIP_VERIFY) {
    socket.userId = userId || `guest-${socket.id}`;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.playerId || decoded.sub || decoded.userId;
    next();
  } catch (err) {
    next(new Error("Token tidak valid"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`User ${userId} connect (socket ${socket.id})`);

  // Room pribadi per-user, dipakai buat notifikasi "room_created" di atas
  socket.join(`user:${userId}`);

  socket.on("join_room", ({ roomId }) => {
    if (!roomManager.isParticipant(roomId, userId)) {
      socket.emit("error_message", { message: "Kamu bukan bagian dari room ini" });
      return;
    }

    socket.join(roomId);
    roomManager.joinSocket(roomId, userId, socket);

    // Kirim history begitu join, biar UI langsung bisa render percakapan lama
    socket.emit("chat_history", { roomId, messages: roomManager.getHistory(roomId) });
  });

  socket.on("send_message", ({ roomId, text }) => {
    if (!roomManager.isParticipant(roomId, userId)) return;
    if (!text || typeof text !== "string" || !text.trim()) return;

    const message = roomManager.addMessage(roomId, userId, text.trim());
    if (!message) return;

    io.to(roomId).emit("new_message", message);
  });

  socket.on("message_read", ({ roomId, messageId }) => {
    const message = roomManager.markRead(roomId, messageId, userId);
    if (!message) return;

    io.to(roomId).emit("message_status_update", {
      roomId,
      messageId: message.id,
      status: message.status,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnect`);
    for (const [roomId, room] of roomManager.rooms.entries()) {
      if (room.sockets.has(userId)) {
        roomManager.leaveSocket(roomId, userId, socket);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chat Service (Socket.io) jalan di port ${PORT}`);
  console.log(`Internal room-creation endpoint: POST http://localhost:${PORT}/internal/rooms`);
});
