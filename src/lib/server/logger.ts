// ── VoxGuard Server Structured Logging Utility ───────────────────────────

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  requestId?: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class ServerLogger {
  private formatLog(payload: LogPayload): string {
    return JSON.stringify(payload);
  }

  info(message: string, data?: Record<string, unknown>, requestId?: string): void {
    const payload: LogPayload = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...(data ? { data } : {}),
    };
    console.log(`[VoxGuard-INFO] ${this.formatLog(payload)}`);
  }

  warn(message: string, data?: Record<string, unknown>, requestId?: string): void {
    const payload: LogPayload = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...(data ? { data } : {}),
    };
    console.warn(`[VoxGuard-WARN] ${this.formatLog(payload)}`);
  }

  error(
    message: string,
    err?: unknown,
    data?: Record<string, unknown>,
    requestId?: string
  ): void {
    let errorInfo: LogPayload["error"];
    if (err instanceof Error) {
      errorInfo = {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    } else if (typeof err === "string") {
      errorInfo = { message: err };
    }

    const payload: LogPayload = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...(data ? { data } : {}),
      ...(errorInfo ? { error: errorInfo } : {}),
    };
    console.error(`[VoxGuard-ERROR] ${this.formatLog(payload)}`);
  }

  debug(message: string, data?: Record<string, unknown>, requestId?: string): void {
    if (process.env.NODE_ENV === "development") {
      const payload: LogPayload = {
        level: "debug",
        message,
        timestamp: new Date().toISOString(),
        ...(requestId ? { requestId } : {}),
        ...(data ? { data } : {}),
      };
      console.debug(`[VoxGuard-DEBUG] ${this.formatLog(payload)}`);
    }
  }
}

export const logger = new ServerLogger();
