const QUEUE = process.env.QUEUE_NAME;
const ADDR = process.env.RABBIT_MQ_ADDR;

async function amqp_publisher() {
  try {
    let con = await require('amqplib').connect(ADDR);
    let ch = await con.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });

    let sendToAMQP = messgString => {
      ch.sendToQueue(QUEUE, Buffer.from(messgString));
    };

    return sendToAMQP;
  } catch (error) {
    console.log('ERR:' + error);
  }
}

module.exports = {
  amqp_publisher
};
