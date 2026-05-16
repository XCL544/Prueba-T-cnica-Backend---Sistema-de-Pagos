import fs from 'fs';
import path from 'path';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const colors = {
  DEBUG: '\x1b[34m', // Blue
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m',
};

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app-${date}.log`);
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    console.log(`${colors[level]}${formattedMessage}${colors.RESET}`);
    
    // File output
    fs.appendFileSync(this.getLogFilePath(), formattedMessage + '\n');
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: any) {
    if (meta instanceof Error) {
      this.log(LogLevel.ERROR, message, { message: meta.message, stack: meta.stack });
    } else {
      this.log(LogLevel.ERROR, message, meta);
    }
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();
