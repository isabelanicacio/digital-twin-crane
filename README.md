# Digital Twin

This project implements a digital twin system with a web-based client and a Node.js server. The system allows real-time control and monitoring of a physical device (such as a crane or robotic arm) via OPC UA, with a 3D visualization and live streaming interface.

## Project Structure

```
digital-twin-app/
├── client/   # React web application for visualization and control
└── server/   # Node.js backend for OPC UA communication and WebSocket API
```

---

## client

The `client` folder contains a React application built with Vite. It provides:

- A 3D digital twin visualization using Unity WebGL and Three.js.
- Real-time control buttons for device movement and claw operation.
- Live video streaming integration.
- WebSocket communication with the backend for sensor updates and control commands.

### Main Features

- **Unity WebGL Integration:** Embeds a Unity 3D model for interactive visualization.
- **Live Stream:** Displays a live video feed alongside the 3D model.
- **Real-Time Controls:** Buttons to move the device and operate the claw, synchronized with the backend.
- **Sensor Feedback:** Receives and displays real-time sensor data from the server.

### Getting Started

1. Install dependencies:
   ```sh
   cd client
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Access the app at [http://localhost:5173](http://localhost:5173) (or as configured in `.env`).

---

## server

The `server` folder contains a Node.js backend that:

- Connects to an OPC UA server to control actuators and read sensors.
- Exposes a REST API and WebSocket API for the client.
- Relays control commands from the client to the OPC UA server.
- Broadcasts real-time sensor updates to all connected clients.

### Main Features

- **OPC UA Integration:** Reads and writes to PLC/OPC UA nodes for device control.
- **WebSocket API:** Real-time communication with the client for sensor updates and control.
- **REST API:** Endpoints for direct control and sensor reading.
- **Environment Configuration:** Uses `.env` for endpoint and port settings.

### Getting Started

1. Install dependencies:
   ```sh
   cd server
   npm install
   ```
2. Configure `.env` with your OPC UA endpoint and client origin.
3. Start the server:
   ```sh
   node index.js
   ```
4. The server will run on the port specified in `.env` (default: 3001).

---

## Environment Variables

Both `client` and `server` use `.env` files for configuration. See the provided `.env` files in each folder for examples.

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.

This project was developed by:
* **Eric Yugo Hioki**
* **Alex Silveira de Campos**
* **Eduardo de Senzi Zancul**

Under the supervision/cooperation of **Fábrica do Futuro da USP**.

Copyright (C) 2026 Eric Yugo Hioki, Alex Silveira de Campos, Eduardo de Senzi Zancul

This means you are free to use, study, modify, and redistribute this software, as long as any derivative works are also licensed under the GPLv3. For more details, please see the [LICENSE](LICENSE) file in this repository.

---

## Acknowledgements

- [React](https://react.dev/)
- [Unity WebGL](https://unity.com/)
- [node-opcua](https://github.com/node-opcua/node-opcua)
- [Socket.IO](https://socket.io/)
