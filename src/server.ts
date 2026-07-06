import app from "./app";
import { createMessageProducerBroker } from "./common/factories/brokerFactory";
import { MessageProducerBroker } from "./common/types/broker";
import { initDb } from "./config/db";
import logger from "./config/logger";
import config from "config";
const startServer = async () => {

    let messageProducerBroker: MessageProducerBroker | null = null;
    const PORT: number = config.get("server.port") || 5502;
    try {
         await initDb();
        logger.info("Database connected successfully");
        messageProducerBroker = createMessageProducerBroker();

        await messageProducerBroker.connect();
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
             if (messageProducerBroker) {
                await messageProducerBroker.disconnect();
            }
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
