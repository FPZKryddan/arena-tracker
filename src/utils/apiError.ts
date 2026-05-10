import type { ApiErrorPayload, ErrorCode } from "../types";

const KNOWN_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  "BAD_PATH",
  "BAD_REGION",
  "BAD_HOST",
  "METHOD_NOT_ALLOWED",
  "NOT_FOUND",
  "PLAYER_NOT_TRACKED",
  "JOB_NOT_FOUND",
  "UPSTREAM_NOT_FOUND",
  "UPSTREAM_RATE_LIMITED",
  "UPSTREAM_ERROR",
  "INTERNAL_ERROR",
]);

const isErrorCode = (v: unknown): v is ErrorCode =>
  typeof v === "string" && KNOWN_CODES.has(v as ErrorCode);

const isEnvelope = (v: unknown): v is { error: ApiErrorPayload } => {
  if (typeof v !== "object" || v === null) return false;
  const err = (v as { error?: unknown }).error;
  if (typeof err !== "object" || err === null) return false;
  const e = err as Record<string, unknown>;
  return (
    isErrorCode(e.code) &&
    typeof e.message === "string" &&
    typeof e.status === "number"
  );
};

export class ApiError extends Error {
  readonly payload: ApiErrorPayload;
  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.payload = payload;
  }
}

const inferCodeFromText = (text: string, status?: number): ErrorCode => {
  const s = text.toLowerCase();
  if (status === 404 || s.includes("404") || s.includes("not found"))
    return "UPSTREAM_NOT_FOUND";
  if (status === 429 || s.includes("429") || s.includes("rate limit"))
    return "UPSTREAM_RATE_LIMITED";
  return "INTERNAL_ERROR";
};

/**
 * Accepts a value of unknown shape from the backend (envelope, partial object,
 * legacy plain string, or undefined) and returns a usable ApiErrorPayload.
 */
export const coerceApiErrorPayload = (
  raw: unknown,
  fallbackStatus = 500
): ApiErrorPayload => {
  if (raw && typeof raw === "object") {
    const obj = raw as {
      code?: unknown;
      message?: unknown;
      status?: unknown;
      details?: unknown;
    };
    const status = typeof obj.status === "number" ? obj.status : fallbackStatus;
    const message = typeof obj.message === "string" ? obj.message : "";
    if (isErrorCode(obj.code)) {
      return {
        code: obj.code,
        message: message || "An error occurred.",
        status,
        details:
          obj.details && typeof obj.details === "object"
            ? (obj.details as Record<string, unknown>)
            : {},
      };
    }
    if (message) {
      return {
        code: inferCodeFromText(message, status),
        message,
        status,
      };
    }
  }
  if (typeof raw === "string" && raw.length > 0) {
    return {
      code: inferCodeFromText(raw, fallbackStatus),
      message: raw,
      status: fallbackStatus,
    };
  }
  return {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
    status: fallbackStatus,
  };
};

export const parseApiError = async (res: Response): Promise<ApiErrorPayload> => {
  let body: unknown = undefined;
  try {
    body = await res.json();
  } catch {
    // body may be empty or non-JSON; fall through
  }

  let payload: ApiErrorPayload;
  if (isEnvelope(body)) {
    payload = { ...body.error, details: { ...(body.error.details ?? {}) } };
  } else {
    payload = {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      status: res.status,
      details: {},
    };
  }

  if (res.status === 429) {
    const details = (payload.details ?? {}) as Record<string, unknown>;
    if (typeof details.retryAfterSeconds !== "number") {
      const header = res.headers.get("Retry-After");
      const headerSeconds = header ? Number.parseInt(header, 10) : NaN;
      details.retryAfterSeconds = Number.isFinite(headerSeconds)
        ? headerSeconds
        : 30;
      payload = { ...payload, details };
    }
  }

  return payload;
};

export const getRetryAfterSeconds = (err: ApiErrorPayload): number => {
  const raw = (err.details as { retryAfterSeconds?: unknown } | undefined)
    ?.retryAfterSeconds;
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) return 30;
  return Math.min(600, Math.max(1, Math.round(n)));
};

export interface FormatErrorContext {
  gameName?: string;
  tagLine?: string;
  region?: string;
}

export const formatApiError = (
  err: ApiErrorPayload,
  ctx: FormatErrorContext = {}
): string => {
  const who =
    ctx.gameName && ctx.tagLine
      ? `${ctx.gameName}#${ctx.tagLine}`
      : "that player";
  const where = ctx.region ?? "this region";

  switch (err.code) {
    case "UPSTREAM_NOT_FOUND":
      return `Player ${who} doesn't exist on ${where}.`;
    case "PLAYER_NOT_TRACKED":
      return `Stats for ${who} aren't ready yet. Try refreshing.`;
    case "BAD_REGION": {
      const supported = (err.details as { supported?: unknown } | undefined)
        ?.supported;
      const list = Array.isArray(supported) ? supported.join(", ") : "";
      return list
        ? `Region "${where}" is not supported. Try one of: ${list}.`
        : `Region "${where}" is not supported.`;
    }
    case "JOB_NOT_FOUND":
      return "Refresh expired. Please try again.";
    case "UPSTREAM_RATE_LIMITED":
      return `Riot API rate limited. Try again in ${getRetryAfterSeconds(
        err
      )}s.`;
    case "UPSTREAM_ERROR":
    case "INTERNAL_ERROR":
      return "Riot API is having trouble. Try again shortly.";
    case "BAD_PATH":
    case "METHOD_NOT_ALLOWED":
    case "BAD_HOST":
    case "NOT_FOUND":
      return `Something went wrong (${err.code}).`;
    default:
      return err.message || "Something went wrong, please try again.";
  }
};
