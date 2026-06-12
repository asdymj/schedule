# 인프라자료

> 서버 구성, 네트워크, DB, 배포 환경 문서 저장

## 등록 대상 (Share Diary Calendar 프로젝트)

| 종류 | 파일명 예시 | 비고 |
|------|------------|------|
| Vercel 배포 구성 | INF-01_Vercel_프로젝트설정.md | Build/Env/Domain 캡처 |
| Supabase 구성 | INF-02_Supabase_프로젝트설정.md | Region/Plan/Auth Provider |
| 환경변수 매트릭스 | INF-03_환경변수_매트릭스.md | Local/Preview/Prod 구분 |
| Kakao Map API | INF-04_KakaoMap_도메인등록.md | 등록 도메인 및 할당량 |
| GitHub Actions | INF-05_CI_CD_워크플로우.md | .github/workflows/ 사본 |
| Storage Bucket 정책 | INF-06_Storage_RLS_정책.md | photos/, videos/, urls/ |

## 관련 산출물 (구현문서)

| 구분 | 경로 |
|------|------|
| 인프라아키텍처 | 03.구현문서/인프라아키텍처.md |
| 데이터베이스설계서 | 03.구현문서/데이터베이스설계서.md |
| 시스템정의서 | 03.구현문서/시스템정의서.md |

> 인프라자료/는 운영 중 변동되는 **실제 설정 캡처**를 보관 (산출물은 설계 시점 문서)

## NotebookLM 등록

자료 추가 후 GitHub push → raw URL을 NotebookLM 소스로 등록
