require('dotenv').config();
const amqp_consumer = require('./amqp_consumer').amqp_consumer;
const amqp_publisher = require('./amqp_publisher').amqp_publisher;
const http = require('http');
const express = require('express');

const app = express();
app.use(express.static('client'));

let publisher;
let clients = [];
let consumerTag;
let consumerChannel;

async function consumeMsgs() {
    console.log(`[✔] Starting consumer...`);
    let { amqpResponses } = await amqp_consumer();
    let info = await amqpResponses(rspAMQP => {
        let msg = JSON.parse(rspAMQP);
        clients.forEach(client => {
            let clientId = client.client.conn.id;
            if (clientId !== msg.senderId) {
                client.emit('msg_from_server', msg);
            }
        });
    });
    consumerTag = info.consumerTag;
    consumerChannel = info.channel;
}

async function WSConnect() {
    try {
        publisher = await amqp_publisher();
        console.log('[*] rabbitMQ ready');

        io.on('connection', function(socket) {
            let id = socket.client.conn.id;
            clients.push(socket);
            console.log(`[+] Connected to Client ID: ${id}`);
            if (clients.length === 2) {
                consumeMsgs();
            }

            socket.on('msg_to_server', str => {
                if (!str.senderId) {
                    str.senderId = id;
                }
                publisher(JSON.stringify(str));
            });

            socket.on('disconnect', arg => {
                console.log(`[-] Disconnected from Client ID: ${id}`);
                let i = clients.findIndex(c => c.client.conn.id === id);
                if (i !== -1) {
                    clients.splice(i, 1);
                    if (clients.length === 1) {
                        console.log(`[×] No clients left to consume messages. Stopping consumer...`);
                        consumerChannel.cancel(consumerTag);
                    }
                }
            });
        });
    } catch (err) {
        console.log('ERR: ', err);
    }
}

let server = http.createServer(app);
let io = require('socket.io')(server);

server.listen(3000, () => {
    console.log(`[*] Server is listening on port 3000`);
    WSConnect();
});
