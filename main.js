require('dotenv').config();
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const { amqpConsumer } = require('./amqpConsumer');
const { amqpPublisher } = require('./amqpPublisher');

const app = express();
app.use(express.static('client'));

let publisher;
const clients = [];
const server = http.createServer(app);
const io = socketIo(server);

async function init() {
  try {
    publisher = await amqpPublisher();
    console.log(`[*] Starting consumer...`);
    const { amqpResponses } = await amqpConsumer();
    await amqpResponses(rspAMQP => {
      const msg = JSON.parse(rspAMQP);
      clients.forEach(client => {
        const clientId = client.client.conn.id;
        if (clientId !== msg.senderId) {
          client.emit('msg_from_server', msg);
        }
      });
    });
    console.log('[✔] rabbitMQ ready');

    io.on('connection', socket => {
      const { id } = socket.client.conn;
      clients.push(socket);
      console.log(`[+] Connected to Client ID: ${id}`);

      socket.on('msg_to_server', str => {
        const obj = { ...str };
        if (!obj.senderId) {
          obj.senderId = id;
        }
        publisher(JSON.stringify(obj));
      });

      socket.on('disconnect', () => {
        console.log(`[-] Disconnected from Client ID: ${id}`);
        const i = clients.findIndex(c => c.client.conn.id === id);
        if (i !== -1) {
          clients.splice(i, 1);
        }
      });
    });
  } catch (err) {
    console.log('ERR: ', err);
  }
}

server.listen(3000, () => {
  console.log(`[*] Server is listening on port 3000`);
  init();
});
