#!/usr/bin/env node

/**
 * Lightweight in-memory WebSocket relay for stage state.
 * Keeps the most recent snapshot and broadcasts updates to all peers
 * connected to the Expo dev server on the same LAN.
 */

const WebSocket = require('ws');

const PORT = process.env.STAGE_SYNC_PORT
  ? Number(process.env.STAGE_SYNC_PORT)
  : 4001;

const wss = new WebSocket.Server({ port: PORT });

let latestState = null;
let version = 0;

const broadcast = (data, excludeSocket = null) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeSocket) {
      client.send(data);
    }
  });
};

const makePacket = (payload, originId = 'server') =>
  JSON.stringify({
    type: 'stage:state',
    payload,
    version,
    originId,
  });

wss.on('connection', (socket) => {
  console.log('[stage-sync] client connected');

  if (latestState) {
    socket.send(makePacket(latestState));
  }

  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === 'stage:update' && message.payload) {
        latestState = message.payload;
        version += 1;
        const packet = makePacket(latestState, message.originId);
        // Broadcast to everyone else
        broadcast(packet, socket);
        // Acknowledge sender with the authoritative version
        socket.send(packet);
      } else if (message.type === 'stage:request-state' && latestState) {
        socket.send(makePacket(latestState));
      }
    } catch (error) {
      console.error('[stage-sync] failed to parse message', error);
    }
  });

  socket.on('close', () => {
    console.log('[stage-sync] client disconnected');
  });
});

wss.on('listening', () => {
  console.log(
    `[stage-sync] listening on ws://<dev-machine-ip>:${PORT} (set STAGE_SYNC_PORT to override)`
  );
});
