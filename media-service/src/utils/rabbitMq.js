import ampqlib from "amqplib"
import logger from "./logger.js"
import dotenv from "dotenv"

dotenv.config();

let channel = null
let connection = null

console.log(process.env.RABBITMQ_URL)

const EXCHANGE_NAME = 'FACEBOOK_EVENTS'

async function connectToRabbitMq() {
    try {
        connection = await ampqlib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel()
        await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:false})
        logger.info("Connected to rabbit mq");
        return channel
    } catch (error) {
        logger.error("Error connecting to rabbit mq", error);

    }
}

async function publishEvent(routingKey, message) {
if(!channel){
    await connectToRabbitMq();
}

channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)))

logger.info("Event Published at", routingKey);


}

async function consumeEvent(routingKey, callback) {
    if (!channel) {
        await connectToRabbitMq();
    }

    const q = await channel.assertQueue("", { exclusive: true });

    // ✅ Fix: bind queue to exchange with a routing key
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    // ✅ Start consuming messages
    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });

    logger.info(`Subscribed to event '${routingKey}' from exchange '${EXCHANGE_NAME}'`);
}



export  {connectToRabbitMq, publishEvent, consumeEvent}