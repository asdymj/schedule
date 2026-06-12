import { NextResponse } from 'next/server';

// API스펙(#7) §1.4 응답 포맷 + §1.5 공통 에러 코드를 따르는 Route Handler 응답 헬퍼.
// app/api/**/route.ts는 항상 apiSuccess/apiError로 응답을 생성합니다.

export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN_GROUP_ACCESS'
  | 'FORBIDDEN_ROLE'
  | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT'
  | 'INVITE_EXPIRED'
  | 'PAYLOAD_TOO_LARGE'
  | 'BUSINESS_RULE_VIOLATION'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

const ERROR_STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_FAILED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN_GROUP_ACCESS: 403,
  FORBIDDEN_ROLE: 403,
  RESOURCE_NOT_FOUND: 404,
  CONFLICT: 409,
  INVITE_EXPIRED: 410,
  PAYLOAD_TOO_LARGE: 413,
  BUSINESS_RULE_VIOLATION: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

function buildMeta(extra?: Record<string, unknown>) {
  return {
    request_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...extra,
  };
}

export function apiSuccess<T>(data: T, status = 200, metaExtra?: Record<string, unknown>) {
  return NextResponse.json({ data, meta: buildMeta(metaExtra) }, { status });
}

export function apiError(code: ApiErrorCode, message: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    { error: { code, message, details }, meta: buildMeta() },
    { status: ERROR_STATUS[code] },
  );
}
