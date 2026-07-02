# Real-Time Services (Mpay) — Job Match App

Prototype Tahap 1 (Matchmaking, gRPC) + Tahap 2 (Chat, Socket.io) yang jadi tanggung jawab Mpay.

Karena User Service asli (punya Rehanu) belum ada, project ini include
**mock-user-service** — implementasi dummy dari kontrak `.proto` yang sama,
biar kamu bisa develop & test independen. Begitu Rehanu selesai, tinggal
matikan mock ini dan arahkan `USER_SERVICE_ADDR` ke service asli — kode
Matchmaking Service TIDAK PERLU diubah sama sekali.

## Struktur

```
job-match-services/
├── proto/
│   ├── user.proto          # kontrak User Service (Rehanu wajib ikutin ini)
│   └── matchmaking.proto   # kontrak Matchmaking Service (kamu)
├── mock-user-service/       # stub sementara, data dummy in-memory
│   └── src/
│       ├── seedData.js
│       └── server.js
├── matchmaking-service/     # gRPC: feed, swipe, match detection
│   └── src/
│       ├── userServiceClient.js  # gRPC client ke User Service
│       ├── matchLogic.js         # feed, swipe, match detection, panggil Chat Service saat match
│       ├── server.js              # gRPC handlers
│       └── testFlow.js            # simulasi alur end-to-end (feed -> swipe -> match)
└── chat-service/            # Socket.io: real-time messaging
    └── src/
        ├── roomManager.js    # room, pesan, status terkirim/dibaca, history
        ├── server.js          # Socket.io server + REST internal buat bikin room
        └── testClient.js      # simulasi 2 user chat
```

## Quick start untuk teammate

### Jalankan dengan Docker (recommended)
Kalau mau jalankan semua service sekaligus:
```bash
docker compose up --build
```
Service yang akan tersedia:
- Mock User Service: http://localhost:50052
- Matchmaking Service: http://localhost:50051
- Chat Service: http://localhost:4000
- Ranking Service: http://localhost:50053
- Redis: localhost:6379

### Jalankan manual (tanpa Docker)

Berikut panduan langkah demi langkah supaya teammate bisa jalankan project ini dari nol.

### Prasyarat
- Node.js 18+ dan npm
- Opsional: Docker kalau mau pakai Redis lokal
- Terminal atau PowerShell terpisah untuk 3 service

### 1. Install dependency untuk semua service
Buka terminal dari root project lalu jalankan:
```bash
cd mock-user-service && npm install
cd ../matchmaking-service && npm install
cd ../chat-service && npm install
```

### 2. Jalankan Mock User Service
Buka terminal pertama:
```bash
cd mock-user-service
npm start
```
Service ini akan berjalan di port 50052.

### 3. Jalankan Matchmaking Service
Buka terminal kedua:
```bash
cd matchmaking-service
npm start
```
Service ini akan berjalan di port 50051 dan terhubung ke User Service mock.

### 4. Jalankan Chat Service
Buka terminal ketiga:
```bash
cd chat-service
JWT_SKIP_VERIFY=true npm start
```
Service ini akan berjalan di port 4000.

### 5. Verifikasi service sudah hidup
Cek log di masing-masing terminal. Bila berhasil, kamu akan melihat:
- Mock User Service: `User Service jalan di port 50052`
- Matchmaking Service: `Matchmaking Service jalan di port 50051`
- Chat Service: `Chat Service (Socket.io) jalan di port 4000`

### 6. Jalankan alur end-to-end
Di terminal keempat:
```bash
cd matchmaking-service
node src/testFlow.js
```
Script ini akan:
1. Minta feed dari matchmaking service
2. Lakukan swipe kanan dari candidate dan HRD
3. Membuat match
4. Memicu pembuatan room chat lewat chat service

Kalau berhasil, kamu akan melihat output `matched: true` dan ada `match_id`.

### 7. Coba chat real-time pakai test client
Setelah ada `match_id` dari output testFlow, jalankan:
```bash
cd chat-service
node src/testClient.js cand-1 <match_id>
```
Di terminal lain:
```bash
cd chat-service
node src/testClient.js hrd-1 <match_id>
```
Keduanya akan saling kirim dan menerima pesan, lalu status pesan berganti ke `read`.

