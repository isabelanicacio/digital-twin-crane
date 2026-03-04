Copyright (C) 2026 Eric Yugo Hioki, Alex Silveira de Campos, Eduardo de Senzi Zancul

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.



import opcua from "node-opcua";
import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import { Server as socketIo } from "socket.io";
import {
  connectToOPCUAServer,
  createSession,
  moveRight,
  moveLeft,
  moveUp,
  moveDown,
  openClaw,
  closeClaw,
  sensors,
  nodeIdToSensor,
  readAllSensors,
} from "./service.js";
import cors from "cors";

// === OPC UA Setup ===
const endpointUrl = process.env.OPCUA_ENDPOINT;

// === Server Setup ===
const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});
app.use(cors());

// === OPC UA Client Initialization ===
const client = await connectToOPCUAServer(endpointUrl);
let session, subscription;

(async () => {
  try {
    session = await createSession(client);
    console.log("✅ OPC UA session created");

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

    const nodesToMonitor = [
      { nodeId: sensors.I2, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I4, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I6, attributeId: opcua.AttributeIds.Value },
    ];

    for (const node of nodesToMonitor) {
      const monitoredItem = await subscription.monitor(
        node,
        { samplingInterval: 500, discardOldest: true, queueSize: 10 },
        opcua.TimestampsToReturn.Both
      );

      monitoredItem.on("changed", (dataValue) => {
        const value = dataValue.value.value;
        const sensor = nodeIdToSensor[node.nodeId] || node.nodeId;
        console.log(`📥 Sensor ${sensor} updated:`, value);

        io.emit("sensorUpdate", { sensor, value });
      });
    }
  } catch (err) {
    console.error("❌ OPC UA Error:", err);
  }
})();

// === Web Socket connection ===
io.on("connection", (socket) => {
  console.log("A client connected");

  (async () => {
    try {
      const sensorData = await readAllSensors(session);
      socket.emit("sensorData", sensorData);
    } catch (error) {
      console.error("Error reading sensors on connection:", error);
      socket.emit("sensorDataError", {
        error: "Failed to read initial sensors",
      });
    }
  })();

  socket.on("control", async (data) => {
    const { action } = data;
    console.log("Control command received:", action);

    try {
      switch (action) {
        case "move-left":
          await moveLeft(session);
          break;
        case "move-right":
          await moveRight(session);
          break;
        case "move-up":
          await moveUp(session);
          break;
        case "move-down":
          await moveDown(session);
          break;
        case "open-claw":
          await openClaw(session);
          break;
        case "close-claw":
          await closeClaw(session);
          break;
        default:
          socket.emit("controlResponse", {
            success: false,
            error: "Invalid action",
          });
      }
      socket.emit("controlResponse", { success: true, action });
    } catch (error) {
      console.error("Error processing control command:", error);
      socket.emit("controlResponse", {
        success: false,
        error: "Internal server error",
      });
    }
  });

  socket.on("readAllSensors", async () => {
    try {
      const sensorData = await readAllSensors(session);

      socket.emit("sensorData", sensorData);
    } catch (error) {
      console.error("Error reading sensors:", error);
      socket.emit("sensorDataError", { error: "Failed to read sensors" });
    }
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// === Graceful shutdown ===
process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  if (subscription) {
    await subscription.terminate();
    console.log("✅ OPC UA subscription terminated");
  }
  if (session) {
    await session.close();
    console.log("✅ OPC UA session closed");
  }
  if (client) {
    await client.disconnect();
    console.log("✅ OPC UA client disconnected");
  }

  io.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});

// === Start Server ===
server.listen(process.env.API_PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at port: ${process.env.API_PORT}`);
});

app.get("/api/read/all", async (req, res) => {
  try {
    const sensorData = await readAllSensors(session);
    return res.status(200).json(sensorData);
  } catch (error) {
    console.error("Error reading sensors:", error);
    return res.status(500).json({ error: "Failed to read sensors" });
  }
});
