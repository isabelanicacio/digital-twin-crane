import opcua from "node-opcua";
import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import { Server as socketIo } from "socket.io";
import { sensors } from "./service.js";

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

  // Automatically read all sensors and send initial data to the client
  (async () => {
    try {
      const dataValues = [
        { nodeId: sensors.I1, value: false },
        { nodeId: sensors.I2, value: true },
        { nodeId: sensors.I3, value: false },
        { nodeId: sensors.I4, value: true },
        { nodeId: sensors.I5, value: false },
        { nodeId: sensors.I6, value: true },
      ];

      // Format the response
      const sensorData = dataValues.map((dataValue, index) => ({
        sensor: `I${index + 1}`,
        value: dataValue.value, // check what is the value
      }));

      // Emit initial sensor data to the newly connected client
      socket.emit("sensorData", sensorData);
    } catch (error) {
      console.error("Error reading sensors on connection:", error);
      socket.emit("sensorDataError", {
        error: "Failed to read initial sensors",
      });
    }
  })();

  // Handle control commands (e.g., move-right, move-left)
  socket.on("control", async (data) => {
    const { action } = data;
    console.log("Control command received:", action);

    try {
      switch (action) {
        case "move-left":
          socket.emit("controlResponse", { success: true, action });
          io.emit("sensorUpdate", {
            sensor: "I1",
            value: true,
          });
          break;
        case "move-right":
          socket.emit("controlResponse", { success: true, action });
          io.emit("sensorUpdate", {
            sensor: "I2",
            value: true,
          });
          break;
        case "move-up":
          socket.emit("controlResponse", { success: true, action });
          io.emit("sensorUpdate", {
            sensor: "I3",
            value: true,
          });
          break;
        case "move-down":
          socket.emit("controlResponse", { success: true, action });
          io.emit("sensorUpdate", {
            sensor: "I4",
            value: true,
          });
          break;
        case "open-claw":
          socket.emit("controlResponse", { success: true, action });
          io.emit("sensorUpdate", {
            sensor: "I5",
            value: true,
          });
          break;
        case "close-claw":
          socket.emit("controlResponse", { success: true, action });
          io.emit("sensorUpdate", {
            sensor: "I6",
            value: true,
          });
          break;
        default:
          socket.emit("controlResponse", {
            success: false,
            error: "Invalid action",
          });
      }
    } catch (error) {
      console.error("Error processing control command:", error);
      socket.emit("controlResponse", {
        success: false,
        error: "Internal server error",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  io.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});

// === Start Server ===
server.listen(process.env.API_PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.API_PORT}`);
});

app.get("/api/control/:action", async (req, res) => {
  const action = req.params.action;
  console.log("Requested action:", action);

  switch (action) {
    case "move-right":
      io.emit("sensorUpdate", {
        sensor: "I2",
        value: true,
      });
      return res.status(200).json({ message: `${action} successful` });
    case "move-left":
      io.emit("sensorUpdate", {
        sensor: "I1",
        value: true,
      });
      return res.status(200).json({ message: `${action} successful` });

    case "move-up":
      io.emit("sensorUpdate", {
        sensor: "I3",
        value: true,
      });
      return res.status(200).json({ message: `${action} successful` });

    case "move-down":
      io.emit("sensorUpdate", {
        sensor: "I4",
        value: true,
      });
      return res.status(200).json({ message: `${action} successful` });

    case "open-claw":
      io.emit("sensorUpdate", {
        sensor: "I5",
        value: true,
      });
      return res.status(200).json({ message: `${action} successful` });

    case "close-claw":
      io.emit("sensorUpdate", {
        sensor: "I6",
        value: true,
      });
      return res.status(200).json({ message: `${action} successful` });

    default:
      return res.status(400).json({ error: "Invalid movement type" });
  }
});

// app.get("/api/read/all", async (req, res) => {
//   return await readAllSensors(session);
// });
