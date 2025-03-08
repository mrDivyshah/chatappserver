
require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = "mongodb+srv://semple2266:Divy123@cluster0.ogl5m.mongodb.net/chatApp";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define MongoDB Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  uuid: { type: String, unique: true, required: true },
});
const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema({
  senderUUID: { type: String, required: true },
  receiverUUID: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

const onlineUsers = new Map();


app.get("/", (req, res) => {
  res.send("Hello from Node.js on Vercel!");
});

// API Routes
app.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/messages/:uuid", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderUUID: req.params.uuid }, { receiverUUID: req.params.uuid }],
    }).sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/online-users", (req, res) => {
  let { search = "", skip = 0, take = 10 } = req.query;
  skip = parseInt(skip);
  take = parseInt(take);
  let usersArray = Array.from(onlineUsers.values());
  if (search) {
    usersArray = usersArray.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()));
  }
  const paginatedUsers = usersArray.slice(skip, skip + take);
  res.json({ total: usersArray.length, users: paginatedUsers });
});

app.post("/join", async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username, uuid: uuidv4() });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("🟢 New user connected");

  socket.on("register", ({ username, uuid }) => {
    socket.join(uuid);
    onlineUsers.set(uuid, { username, uuid, socketId: socket.id });
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = new Message(data);
      await newMessage.save();
      io.to(data.receiverUUID).emit("receiveMessage", { ...data, timestamp: new Date() });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("seenMessage", async ({ messageIds }) => {
    if (!Array.isArray(messageIds) || messageIds.length === 0) return;
    try {
      await Message.deleteMany({ _id: { $in: messageIds } });
      console.log("🗑️ Messages deleted after being seen.");
    } catch (err) {
      console.error("Error deleting messages:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const [uuid, user] of onlineUsers) {
      if (user.socketId === socket.id) {
        onlineUsers.delete(uuid);
        io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
        break;
      }
    }
  });
});

// Delete messages older than 24 hours every hour
setInterval(async () => {
  try {
    const result = await Message.deleteMany({ timestamp: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    console.log(`🕒 Deleted ${result.deletedCount} old messages`);
  } catch (err) {
    console.error("Error deleting old messages:", err);
  }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
