import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const apiLogger = logger.child({ module: "api" });
export const authLogger = logger.child({ module: "auth" });
export const atlasLogger = logger.child({ module: "atlas" });
export const aiLogger = logger.child({ module: "ai" });
export const emailLogger = logger.child({ module: "email" });
export const partnerLogger = logger.child({ module: "partner" });

export default logger;
