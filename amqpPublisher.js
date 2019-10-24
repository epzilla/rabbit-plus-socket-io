const QUEUE = process.env.QUEUE_NAME;
const ADDR = process.env.RABBIT_MQ_ADDR;
const amqplib = require('amqplib');

async function amqpPublisher() {
  let sendToAMQP;
  try {
    const con = await amqplib.connect(ADDR);
    const ch = await con.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });

    sendToAMQP = messgString => {
      ch.sendToQueue(QUEUE, Buffer.from(messgString));
    };
    return sendToAMQP;
  } catch (error) {
    console.log('ERR:', error);
    return sendToAMQP;
  }
}

module.exports = {
  amqpPublisher
};
