import { createLogger, transports, format } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/app.log" })
  ],
});


if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple()
    })
  );
}

export default logger;

