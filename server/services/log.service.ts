import path from "node:path";

import { inject, injectable } from "tsyringe-neo";
import winston from "winston";

import { ConfigService } from "./config.service.ts";

@injectable()
export class LogService {
    readonly #configService;
    readonly #logger;

    constructor(@inject(ConfigService) configService: ConfigService) {
        this.#configService = configService;
        const logDir =
            this.#configService.config.NODE_ENV === "development"
                ? path.join(import.meta.dirname, "..", "..", "..", "..", "log")
                : "log";
        this.#logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            level: "info",
            transports: [
                new winston.transports.File({
                    filename: path.join(logDir, "error.log"),
                    level: "error",
                }),
                new winston.transports.File({
                    filename: path.join(logDir, "info.log"),
                }),
                new winston.transports.Console(),
            ],
        });
    }

    get logger() {
        return this.#logger;
    }
}
