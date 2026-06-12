<!-- Claude Instruction:
이 문서는 기능명세서(#6) + 정보구조도(#8) + 요구사항정의서(#5)를 기반으로 REST API 스펙을 정의합니다.
M1~M4 단계는 Next.js App Router Route Handlers(`src/frontend/app/api/*`)에 배치합니다.
이 문서는 #12 데이터베이스설계서의 입력 자료이며, 프론트엔드 fetch 계약의 단일 출처입니다.
-->

# API 스펙 (REST API Specification)

**프로젝트명**: 모먼토(Momento) — 온라인 다이어리 꾸미기
**작성일**: 2026-05-31
**작성자**: 사내 신규 서비스 TF PM
**버전**: v1.0
**관련 산출물**: [기능명세서 v1.0](기능명세서.md), [정보구조도 v1.0](정보구조도.md), [요구사항정의서 v1.0](요구사항정의서.md)

---

## 1. 공통 규약

### 1.1 Base URL · 환경

| 환경 | Base URL | 비고 |
|------|----------|------|
| 로컬 | `http://localhost:3000/api` | `npm run dev` |
| 스테이징 | `https://staging.momento.kr/api` | Vercel Preview |
| 프로덕션 | `https://momento.kr/api` | Vercel Production |

배치 단계: **M1~M4** — Next.js App Router Route Handlers (`src/frontend/app/api/*`). M5+ 분리 시 Express로 동일 라우트 이전.

### 1.2 인증

| 항목 | 내용 |
|------|------|
| 방식 | Bearer JWT (Supabase Auth Access Token) |
| 헤더 | `Authorization: Bearer <access_token>` |
| 만료 | Access 1시간 / Refresh 30일 |
| 갱신 | Supabase SDK `refreshSession()` 자동 처리 |
| 검증 | 모든 보호 API는 미들웨어에서 토큰 검증 + Supabase `auth.uid()` 추출 |

### 1.3 공통 헤더

| 헤더 | 필수 | 설명 |
|------|------|------|
| `Authorization: Bearer <token>` | 보호 API | JWT Access Token |
| `Content-Type: application/json` | POST/PATCH/PUT | 본문 인코딩 |
| `X-Request-ID` | 권장 | 클라이언트 발급 UUID (로그 추적용) |
| `Accept-Language` | 선택 | `ko-KR` / `en-US` (i18n) |

### 1.4 응답 포맷

성공:

```json
{
  "data": { ... },
  "meta": { "request_id": "...", "ts": "2026-05-31T12:00:00Z" }
}
```

페이지네이션:

```json
{
  "data": [ ... ],
  "meta": {
    "request_id": "...",
    "pagination": { "cursor": "...", "next_cursor": "...", "limit": 20, "has_more": true }
  }
}
```

에러:

```json
{
  "error": {
    "code": "FORBIDDEN_GROUP_ACCESS",
    "message": "해당 그룹에 접근 권한이 없습니다.",
    "details": { "group_id": "grp_..." }
  },
  "meta": { "request_id": "...", "ts": "..." }
}
```

### 1.5 공통 에러 코드

| HTTP | code | 설명 |
|------|------|------|
| 400 | `VALIDATION_FAILED` | 입력 검증 실패 (details에 필드별 메시지) |
| 401 | `UNAUTHORIZED` | 토큰 없음/만료 |
| 403 | `FORBIDDEN_GROUP_ACCESS` | RLS 위반 (그룹 외 접근) |
| 403 | `FORBIDDEN_ROLE` | 역할 부족 (admin/owner 필요) |
| 404 | `RESOURCE_NOT_FOUND` | 리소스 없음 또는 Soft Delete |
| 409 | `CONFLICT` | 중복 가입, 동시 수정 충돌 등 |
| 410 | `INVITE_EXPIRED` | 초대 링크 만료/사용 완료 |
| 413 | `PAYLOAD_TOO_LARGE` | 파일 한도 초과 |
| 422 | `BUSINESS_RULE_VIOLATION` | 비즈니스 규칙 위반 (한도, 권한 등) |
| 429 | `RATE_LIMITED` | 분당 요청 한도 초과 |
| 500 | `INTERNAL_ERROR` | 서버 오류 |
| 503 | `SERVICE_UNAVAILABLE` | Supabase/외부 API 장애 |

### 1.6 Rate Limit (IP·사용자 기준)

| 카테고리 | 한도 | 대상 |
|----------|------|------|
| 인증 시도 | 분당 10 | `/auth/*` |
| 미디어 업로드 | 분당 20 | `/media/upload` |
| 일반 API | 분당 300 | 그 외 |
| 검색 | 분당 60 | `/search` |

---

## 2. 엔드포인트 요약

| 모듈 | 엔드포인트 수 | 관련 기능 |
|------|--------------|-----------|
| 인증·계정 | 8 | F-001~F-005 |
| 그룹 | 9 | F-101~F-108 |
| 일정 | 8 | F-201~F-209 |
| 캔버스 / 데코 | 4 | F-301, F-308 |
| 미디어 | 5 | F-601~F-605 |
| 댓글·리액션 | 6 | F-401~F-405 |
| 알림 | 6 | F-501~F-506 |
| 검색·아카이브 | 5 | F-208, F-406, REQ-072, REQ-073 |
| 결제·구독 (P2) | 5 | F-705 |
| 시스템 | 3 | 헬스체크, 푸시 구독 |
| **합계** | **약 59** | |

---

## 3. 인증·계정 (F-001 ~ F-005)

### 3.1 `POST /api/auth/social/callback`

소셜 OAuth 콜백 처리. Supabase Auth가 직접 처리하므로 본 API는 PKCE 콜백 핸들러 역할.

**Request**

```json
{ "provider": "kakao", "code": "...", "state": "..." }
```

**Response 200**

```json
{
  "data": {
    "user": { "id": "usr_...", "nickname": "지우", "is_new": true },
    "session": { "access_token": "...", "refresh_token": "...", "expires_at": "..." }
  }
}
```

**에러**: 400 `VALIDATION_FAILED`, 401 `UNAUTHORIZED`

### 3.2 `POST /api/auth/refresh`

Refresh Token으로 Access Token 갱신.

**Request**: `{ "refresh_token": "..." }`
**Response 200**: `{ "data": { "access_token": "...", "expires_at": "..." } }`
**에러**: 401 `UNAUTHORIZED`

### 3.3 `POST /api/auth/logout`

현재 세션 종료. 디바이스 ID 지정 시 해당 세션만 종료.

**Request**: `{ "device_id": "dev_..." }` (옵션)
**Response 204**

### 3.4 `GET /api/me`

본인 프로필 조회.

**Response 200**

```json
{
  "data": {
    "id": "usr_...",
    "nickname": "지우",
    "avatar_url": "https://cdn.../avatar.webp",
    "bio": "오늘의 일정을 내일의 추억으로",
    "email": "asdymj@gmail.com",
    "subscription": { "plan": "free", "expires_at": null },
    "created_at": "2026-05-01T..."
  }
}
```

### 3.5 `PATCH /api/me`

본인 프로필 수정 (F-004, REQ-002).

**Request**

```json
{ "nickname": "지우야", "bio": "..." }
```

(프로필 사진은 `POST /api/media/upload`로 업로드 후 `avatar_media_id` 별도 전달)

**Response 200**: 갱신된 프로필
**에러**: 400 `VALIDATION_FAILED` (닉네임 2~20자 위반 등)

### 3.6 `GET /api/me/devices`

다중 디바이스 세션 목록 (F-002, REQ-004).

**Response 200**

```json
{
  "data": [
    { "id": "dev_1", "label": "iPhone 15 Pro · Safari", "last_active_at": "...", "is_current": true },
    { "id": "dev_2", "label": "Windows · Chrome", "last_active_at": "..." }
  ]
}
```

### 3.7 `DELETE /api/me/devices/{device_id}`

원격 로그아웃. 본인 디바이스만 가능.

**Response 204**

### 3.8 `DELETE /api/me`

회원 탈퇴 (F-005, REQ-003). OAuth 재인증 토큰 필수.

**Request**: `{ "reauth_token": "...", "reason": "..." }`
**Response 202** (24시간 내 영구 삭제 예약)
**에러**: 422 `BUSINESS_RULE_VIOLATION` (단독 owner 그룹 존재 시 — `details.groups`에 해당 그룹 ID 배열)

---

## 4. 그룹 (F-101 ~ F-108)

### 4.1 `GET /api/groups`

본인 소속 그룹 목록 (F-104 그룹 스위처, REQ-016).

**Query**: `?include=recent_activity` (옵션)

**Response 200**

```json
{
  "data": [
    {
      "id": "grp_...",
      "name": "절친 4인방",
      "color": "#FF8FA3",
      "icon": "💖",
      "type": "friends",
      "member_count": 4,
      "my_role": "owner",
      "last_activity_at": "2026-05-30T..."
    }
  ]
}
```

### 4.2 `POST /api/groups`

그룹 생성 (F-101, REQ-010).

**Request**

```json
{ "name": "절친 4인방", "color": "#FF8FA3", "icon": "💖", "type": "friends" }
```

**Response 201**: 생성된 그룹 (위 스키마)
**에러**: 422 `BUSINESS_RULE_VIOLATION` (Free 5개 한도 초과)

### 4.3 `GET /api/groups/{gid}`

그룹 상세 (멤버 목록 포함).

**Response 200**: 그룹 메타 + `members[]`
**에러**: 403 `FORBIDDEN_GROUP_ACCESS`

### 4.4 `PATCH /api/groups/{gid}`

그룹명/색상/아이콘 수정 (owner 전용).

**Request**: 부분 업데이트
**Response 200**

### 4.5 `DELETE /api/groups/{gid}`

그룹 해체 (F-108, P1). 30일 Soft Delete.

**Request**: `{ "confirm": "해체합니다", "reauth_token": "..." }`
**Response 202**

### 4.6 `POST /api/groups/{gid}/invites`

초대 링크 + 6자리 코드 발급 (F-102, REQ-011, NFR-023).

**Request**: `{}` (기본: 1회 사용 + 24시간 만료)
**Response 201**

```json
{
  "data": {
    "token": "aBc...",
    "code": "A1B2C3",
    "invite_url": "https://momento.kr/invite/aBc...",
    "expires_at": "2026-06-01T12:00:00Z",
    "max_uses": 1,
    "uses": 0
  }
}
```

**권한**: owner / admin

### 4.7 `POST /api/groups/join`

초대 토큰 또는 코드로 가입 (F-103, REQ-012).

**Request**: `{ "token": "..." }` 또는 `{ "code": "A1B2C3" }`
**Response 200**: 가입한 그룹 정보
**에러**:
- 410 `INVITE_EXPIRED`
- 409 `CONFLICT` — 이미 가입
- 422 `BUSINESS_RULE_VIOLATION` — Free 5인 한도 (Pro 안내)

### 4.8 `PATCH /api/groups/{gid}/members/{uid}`

권한 변경 또는 owner 이양 (F-105, REQ-014).

**Request**: `{ "role": "admin" }` 또는 `{ "transfer_owner": true }`
**Response 200**
**권한**: owner (이양은 owner만)

### 4.9 `DELETE /api/groups/{gid}/members/{uid}`

본인 탈퇴 (F-107) 또는 강퇴 (F-106).

**Request**: `{ "reason": "..." }` (강퇴 시 옵션)
**Response 204**
**권한**:
- 본인: 누구나 가능 (owner 단독 시 422)
- 강퇴: owner는 admin/member 강퇴 가능, admin은 member만

---

## 5. 일정 (F-201 ~ F-209)

### 5.1 `GET /api/groups/{gid}/events`

캘린더 조회 (F-205~F-207, REQ-020~025).

**Query**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `range_start` | ISO8601 | 필수 |
| `range_end` | ISO8601 | 필수 |
| `member_ids` | csv | 멤버 필터 (REQ-024) |
| `view` | enum | `month|week|day|list` (서버는 동일 응답, 클라이언트가 해석) |

**Response 200**

```json
{
  "data": [
    {
      "id": "evt_...",
      "group_id": "grp_...",
      "author_id": "usr_...",
      "title": "성수동 카페 투어",
      "start_at": "2026-06-01T14:00:00+09:00",
      "end_at": "2026-06-01T17:00:00+09:00",
      "is_all_day": false,
      "is_private": false,
      "color": null,
      "recurrence_rule": null,
      "decoration_summary": { "has_canvas": true, "media_count": 3, "map_pin_count": 1 },
      "reaction_summary": { "total": 5, "top": ["♥", "👏"] },
      "comment_count": 2
    }
  ]
}
```

### 5.2 `POST /api/groups/{gid}/events`

일정 생성 (F-201, REQ-020). 생성 즉시 Supabase Realtime BROADCAST.

**Request**

```json
{
  "title": "성수동 카페 투어",
  "start_at": "2026-06-01T14:00:00+09:00",
  "end_at": "2026-06-01T17:00:00+09:00",
  "is_all_day": false,
  "is_private": false,
  "location": { "name": "어니언 성수", "lat": 37.544, "lng": 127.057 },
  "memo": "도착하면 메뉴 사진 찍기",
  "recurrence_rule": null,
  "reminders": ["-30m"]
}
```

**Response 201**: 생성된 일정
**에러**: 400 (`end_at` ≤ `start_at`), 403 `FORBIDDEN_GROUP_ACCESS`

### 5.3 `GET /api/events/{eid}`

일정 상세 (F-202).

**Query**: `?include=decorations,media,comments,reactions` (기본 전부 포함, N+1 방지)

**Response 200**: 전체 객체 (decorations·media·comments·reactions 포함)

### 5.4 `PATCH /api/events/{eid}`

일정 수정 (F-203, REQ-022). 변경 이력은 `event_history`에 자동 적재.

**Request**: 부분 업데이트
**Response 200**

### 5.5 `DELETE /api/events/{eid}`

Soft Delete (F-204). 7일 휴지통.

**Response 204**
**권한**: 작성자 / owner / admin

### 5.6 `POST /api/events/{eid}/restore`

휴지통 복구.

**Response 200**

### 5.7 `GET /api/groups/{gid}/events/upcoming`

리스트 뷰 / D-day 핀용 (F-206, REQ-026).

**Query**: `?limit=10&include_dday=true`
**Response 200**: 정렬된 일정 배열

### 5.8 `GET /api/groups/{gid}/events/recurring`

반복 일정 인스턴스 전개 (F-209, REQ-023, P1).

**Query**: `?event_id=evt_...&range_start=...&range_end=...`
**Response 200**: 전개된 인스턴스 배열

---

## 6. 캔버스 / 데코 (F-301, F-308)

### 6.1 `GET /api/events/{eid}/decorations`

캔버스 상태 로드 (F-301).

**Response 200**

```json
{
  "data": {
    "canvas_state": { "version": 1, "nodes": [ ... ] },
    "updated_at": "...",
    "updated_by": "usr_..."
  }
}
```

### 6.2 `PUT /api/events/{eid}/decorations`

캔버스 자동 저장 (F-308, REQ-037). 30초 debounce 후 호출. Optimistic Concurrency Control.

**Request**

```json
{
  "canvas_state": { "version": 1, "nodes": [ ... ] },
  "base_version": 42
}
```

**Response 200**: `{ "data": { "version": 43, "updated_at": "..." } }`
**에러**: 409 `CONFLICT` (`base_version` 미스매치, Last-Write-Wins 처리하려면 클라이언트가 재요청)

### 6.3 `POST /api/decorations/og-preview`

OG 메타데이터 파싱 (F-307, REQ-034).

**Request**: `{ "url": "https://..." }`
**Response 200**

```json
{ "data": { "title": "...", "description": "...", "image_url": "...", "site_name": "..." } }
```

**에러**: 422 `BUSINESS_RULE_VIOLATION` (3초 타임아웃 → 폴백)

### 6.4 `POST /api/decorations/oembed`

YouTube / Vimeo oEmbed 파싱 (F-304, REQ-033).

**Request**: `{ "url": "..." }`
**Response 200**: `{ "data": { "provider": "youtube", "video_id": "...", "title": "...", "thumbnail_url": "...", "duration": 240 } }`

---

## 7. 미디어 (F-601 ~ F-605)

### 7.1 `POST /api/media/upload-url`

서명 업로드 URL 발급 (직접 Supabase Storage에 업로드, Lambda 60초 우회).

**Request**

```json
{ "group_id": "grp_...", "file_name": "IMG_1234.jpg", "mime_type": "image/jpeg", "size": 5242880 }
```

**Response 200**

```json
{
  "data": {
    "upload_url": "https://supabase.../storage/v1/object/upload/...",
    "media_id": "med_...",
    "expires_at": "..."
  }
}
```

**에러**: 413 `PAYLOAD_TOO_LARGE` (10MB 초과), 422 (스토리지 한도 초과 — `details.plan`, `details.usage`)

### 7.2 `POST /api/media/{mid}/finalize`

업로드 완료 통보. 서버가 리사이즈/WebP 변환 트리거 (F-602).

**Request**: `{ "event_id": "evt_..." }` (옵션)
**Response 200**: media 객체 + 3종 URL (original/preview/thumbnail)

### 7.3 `GET /api/media/{mid}`

서명 다운로드 URL 발급 (만료 1시간, RLS 검증 — NFR-024).

**Response 200**: `{ "data": { "url": "...", "expires_at": "..." } }`

### 7.4 `DELETE /api/media/{mid}`

미디어 Soft Delete (F-603).

**Response 204**

### 7.5 `POST /api/media/{mid}/exif`

EXIF GPS 추출 (F-605, P1). 클라이언트에서 exifr로 추출하고 좌표만 전송하여 지도 핀 제안.

**Request**: `{ "lat": 37.544, "lng": 127.057, "taken_at": "..." }`
**Response 200**: 가까운 장소 후보 (Kakao Local API reverse geocoding)

---

## 8. 댓글·리액션 (F-401 ~ F-405)

### 8.1 `GET /api/events/{eid}/comments`

댓글 목록 (시간순, 페이지네이션).

**Query**: `?cursor=...&limit=20`
**Response 200**: `data[]` + `meta.pagination`

### 8.2 `POST /api/events/{eid}/comments`

댓글 작성 (F-402, REQ-040).

**Request**

```json
{ "content": "꼭 가자!", "media_id": "med_...", "mentions": ["usr_..."] }
```

**Response 201**: 생성된 댓글

### 8.3 `PATCH /api/comments/{cid}`

수정 (F-403). 5분 이후 수정 시 `is_edited=true`.

**Request**: `{ "content": "..." }`
**Response 200**
**권한**: 작성자 본인

### 8.4 `DELETE /api/comments/{cid}`

Soft Delete.

**Response 204**

### 8.5 `PUT /api/events/{eid}/reactions`

이모지 리액션 UPSERT (F-401, REQ-041). 6종 (`like|heart|congrats|laugh|touched|wow`).

**Request**: `{ "type": "heart" }` (`type: null` 전송 시 본인 리액션 취소)
**Response 200**: 갱신된 `reaction_summary`

### 8.6 `GET /api/groups/{gid}/timeline`

활동 피드 (F-405, P1).

**Query**: `?cursor=...&limit=20&since=YYYY-MM-DD`
**Response 200**: 일정/댓글/리액션 UNION 시간순 피드 카드

---

## 9. 알림 (F-501 ~ F-506)

### 9.1 `POST /api/notifications/push-subscriptions`

웹 푸시 구독 등록 (F-501). PWA Service Worker에서 호출.

**Request**: `{ "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } }`
**Response 201**

### 9.2 `DELETE /api/notifications/push-subscriptions/{sub_id}`

구독 해제.

**Response 204**

### 9.3 `GET /api/notifications`

알림 센터 (F-504, REQ-054). 최근 30일.

**Query**: `?cursor=...&limit=20&unread_only=false`
**Response 200**: `data[]`, 각 항목에 `type`, `payload`, `is_read`, `deep_link`

### 9.4 `POST /api/notifications/read`

읽음 처리.

**Request**: `{ "ids": ["ntf_...", "ntf_..."] }` 또는 `{ "all": true }`
**Response 200**: `{ "data": { "read_count": 5 } }`

### 9.5 `GET /api/me/notification-settings`

알림 설정 조회 (F-505, REQ-005, REQ-052).

**Response 200**

```json
{
  "data": {
    "global": { "push": true, "email": true },
    "by_group": [
      { "group_id": "grp_...", "frequency": "instant|daily|weekly|off", "push": true, "email": false }
    ],
    "quiet_hours": { "enabled": true, "start": "23:00", "end": "08:00" }
  }
}
```

### 9.6 `PUT /api/me/notification-settings`

설정 갱신 (REQ-052).

**Request**: 위 스키마 전체 또는 부분
**Response 200**

---

## 10. 검색·아카이브 (F-208, F-406, REQ-072, REQ-073)

### 10.1 `GET /api/groups/{gid}/search`

일정 검색 (F-208, REQ-071, NFR-005).

**Query**: `?q=성수동&author_id=...&from=...&to=...&cursor=...&limit=20`
**Response 200**: 결과 + 키워드 하이라이팅 `<mark>` 처리된 `title_html`, `memo_html`

### 10.2 `GET /api/groups/{gid}/map-pins`

추억 지도 (REQ-072).

**Query**: `?bbox=lat1,lng1,lat2,lng2` (지도 뷰포트)
**Response 200**: 지도 핀 배열 + 각 핀의 일정 ID

### 10.3 `GET /api/groups/{gid}/memories`

이달의 추억 / 1년 전 오늘 큐레이션 (F-406, REQ-070).

**Query**: `?d=2026-05-31&types=year_ago,month_recap`
**Response 200**: 큐레이션 카드 배열

### 10.4 `GET /api/groups/{gid}/gallery`

그룹 갤러리 (F-606, P1).

**Query**: `?cursor=...&limit=30&from=...&to=...`
**Response 200**: 미디어 배열

### 10.5 `POST /api/groups/{gid}/export`

데이터 내보내기 (REQ-073, NFR-072, P2). 백그라운드 작업 (n8n 워크플로우 트리거), 완료 시 이메일로 다운로드 링크.

**Request**: `{ "format": "zip|pdf", "range_start": "...", "range_end": "..." }`
**Response 202**: `{ "data": { "job_id": "job_...", "status_url": "/api/jobs/job_..." } }`
**권한**: owner

---

## 11. 결제·구독 (F-705, P2)

### 11.1 `GET /api/me/subscription`

현재 구독 상태.

**Response 200**

```json
{
  "data": {
    "plan": "free|pro|family",
    "status": "active|canceled|past_due",
    "current_period_end": "...",
    "auto_renew": true
  }
}
```

### 11.2 `POST /api/payments/checkout`

결제 세션 생성 (토스페이먼츠, KRW 정수).

**Request**: `{ "plan": "pro_monthly", "amount": 4900 }`
**Response 200**: `{ "data": { "order_id": "ord_...", "payment_key_hint": "...", "client_key": "..." } }`

### 11.3 `POST /api/payments/confirm`

결제 확인 (멱등성 보장 — 이미 paid면 200 + `idempotent=true`).

**Request**: `{ "payment_key": "...", "order_id": "...", "amount": 4900 }`
**Response 200**
**에러**: 422 `BUSINESS_RULE_VIOLATION` (금액 불일치 등)

### 11.4 `POST /api/payments/webhook`

토스 웹훅. 서버 단독, 토스 시그니처 검증 필수.

**Response 200** (반드시 빠르게 200)

### 11.5 `POST /api/me/subscription/cancel`

해지 (REQ-084). 다음 결제 주기 종료 시 비활성.

**Request**: `{ "reason": "..." }`
**Response 200**

---

## 12. 시스템

### 12.1 `GET /api/health`

헬스체크. DB·Storage·외부 API 연결 상태.

**Response 200**: `{ "data": { "db": "ok", "storage": "ok", "kakao_map": "ok" } }`

### 12.2 `GET /api/config/public`

공개 설정 (지도 API 키 등, 클라이언트 부트스트랩).

**Response 200**: `{ "data": { "kakao_map_app_key": "...", "google_maps_api_key": "...", "vapid_public_key": "..." } }`

### 12.3 `POST /api/diagnostics/error`

클라이언트 에러 리포트 (Sentry 미연결 시 fallback).

**Request**: `{ "level": "error", "message": "...", "stack": "...", "url": "..." }`
**Response 204**

---

## 13. Realtime 채널 (Supabase)

REST와 별개로 Supabase Realtime 채널을 통해 1초 이내 동기화 (REQ-021, NFR-002).

| 채널 | 이벤트 | 페이로드 |
|------|--------|---------|
| `group:{gid}:events` | INSERT/UPDATE/DELETE | event row |
| `group:{gid}:decorations:{eid}` | UPDATE | canvas_state diff |
| `group:{gid}:comments:{eid}` | INSERT/UPDATE/DELETE | comment row |
| `group:{gid}:reactions:{eid}` | UPSERT | reaction_summary |
| `user:{uid}:notifications` | INSERT | notification row |

구독 권한은 Supabase RLS와 동일 정책 (그룹 멤버만).

---

## 14. 화면 ↔ API 매핑 (정보구조도 §3 정합)

| 화면 ID | 주 호출 API |
|---------|-------------|
| S-COMMON-LOGIN | `POST /auth/social/callback` |
| S-COMMON-HOME | `GET /groups`, `GET /notifications?unread_only=true&limit=5` |
| S-COMMON-MYPAGE / PROFILE | `GET /me`, `PATCH /me`, `GET /me/devices` |
| S-GROUP-NEW | `POST /groups` |
| S-GROUP-DETAIL → S-CAL-MONTH | `GET /groups/{gid}`, `GET /groups/{gid}/events?range_start=...&range_end=...` |
| S-GROUP-MEMBERS | `GET /groups/{gid}` (members 포함), `PATCH/DELETE /groups/{gid}/members/{uid}` |
| S-GROUP-INVITE | `POST /groups/{gid}/invites` |
| S-GROUP-ACCEPT | `POST /groups/join` |
| S-CAL-* | `GET /groups/{gid}/events`, `GET .../events/upcoming` |
| S-EVENT-NEW | `POST /groups/{gid}/events` |
| S-EVENT-DETAIL | `GET /events/{eid}`, `PUT /events/{eid}/reactions`, `POST /events/{eid}/comments` |
| S-EVENT-EDIT | `PATCH /events/{eid}` |
| S-EVENT-EDITOR | `GET/PUT /events/{eid}/decorations`, `POST /media/upload-url`, `POST /decorations/oembed`, `POST /decorations/og-preview` |
| S-ARCHIVE-TIMELINE | `GET /groups/{gid}/timeline` |
| S-ARCHIVE-MAP | `GET /groups/{gid}/map-pins` |
| S-ARCHIVE-MEMORY | `GET /groups/{gid}/memories` |
| S-ARCHIVE-GALLERY | `GET /groups/{gid}/gallery` |
| S-ARCHIVE-SEARCH | `GET /groups/{gid}/search` |
| S-NOTIFY-CENTER | `GET /notifications`, `POST /notifications/read` |
| S-NOTIFY-SETTINGS | `GET/PUT /me/notification-settings` |
| S-EXT-SUBSCRIBE/CHECKOUT | `GET /me/subscription`, `POST /payments/checkout`, `POST /payments/confirm` |

---

## 15. 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-31 | 초안. 11개 모듈 59개 엔드포인트 + Realtime 5개 채널 + 화면 매핑 |
