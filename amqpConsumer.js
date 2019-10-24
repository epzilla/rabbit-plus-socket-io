const QUEUE = process.env.QUEUE_NAME;
const ADDR = process.env.RABBIT_MQ_ADDR;
const amqplib = require('amqplib');

async function amqpConsumer() {
  let amqpResponses;
  try {
    const con = await amqplib.connect(ADDR);
    const ch = await con.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });

    amqpResponses = async cllb => {
      const { consumerTag } = await ch.consume(
        QUEUE,
        msg => {
          cllb(msg.content.toString());
        },
        { noAck: true }
      );
      return { consumerTag, channel: ch };
    };

    return { amqpResponses };
  } catch (error) {
    console.log('ERR:', error);
    return { amqpResponses };
  }
}

module.exports = {
  amqpConsumer
};
