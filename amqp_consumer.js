const QUEUE = process.env.QUEUE_NAME;
const ADDR = process.env.RABBIT_MQ_ADDR;

async function amqp_consumer() {
    try {
        let con = await require('amqplib').connect(ADDR);
        let ch = await con.createChannel();
        await ch.assertQueue(QUEUE, { durable: true });

        let amqpResponses = async function(cllb) {
            let { consumerTag } = await ch.consume(
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
        console.log('ERR:' + error);
    }
}

module.exports = {
    amqp_consumer
};
