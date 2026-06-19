const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./Models/User");

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

let io = null;
const online = new Map(); // userId -> open socket count (a user can have several tabs)

const userRoom = (userId) => `user:${userId}`;
const providerRoom = (role, name) => `provider:${role}:${name}`;

function broadcastPresence() {
  if (io) io.emit("presence:update", { online: [...online.keys()] });
}

// Attach Socket.io to the HTTP server, authenticate each connection with the
// same JWT used by the REST API, and route each socket into its rooms:
//   - user:<id>                  → personal alerts (patients)
//   - provider:<role>:<name>     → messages routed by provider name
const allowList = [
  process.env.CLIENT_URL,
  "https://health-keeper-fmq4.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

function init(server) {
  io = new Server(server, {
    cors: {
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        try {
          const ok =
            allowList.includes(origin) ||
            /\.vercel\.app$/.test(new URL(origin).hostname);
          return cb(null, ok);
        } catch {
          return cb(null, false);
        }
      },
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No auth token"));
      const decoded = jwt.verify(token, SECRET);
      const user = await User.findById(decoded.id).select("name role providerName");
      if (!user) return next(new Error("User not found"));
      socket.user = {
        id: String(user._id),
        role: user.role,
        name: user.providerName || user.name,
      };
      next();
    } catch {
      next(new Error("Socket auth failed"));
    }
  });

  io.on("connection", (socket) => {
    const u = socket.user;
    socket.join(userRoom(u.id));
    if (u.role === "doctor" || u.role === "hospital") {
      socket.join(providerRoom(u.role, u.name));
    }

    online.set(u.id, (online.get(u.id) || 0) + 1);
    broadcastPresence();

    socket.on("disconnect", () => {
      const left = (online.get(u.id) || 1) - 1;
      if (left <= 0) online.delete(u.id);
      else online.set(u.id, left);
      broadcastPresence();
    });
  });

  return io;
}

function emitToUser(userId, event, payload) {
  if (io) io.to(userRoom(String(userId))).emit(event, payload);
}
function emitToProvider(role, name, event, payload) {
  if (io) io.to(providerRoom(role, name)).emit(event, payload);
}

module.exports = {
  init,
  emitToUser,
  emitToProvider,
  isOnline: (id) => online.has(String(id)),
};
