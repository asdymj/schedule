# API 스펙

**프로젝트명**: 온라인 다이어리 꾸미기 (Share Diary Calendar)
**작성일**: 2026-05-24

---

## API 공통 사항

| 항목 | 내용 |
|------|------|
| Base URL | `https://{service}.vercel.app/api` (개발: `http://localhost:3000/api`) |
| 인증 방식 | Bearer Token (JWT) — `Authorization: Bearer {access_token}` |
| 응답 형식 | JSON |
| 문자 인코딩 | UTF-8 |
| 파일 업로드 | `multipart/form-data` |

## 공통 에러 코드

| HTTP 상태 코드 | 에러 코드 | 설명 |
|----------------|-----------|------|
| 400 | BAD_REQUEST | 잘못된 요청 (유효성 검사 실패) |
| 401 | UNAUTHORIZED | 인증 필요 (토큰 없음 또는 만료) |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 이미 존재하는 리소스 |
| 410 | GONE | 만료된 리소스 (초대 링크 등) |
| 415 | UNSUPPORTED_MEDIA_TYPE | 지원하지 않는 파일 형식 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

---

## API 엔드포인트 목록

| API-ID | Method | URL | 기능명 | 관련 기능 ID |
|--------|--------|-----|--------|-------------|
| API-001 | POST | /auth/signup | 이메일 회원가입 | F-001 |
| API-002 | POST | /auth/login | 이메일 로그인 | F-001 |
| API-003 | POST | /auth/social | 소셜 로그인 | F-001 |
| API-004 | POST | /auth/refresh | 토큰 갱신 | F-001 |
| API-005 | POST | /auth/logout | 로그아웃 | F-001 |
| API-006 | POST | /auth/password-reset | 비밀번호 재설정 요청 | F-001 |
| API-010 | POST | /groups | 그룹 생성 | F-002 |
| API-011 | GET | /groups | 내 그룹 목록 조회 | F-002 |
| API-012 | GET | /groups/:id | 그룹 상세 조회 | F-002 |
| API-013 | PUT | /groups/:id | 그룹 정보 수정 | F-002 |
| API-014 | POST | /groups/:id/invite | 초대 링크 생성 | F-002 |
| API-015 | POST | /groups/join/:token | 초대 수락 | F-002 |
| API-016 | DELETE | /groups/:id/members/:userId | 멤버 강퇴 | F-002 |
| API-017 | DELETE | /groups/:id/leave | 그룹 탈퇴 | F-002 |
| API-020 | GET | /groups/:id/schedules | 그룹 일정 목록 조회 | F-003 |
| API-021 | POST | /schedules | 일정 등록 | F-004 |
| API-022 | GET | /schedules/:id | 일정 상세 조회 | F-004 |
| API-023 | PUT | /schedules/:id | 일정 수정 | F-004 |
| API-024 | DELETE | /schedules/:id | 일정 삭제 | F-004 |
| API-030 | POST | /schedules/:id/contents | 콘텐츠 추가 (텍스트/URL/위치) | F-005, F-009, F-008 |
| API-031 | POST | /schedules/:id/upload/image | 사진 업로드 | F-006 |
| API-034 | POST | /schedules/:id/upload/video | 영상 업로드 | F-010 |
| API-035 | DELETE | /schedules/:id/contents/:contentId | 콘텐츠 삭제 | F-005~F-010 |
| API-040 | GET | /notifications | 알림 목록 조회 | F-011 |
| API-041 | PATCH | /notifications/:id/read | 알림 읽음 처리 | F-011 |
| API-042 | PATCH | /notifications/read-all | 전체 알림 읽음 처리 | F-011 |

---

## API 상세

### API-001. 이메일 회원가입

| 항목 | 내용 |
|------|------|
| Method | POST |
| URL | `/api/auth/signup` |
| 설명 | 이메일과 비밀번호로 신규 계정 생성 |
| 인증 | 불필요 |

**Request Body**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| email | string | Y | 이메일 (형식 검증) |
| password | string | Y | 비밀번호 (최소 8자, 영문+숫자) |
| name | string | Y | 닉네임 (최대 20자) |

**Response (201 Created)**

```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "email": "user@email.com", "name": "홍길동" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**에러 Response**

| 상태 코드 | 에러 코드 | 조건 |
|-----------|-----------|------|
| 409 | CONFLICT | 이미 가입된 이메일 |
| 400 | BAD_REQUEST | 이메일 형식 오류, 비밀번호 규칙 위반 |

---

### API-002. 이메일 로그인

| 항목 | 내용 |
|------|------|
| Method | POST |
| URL | `/api/auth/login` |
| 설명 | 이메일+비밀번호 인증 후 JWT 발급 |
| 인증 | 불필요 |

**Request Body**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| email | string | Y | 이메일 |
| password | string | Y | 비밀번호 |

**Response (200 OK)**

```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "email": "user@email.com", "name": "홍길동" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**에러 Response**

