// Jalanin: node src/testClient.js <userId> <roomId>
// Contoh: node src/testClient.js cand-1 <match_id_dari_testFlow>

const { io } = require("socket.io-client");

const userId = process.argv[2];
const roomId = process.argv[3];

if (!userId || !roomId) {
  console.error("Usage: node src/testClient.js <userId> <roomId>");
  process.exit(1);
}

const socket = io("http://localhost:4000", {
  auth: { userId }, // mode dev, JWT_SKIP_VERIFY=true di server
});

socket.on("connect", () => {
  console.log(`[${userId}] Connected. Joining room ${roomId}...`);
  socket.emit("join_room", { roomId });
});

socket.on("chat_history", ({ messages }) => {
  console.log(`[${userId}] Riwayat chat (${messages.length} pesan):`, messages);
});

socket.on("new_message", (message) => {
  console.log(`[${userId}] Pesan baru dari ${message.senderId}: "${message.text}"`);

  // Auto mark-as-read kalau bukan pesan sendiri
  if (message.senderId !== userId) {
    socket.emit("message_read", { roomId, messageId: message.id });
  }
});

socket.on("message_status_update", (update) => {
  console.log(`[${userId}] Status pesan ${update.messageId} -> ${update.status}`);
});

socket.on("room_created", (data) => {
  console.log(`[${userId}] Room baru dibuat:`, data);
});

socket.on("error_message", (err) => {
  console.error(`[${userId}] Error:`, err.message);
});

// Kalau dijalanin sebagai pengirim pertama, kirim pesan tes setelah 1 detik
setTimeout(() => {
  socket.emit("send_message", { roomId, text: `Halo dari ${userId}!` });
}, 1000);
