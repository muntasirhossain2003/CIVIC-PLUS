import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level}] ${message} ${extra}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});
