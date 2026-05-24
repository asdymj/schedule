# NotebookLM 소스 URL 목록

**대상 저장소**: https://github.com/asdymj/schedule
**기준 브랜치**: main
**총 소스 수**: 17 (W1~W3 산출물 16 + PRD)

---

## 사용 방법

### 옵션 A — raw URL (권장: plain text 그대로 인덱싱)

1. NotebookLM (https://notebooklm.google.com) 접속 → "Share Diary Calendar" 노트북 생성
2. 좌측 "소스 추가" 클릭 → "웹사이트(Website)" 선택
3. 아래 raw URL을 **한 번에 한 개씩** 복사 → 붙여넣기 → "삽입"

```
https://raw.githubusercontent.com/asdymj/schedule/main/schedulePRD.md
https://raw.githubusercontent.com/asdymj/schedule/main/01.%EA%B4%80%EB%A6%AC%EB%AC%B8%EC%84%9C/%EC%B0%A9%EC%88%98%EB%B3%B4%EA%B3%A0%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/01.%EA%B4%80%EB%A6%AC%EB%AC%B8%EC%84%9C/WBS.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EB%A7%88%EC%BC%93%EB%A6%AC%EC%84%9C%EC%B9%98.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EC%84%9C%EB%B9%84%EC%8A%A4%EA%B8%B0%ED%9A%8D%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EC%A0%95%EC%9D%98%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EA%B8%B0%EB%8A%A5%EB%AA%85%EC%84%B8%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/API%EC%8A%A4%ED%8E%99.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EC%A0%95%EB%B3%B4%EA%B5%AC%EC%A1%B0%EB%8F%84.md
https://raw.githubusercontent.com/asdymj/schedule/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%ED%99%94%EB%A9%B4%EC%84%A4%EA%B3%84%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EC%9D%B8%ED%94%84%EB%9D%BC%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98.md
https://raw.githubusercontent.com/asdymj/schedule/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%A0%95%EC%9D%98%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%84%A4%EA%B3%84%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EB%94%94%EC%9E%90%EC%9D%B8%EC%8A%A4%ED%83%80%EC%9D%BC%EA%B0%80%EC%9D%B4%EB%93%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/01.%EA%B4%80%EB%A6%AC%EB%AC%B8%EC%84%9C/%EC%A4%91%EA%B0%84%EB%B3%B4%EA%B3%A0%EC%84%9C.md
https://raw.githubusercontent.com/asdymj/schedule/main/04.%EA%B2%80%EC%88%98%EB%AC%B8%EC%84%9C/%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%8B%9C%EB%82%98%EB%A6%AC%EC%98%A4.md
https://raw.githubusercontent.com/asdymj/schedule/main/CLAUDE.md
```

> raw.githubusercontent.com URL은 NotebookLM이 가져올 때 plain text로 인식 → 코드 블록·표·Mermaid 다이어그램이 깔끔하게 보존됨

---

### 옵션 B — blob URL (백업: raw가 잘 안 가져와지는 경우)

```
https://github.com/asdymj/schedule/blob/main/schedulePRD.md
https://github.com/asdymj/schedule/blob/main/01.%EA%B4%80%EB%A6%AC%EB%AC%B8%EC%84%9C/%EC%B0%A9%EC%88%98%EB%B3%B4%EA%B3%A0%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/01.%EA%B4%80%EB%A6%AC%EB%AC%B8%EC%84%9C/WBS.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EB%A7%88%EC%BC%93%EB%A6%AC%EC%84%9C%EC%B9%98.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EC%84%9C%EB%B9%84%EC%8A%A4%EA%B8%B0%ED%9A%8D%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EC%A0%95%EC%9D%98%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EA%B8%B0%EB%8A%A5%EB%AA%85%EC%84%B8%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/API%EC%8A%A4%ED%8E%99.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%EC%A0%95%EB%B3%B4%EA%B5%AC%EC%A1%B0%EB%8F%84.md
https://github.com/asdymj/schedule/blob/main/02.%EA%B8%B0%ED%9A%8D%EB%AC%B8%EC%84%9C/%ED%99%94%EB%A9%B4%EC%84%A4%EA%B3%84%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EC%9D%B8%ED%94%84%EB%9D%BC%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98.md
https://github.com/asdymj/schedule/blob/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%A0%95%EC%9D%98%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%84%A4%EA%B3%84%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/03.%EA%B5%AC%ED%98%84%EB%AC%B8%EC%84%9C/%EB%94%94%EC%9E%90%EC%9D%B8%EC%8A%A4%ED%83%80%EC%9D%BC%EA%B0%80%EC%9D%B4%EB%93%9C.md
https://github.com/asdymj/schedule/blob/main/01.%EA%B4%80%EB%A6%AC%EB%AC%B8%EC%84%9C/%EC%A4%91%EA%B0%84%EB%B3%B4%EA%B3%A0%EC%84%9C.md
https://github.com/asdymj/schedule/blob/main/04.%EA%B2%80%EC%88%98%EB%AC%B8%EC%84%9C/%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%8B%9C%EB%82%98%EB%A6%AC%EC%98%A4.md
https://github.com/asdymj/schedule/blob/main/CLAUDE.md
```

---

## 매핑 표 (식별용)

| # | 산출물 | 경로 |
|---|--------|------|
| 0 | PRD | schedulePRD.md |
| 1 | 착수보고서 | 01.관리문서/착수보고서.md |
| 2 | WBS | 01.관리문서/WBS.md |
| 3 | 마켓리서치 | 02.기획문서/마켓리서치.md |
| 4 | 서비스기획서 | 02.기획문서/서비스기획서.md |
| 5 | 요구사항정의서 | 02.기획문서/요구사항정의서.md |
| 6 | 기능명세서 | 02.기획문서/기능명세서.md |
| 7 | API스펙 | 02.기획문서/API스펙.md |
| 8 | 정보구조도 | 02.기획문서/정보구조도.md |
| 9 | 화면설계서 | 02.기획문서/화면설계서.md |
| 10 | 인프라아키텍처 | 03.구현문서/인프라아키텍처.md |
| 11 | 시스템정의서 | 03.구현문서/시스템정의서.md |
| 12 | 데이터베이스설계서 | 03.구현문서/데이터베이스설계서.md |
| 13 | 디자인스타일가이드 | 03.구현문서/디자인스타일가이드.md |
| 14 | 중간보고서 | 01.관리문서/중간보고서.md |
| 15 | 테스트시나리오 | 04.검수문서/테스트시나리오.md |
| - | CLAUDE.md (규칙·도메인 용어 참고) | CLAUDE.md |

---

## W5 추가 등록 (개발·테스트 완료 후)

| 산출물 | 경로 |
|--------|------|
| 주간보고서 (W2~W5) | 01.관리문서/주간보고서_*.md |
| 테스트결과보고서 | 04.검수문서/테스트결과보고서.md |
| 완료보고서 | 01.관리문서/완료보고서.md |

---

## 등록 후 후속 작업

1. NotebookLM 노트북 URL 복사
2. `.AP-key.md`의 NotebookLM 섹션에 Notebook URL 기입
3. `.progress.md` 비고란의 `[NLM 미등록]` 표기 제거 (있는 경우)
