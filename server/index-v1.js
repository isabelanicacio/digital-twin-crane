import opcua from "node-opcua";
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import { Server as socketIo } from "socket.io";
import { connectToOPCUAServer, createSession } from "./service.js";
import {
  moveRight,
  moveLeft,
  moveUp,
  moveDown,
  openClaw,
  closeClaw,
  readAllSensors,
  sensorI1,
  sensorI2,
  sensorI3,
  sensorI4,
  sensorI5,
  sensorI6,
} from "./service.js";

// === OPC UA Setup ===
const endpointUrl = process.env.OPCUA_ENDPOINT;

// === Server Setup ===
const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("writeValue", (value) => {
    console.log("Value received from client:", value);
    io.emit("sensorUpdate", value); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// === OPC UA Client Initialization ===
const client = await connectToOPCUAServer();
let session, subscription;

(async () => {
  try {
    await client.connect(endpointUrl);

    session = await createSession(client);
    console.log("✅ OPC UA session created");

    // Create subscription
    subscription = opcua.ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 10,
      publishingEnabled: true,
      priority: 10,
    });

    subscription
      .on("started", () => console.log("📡 Subscription started"))
      .on("keepalive", () => console.log("📶 Keepalive"))
      .on("terminated", () => console.log("🛑 Subscription terminated"));

    // Define nodes to monitor
    const nodesToMonitor = [
      { nodeId: sensorI1, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensorI2, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensorI3, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensorI4, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensorI5, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensorI6, attributeId: opcua.AttributeIds.Value },
    ];

    // Monitor each node
    for (const node of nodesToMonitor) {
      const monitoredItem = await subscription.monitor(
        node,
        { samplingInterval: 500, discardOldest: true, queueSize: 10 },
        opcua.TimestampsToReturn.Both
      );

      monitoredItem.on("changed", (dataValue) => {
        const value = dataValue.value.value;
        console.log(`📥 Node ${node.nodeId} updated:`, value);

        // Emit to frontend
        io.emit("sensorUpdate", { nodeId: node.nodeId, value });
      });
    }
  } catch (err) {
    console.error("❌ OPC UA Error:", err);
  }
})();

// === Start Server ===
server.listen(process.env.API_PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.API_PORT}`);
});

app.get("/api/control/:action", async (req, res) => {
  const action = req.params.action;
  console.log("Requested action:", action);

  switch (action) {
    case "move-right":
      return await moveRight(res, session);
    case "move-left":
      return await moveLeft(res, session);
    case "move-up":
      return await moveUp(res, session);
    case "move-down":
      return await moveDown(res, session);
    case "open-claw":
      return await openClaw(res, session);
    case "close-claw":
      return await closeClaw(res, session);
    default:
      return res.status(400).json({ error: "Invalid movement type" });
  }
});

app.get("/api/read/all", async (req, res) => {
  return await readAllSensors(session);
});