| 상태 코드 | 에러 코드 | 조건 |
|-----------|-----------|------|
| 401 | UNAUTHORIZED | 이메일 또는 비밀번호 불일치 |
| 404 | NOT_FOUND | 가입되지 않은 이메일 |

---

### API-010. 그룹 생성

| 항목 | 내용 |
|------|------|
| Method | POST |
| URL | `/api/groups` |
| 설명 | 새 그룹 생성, 생성자가 오너로 자동 지정 |
| 인증 | Bearer Token 필요 |

**Request Body**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| name | string | Y | 그룹명 (최대 30자) |
| description | string | N | 그룹 설명 (최대 100자) |
| coverImage | file | N | 커버 이미지 (multipart) |

**Response (201 Created)**

```json
{
  "status": "success",
  "data": {
    "group": {
      "id": "uuid",
      "name": "우리들의 여행",
      "description": "2026 제주 여행 그룹",
      "coverImageUrl": "https://...",
      "ownerId": "uuid",
      "createdAt": "2026-05-24T00:00:00Z"
    }
  }
}
```

---

### API-014. 초대 링크 생성

| 항목 | 내용 |
|------|------|
| Method | POST |
| URL | `/api/groups/:id/invite` |
| 설명 | 그룹 오너가 초대 링크를 생성 (72시간 만료) |
| 인증 | Bearer Token (오너만 허용) |

**Response (200 OK)**

```json
{
  "status": "success",
  "data": {
    "inviteUrl": "https://{service}.vercel.app/invite/abc123xyz",
    "token": "abc123xyz",
    "expiresAt": "2026-05-27T00:00:00Z"
  }
}
```

---

### API-020. 그룹 일정 목록 조회

| 항목 | 내용 |
|------|------|
| Method | GET |
| URL | `/api/groups/:id/schedules` |
| 설명 | 특정 기간의 그룹 일정 목록 조회 |
| 인증 | Bearer Token (그룹 멤버만) |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| year | number | Y | 조회 연도 |
| month | number | Y | 조회 월 (1~12) |
| view | string | N | monthly / weekly / daily (기본: monthly) |

**Response (200 OK)**

```json
{
  "status": "success",
  "data": {
    "schedules": [
      {
        "id": "uuid",
        "title": "제주 출발",
        "emoji": "✈️",
        "colorTag": "#FF6B9D",
        "startAt": "2026-06-01T09:00:00Z",
        "endAt": "2026-06-01T12:00:00Z",
        "createdBy": { "id": "uuid", "name": "홍길동" }
      }
    ]
  }
}
```

---

### API-021. 일정 등록

| 항목 | 내용 |
|------|------|
| Method | POST |
| URL | `/api/schedules` |
| 설명 | 그룹 캘린더에 새 일정 등록 |
| 인증 | Bearer Token (그룹 멤버) |

**Request Body**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| groupId | string | Y | 그룹 UUID |
| title | string | Y | 일정 제목 (최대 50자) |
| startAt | string | Y | 시작 일시 (ISO 8601) |
| endAt | string | N | 종료 일시 (ISO 8601) |
| emoji | string | N | 이모지 유니코드 |
| colorTag | string | N | 색상 HEX 코드 |
| isAllDay | boolean | N | 종일 여부 (기본: false) |

**Response (201 Created)**

```json
{
  "status": "success",
  "data": {
    "schedule": { "id": "uuid", "title": "제주 출발", "emoji": "✈️", ... }
  }
}
```

---

### API-031. 사진 업로드

| 항목 | 내용 |
|------|------|
| Method | POST |
| URL | `/api/schedules/:id/upload/image` |
| 설명 | 일정 상세에 사진 업로드 (최대 10장, 10MB/장) |
| 인증 | Bearer Token (일정 관련 그룹 멤버) |
| Content-Type | multipart/form-data |

**Request Body (multipart)**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| images | file[] | Y | 이미지 파일 배열 (JPEG/PNG/WEBP) |

**Response (201 Created)**

```json
{
  "status": "success",
  "data": {
    "images": [
      { "id": "uuid", "url": "https://supabase.../image1.jpg", "order": 1 }
    ]
  }
}
```

---

### API-040. 알림 목록 조회

| 항목 | 내용 |
|------|------|
| Method | GET |
| URL | `/api/notifications` |
| 설명 | 로그인 사용자의 알림 목록 조회 (최신순) |
| 인증 | Bearer Token |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | N | 페이지 번호 (기본: 1) |
| limit | number | N | 페이지당 항목 수 (기본: 20) |
| unreadOnly | boolean | N | 미읽음만 조회 (기본: false) |

**Response (200 OK)**

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "SCHEDULE_CREATED",
        "message": "홍길동님이 '제주 출발' 일정을 등록했습니다",
        "isRead": false,
        "scheduleId": "uuid",
        "groupId": "uuid",
        "createdAt": "2026-05-24T10:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": { "page": 1, "limit": 20, "total": 45 }
  }
}
```
