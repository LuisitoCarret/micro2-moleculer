import pino from "pino";

const logger = pino({
  level: "info",
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label, number) {
      return { level: label };
    },
  },
  serializers: {
    err: (error) => ({ message: error.message }),
  },
});

export default logger;