### 8. Optional: aktifkan Redis untuk popularity counter
Kalau mau pakai Redis untuk ranking service, jalankan Redis lokal dulu:
```bash
docker run --name job-match-redis -p 6379:6379 -d redis:7
```
Lalu jalankan matchmaking service dengan env var:
```powershell
set REDIS_URL=redis://localhost:6379
```
Kalau `REDIS_URL` tidak ada, service akan otomatis pakai fallback memory.

### 9. Jalankan test saga
```bash
cd matchmaking-service
npm test
```
Harus muncul 2 test passed dan 0 failed.

## Status implementasi yang sudah selesai

- Saga Pattern untuk alur `match -> chat room creation` sudah diimplementasikan.
  Matchmaking Service sekarang memproses pembuatan room chat sebagai langkah kedua dari saga; kalau chat-service gagal, flow akan dikompensasi dan match tidak akan dipakai.
- Integrasi popularity counter opsional lewat Redis sudah ditambahkan.
  Bila `REDIS_URL` tersedia, matchmaking service akan menambah counter untuk job/candidate/hrd. Bila tidak ada Redis, sistem pakai fallback memory.
- Dokumentasi API/proto sudah diperbarui.
  Kontrak gRPC ada di [proto/matchmaking.proto](proto/matchmaking.proto) dan [proto/user.proto](proto/user.proto).

## Alur logic Matchmaking

**Feed**: kandidat dapet daftar loker (diurutin berdasarkan skill overlap),
HRD dapet daftar kandidat (diurutin berdasarkan skill yang dibutuhin gabungan
semua loker yang dia posting). Item yang udah pernah di-swipe otomatis
di-exclude dari feed.

**Match detection**: setiap kali ada swipe kanan, sistem cek apakah pihak
lain udah pernah swipe kanan juga. Kalau iya -> match tercipta, semua
listener yang subscribe ke `StreamMatchNotifications` langsung dapet
notifikasi, DAN Chat Service otomatis diminta bikin room baru.

## Alur Chat Service

**Pembuatan room otomatis**: Matchmaking Service memanggil `POST /internal/rooms`
ke Chat Service setiap kali match terjadi. Flow ini sekarang berjalan sebagai bagian
from saga: kalau pembuatan room gagal, proses match akan dikompensasi.

**Socket.io events**:

| Event | Arah | Keterangan |
|---|---|---|
| `join_room` | client -> server | Join ke room, dapet history balik |
| `chat_history` | server -> client | Riwayat pesan di room |
| `send_message` | client -> server | Kirim pesan teks |
| `new_message` | server -> client | Broadcast pesan baru ke semua di room |
| `message_read` | client -> server | Tandain pesan udah dibaca |
| `message_status_update` | server -> client | Broadcast perubahan status sent->read |
| `room_created` | server -> client | Notif ke user kalau room baru muncul (buat auto-redirect ke halaman chat) |

## Lokasi penting untuk dipelajari lebih lanjut

Kalau teammate mau lanjut develop, area yang paling relevan adalah:
- [matchmaking-service/src/matchLogic.js](matchmaking-service/src/matchLogic.js) — alur match, saga, dan popularity counter
- [matchmaking-service/src/sagaCoordinator.js](matchmaking-service/src/sagaCoordinator.js) — logika kompensasi sederhana
- [chat-service/src/server.js](chat-service/src/server.js) — endpoint internal pembuatan room dan Socket.io events
- [chat-service/src/roomManager.js](chat-service/src/roomManager.js) — state room dan pesan chat

## Yang perlu disamain sama Rehan

Kontrak `proto/user.proto` ini yang jadi "kontrak kerja" antara Matchmaking
Service dan User Service. Kalau Rehanu mau nambah field atau ubah struktur,
harus dikoordinasikan dulu karena Matchmaking Service bergantung ke bentuk
data ini persis.

## Yang perlu disamain sama Topler (DevOps)

- 3 service ini masing-masing punya `package.json` sendiri dan port sendiri
  (50052, 50051, 4000) -> tinggal bikin `Dockerfile` per folder.
- Chat Service butuh env var `CHAT_SERVICE_URL` di sisi Matchmaking Service
  (default `http://localhost:4000`) supaya bisa saling manggil di dalam
  Docker network nanti (biasanya jadi nama service, misal `http://chat-service:4000`).
- State matchmaking & chat rooms sekarang IN-MEMORY per instance. Kalau nanti
  mau di-scale >1 instance di belakang load balancer, state ini WAJIB dipindah
  ke Redis dulu (lihat catatan TODO di kode) sebelum di-deploy multi-instance.
