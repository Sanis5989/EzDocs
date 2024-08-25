const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('okay');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', setupWSConnection);

const port = process.env.PORT || 1234;
server.listen(port, () => {
  console.log(`Signaling server running on port ${port}`);
});