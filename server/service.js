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
// Actuator and sensor dictionaries

const actuators = {
  O1: 'ns=3;s="O1"',
  O2: 'ns=3;s="O2"',
  O3: 'ns=3;s="O3"',
  O4: 'ns=3;s="O4"',
  O5: 'ns=3;s="O5"',
  O6: 'ns=3;s="O6"',
};

export const sensors = {
  I2: 'ns=3;s="I2"',
  I4: 'ns=3;s="I4"',
  I6: 'ns=3;s="I6"',
};
export function connectToOPCUAServer(endpointUrl) {
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

export function createSession(client) {
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

async function tryWriteNodes(session, nodesToWrite, operationName) {
  try {
    const statusCodes = await session.write(nodesToWrite);
    if (statusCodes[0].isGood()) {
      console.log(`${operationName} successful`);
    } else {
      console.error(
        `${operationName}  failed. Status Code: `,
        statusCodes[0].toString()
      );
    }
  } catch (error) {
    console.error(`Error during ${operationName}:`, error);
  }
}

export async function moveRight(session) {
  console.log("Moving right");
  const nodesToWrite = [
    {
      nodeId: actuators.O1, // NodeId of the variable
      attributeId: opcua.AttributeIds.Value, // Write to the Value attribute
      value: {
        value: {
          dataType: opcua.DataType.Boolean, // Data type of the variable
          value: true, // The value to write
        },
      },
    },
    {
      nodeId: actuators.O2, // NodeId of the variable
      attributeId: opcua.AttributeIds.Value, // Write to the Value attribute
      value: {
        value: {
          dataType: opcua.DataType.Boolean, // Data type of the variable
          value: false, // The value to write
        },
      },
    },
  ];
  await tryWriteNodes(session, nodesToWrite, "Move Right");
}

export async function moveLeft(session) {
  console.log("Moving left");
  const nodesToWrite = [
    {
      nodeId: actuators.O2,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O1,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  await tryWriteNodes(session, nodesToWrite, "Move Left");
}

export async function moveUp(session) {
  console.log("Moving up");
  const nodesToWrite = [
    {
      nodeId: actuators.O4,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O3,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  await tryWriteNodes(session, nodesToWrite, "Move Up");
}
export async function moveDown(session) {
  console.log("Moving down");
  const nodesToWrite = [
    {
      nodeId: actuators.O3,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O4,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  await tryWriteNodes(session, nodesToWrite, "Move Down");
}
export async function openClaw(session) {
  console.log("Opening claw");
  const nodesToWrite = [
    {
      nodeId: actuators.O5,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O6,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  await tryWriteNodes(session, nodesToWrite, "Open Claw");
}
export async function closeClaw(session) {
  console.log("Closing claw");
  const nodesToWrite = [
    {
      nodeId: actuators.O6,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O5,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  await tryWriteNodes(session, nodesToWrite, "Close Claw");
}

export async function readAllSensors(session) {
  const nodesToRead = [
    { nodeId: sensors.I2, attributeId: opcua.AttributeIds.Value },
    { nodeId: sensors.I4, attributeId: opcua.AttributeIds.Value },
    { nodeId: sensors.I6, attributeId: opcua.AttributeIds.Value },
  ];

  const dataValues = await session.read(nodesToRead);

  // Format the response
  const sensorData = dataValues.map((dataValue, index) => ({
    sensor: `I${index + 2}`,
    value: dataValue.value.value,
  }));

  return sensorData;
}

export const nodeIdToSensor = Object.fromEntries(
  Object.entries(sensors).map(([key, value]) => [value, key])
);
