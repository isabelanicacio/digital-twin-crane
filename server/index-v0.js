import cors from "cors";
import express from "express";
import morgan from "morgan";
import opcua from "node-opcua";
import dotenv from "dotenv";
dotenv.config();

// Create application
const app = express();
app.use(morgan("combined"));
app.use(express.json());

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));

app.get("/api/move-right", async (req, res) => {
  return await moveRight(res);
});
app.get("/api/move-left", async (req, res) => {
  return await moveLeft(res);
});
app.get("/api/move-up", async (req, res) => {
  return await moveUp(res);
});
app.get("/api/move-down", async (req, res) => {
  return await moveDown(res);
});
app.get("/api/open-claw", async (req, res) => {
  return await openClaw(res);
});
app.get("/api/close-claw", async (req, res) => {
  return await closeClaw(res);
});
app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

// Activate server
app.listen(process.env.API_PORT, () => {
  console.log(`Server started on http://localhost:${process.env.API_PORT}`);
});

// OPC UA Client
const endpointUrl = process.env.OPCUA_ENDPOINT;

function connectToOPCUAServer() {
  return new Promise((resolve, reject) => {
    const client = opcua.OPCUAClient.create();

    client.connect(endpointUrl, (err) => {
      if (err) {
        console.error("Error connecting to OPC UA server:", err);
        reject(err);
      } else {
        console.log("Connected to OPC UA server");
        resolve(client);
      }
    });
  });
}

function disconnectFromOPCUAServer(client) {
  return new Promise((resolve, reject) => {
    client.disconnect((err) => {
      if (err) {
        console.error("Error disconnecting from OPC UA server:", err);
        reject(err);
      } else {
        console.log("Disconnected from OPC UA server");
        resolve();
      }
    });
  });
}

function createSession(client) {
  return new Promise((resolve, reject) => {
    client.createSession((err, session) => {
      if (err) {
        console.error("Error creating OPC UA session:", err);
        reject(err);
      } else {
        console.log("OPC UA session created");
        resolve(session);
      }
    });
  });
}

function closeSession(session) {
  return new Promise((resolve, reject) => {
    session.close((err) => {
      if (err) {
        console.error("Error closing OPC UA session:", err);
        reject(err);
      } else {
        console.log("OPC UA session closed");
        resolve();
      }
    });
  });
}

const actuatorO1 = 'ns=3;s="O1"';
const actuatorO2 = 'ns=3;s="O2"';
const actuatorO3 = 'ns=3;s="O3"';
const actuatorO4 = 'ns=3;s="O4"';
const actuatorO5 = 'ns=3;s="O5"';
const actuatorO6 = 'ns=3;s="O6"';

async function tryWriteNodes(session, res, nodesToWrite, operationName) {
  try {
    const statusCodes = await session.write(nodesToWrite);
    if (statusCodes[0].isGood()) {
      console.log("Write successful!");
      return res.status(200).json({ message: `${operationName} successful` });
    } else {
      console.error("Write failed. Status Code: ", statusCodes[0].toString());
      return res.status(500).json({
        error: `${operationName} failed`,
        statusCode: statusCodes[0].toString(),
      });
    }
  } catch (error) {
    console.error(`Error during ${operationName}:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function moveRight(res) {
  const client = await connectToOPCUAServer();
  const session = await createSession(client);
  console.log("Moving right");
  const nodesToWrite = [
    {
      nodeId: actuatorO1, // NodeId of the variable
      attributeId: opcua.AttributeIds.Value, // Write to the Value attribute
      value: {
        value: {
          dataType: opcua.DataType.Boolean, // Data type of the variable
          value: true, // The value to write
        },
      },
    },
    {
      nodeId: actuatorO2, // NodeId of the variable
      attributeId: opcua.AttributeIds.Value, // Write to the Value attribute
      value: {
        value: {
          dataType: opcua.DataType.Boolean, // Data type of the variable
          value: false, // The value to write
        },
      },
    },
  ];
  const response = await tryWriteNodes(
    session,
    res,
    nodesToWrite,
    "Move Right"
  );
  await closeSession(session);
  await disconnectFromOPCUAServer(client);
  return response;
}
async function moveLeft(res) {
  const client = await connectToOPCUAServer();
  const session = await createSession(client);
  console.log("Moving left");
  const nodesToWrite = [
    {
      nodeId: actuatorO2,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuatorO1,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Move Left");
  await closeSession(session);
  await disconnectFromOPCUAServer(client);
  return response;
}
async function moveUp(res) {
  const client = await connectToOPCUAServer();
  const session = await createSession(client);
  console.log("Moving up");
  const nodesToWrite = [
    {
      nodeId: actuatorO4,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuatorO3,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Move Up");
  await closeSession(session);
  await disconnectFromOPCUAServer(client);
  return response;
}
async function moveDown(res) {
  const client = await connectToOPCUAServer();
  const session = await createSession(client);
  console.log("Moving down");
  const nodesToWrite = [
    {
      nodeId: actuatorO3,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuatorO4,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Move Down");
  await closeSession(session);
  await disconnectFromOPCUAServer(client);
  return response;
}
async function openClaw(res) {
  const client = await connectToOPCUAServer();
  const session = await createSession(client);
  console.log("Opening claw");
  const nodesToWrite = [
    {
      nodeId: actuatorO5,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuatorO6,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Open Claw");
  await closeSession(session);
  await disconnectFromOPCUAServer(client);
}
async function closeClaw(res) {
  const client = await connectToOPCUAServer();
  const session = await createSession(client);
  console.log("Closing claw");
  const nodesToWrite = [
    {
      nodeId: actuatorO6,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuatorO5,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(
    session,
    res,
    nodesToWrite,
    "Close Claw"
  );
  await closeSession(session);
  await disconnectFromOPCUAServer(client);
  return response;
}
