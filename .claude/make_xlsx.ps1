$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$xlsxPath = 'C:\Users\dydrm\Documents\ai\diary\02.기획문서\요구사항정의서_20260531_1547.xlsx'
if (Test-Path $xlsxPath) { Remove-Item $xlsxPath -Force }

# ----- Helper: XML escape -----
function Esc($s) {
    if ($null -eq $s) { return '' }
    $s = [string]$s
    $s = $s -replace '&', '&amp;'
    $s = $s -replace '<', '&lt;'
    $s = $s -replace '>', '&gt;'
    $s = $s -replace '"', '&quot;'
    $s = $s -replace "'", '&apos;'
    $s = $s -replace "`r`n", '&#10;'
    $s = $s -replace "`n", '&#10;'
    return $s
}

function ColLetter($n) {
    $s = ''
    while ($n -gt 0) {
        $r = ($n - 1) % 26
        $s = [char](65 + $r) + $s
        $n = [int](($n - $r) / 26)
    }
    return $s
}

# ----- Data: each sheet is a hashtable with Name, Cols (widths), Headers, Rows -----
$sheets = @()

# Sheet 0: 문서 정보
$sheets += @{
    Name = '0.문서정보'
    Cols = @(20, 80)
    Headers = @('항목','내용')
    Rows = @(
        @('프로젝트명','모먼토(Momento) — 온라인 다이어리 꾸미기'),
        @('산출물명','요구사항 정의서 (Requirements Definition)'),
        @('버전','v1.0'),
        @('작성일','2026-05-31'),
        @('작성자','사내 신규 서비스 TF PM'),
        @('상태','완료 (Gate-Check 통과)'),
        @('원본 문서','02.기획문서/요구사항정의서.md'),
        @('Excel 변환일','2026-05-31 15:47'),
        @('총 요구사항 수','기능 55건 + 비기능 32건 = 87건 (Must 38 / Should 13 / Could 7 / Won''t 1)'),
        @('사용자 스토리 수','32건 (US-001~032)'),
        @('관련 산출물','서비스기획서.md, 마켓리서치.md, 착수보고서.pdf, 서비스기획서(NLM).pdf, PRD.md'),
        @('승인 상태','승인 대기')
    )
}

# Sheet 1: 기능 요구사항 (F1-F9 통합)
$sheets += @{
    Name = '1.기능요구사항'
    Cols = @(14, 12, 10, 60, 12, 60, 30)
    Headers = @('카테고리','ID','구분','요구사항','우선순위','인수 기준','출처')
    Rows = @(
        # F1 인증·계정
        @('F1.인증·계정','REQ-001','인증','사용자는 Kakao / Google / Apple 소셜 로그인으로 가입·로그인할 수 있어야 한다','Must','3개 소셜 인증 모두 성공 흐름이 동작하며, 토큰 만료 시 자동 재발급된다','서비스기획서 §7.1'),
        @('F1.인증·계정','REQ-002','계정','사용자는 닉네임·프로필 이미지·자기소개(선택)를 설정할 수 있다','Must','그룹 멤버 목록과 댓글·리액션 영역에 닉네임/이미지가 일관되게 표시된다','서비스기획서 §3.1 페르소나'),
        @('F1.인증·계정','REQ-003','계정','사용자는 계정 탈퇴 시 본인 정보·콘텐츠를 일괄 삭제할 수 있다','Must','탈퇴 후 24시간 내 개인정보가 영구 삭제되며, 그룹 내 본인 작성 일정은 (탈퇴 사용자)로 익명화된다','KISA 가이드 / NLM PDF p.13'),
        @('F1.인증·계정','REQ-004','인증','사용자는 다중 디바이스(모바일/PC)에서 동일 계정으로 로그인 상태를 유지할 수 있다','Must','최대 5개 디바이스 동시 로그인 가능, 디바이스 목록 확인·로그아웃 지원','서비스기획서 §3.1'),
        @('F1.인증·계정','REQ-005','계정','사용자는 알림 수신 설정(웹 푸시 on/off, 이메일 on/off)을 변경할 수 있다','Must','변경 즉시 신규 알림에 반영되며, 기존 예약 알림도 갱신된다','서비스기획서 §4.2'),
        # F2 그룹 관리
        @('F2.그룹관리','REQ-010','그룹','사용자는 새 그룹을 생성하고 그룹명·대표 이미지·테마 컬러를 지정할 수 있다','Must','1인당 최대 5개 그룹 생성 가능(Free), Pro 무제한','서비스기획서 §4.2 §6.2'),
        @('F2.그룹관리','REQ-011','그룹','그룹장은 일회성 초대 링크 또는 6자리 초대 코드를 발급할 수 있다','Must','초대 링크는 발급 후 24시간 또는 1회 사용 시 만료, 코드 재발급 가능','서비스기획서 §4.3 #4 / NLM PDF p.13 Risk 3'),
        @('F2.그룹관리','REQ-012','그룹','사용자는 초대 링크/코드로 그룹에 참여할 수 있다','Must','만료된 링크/코드는 가입 시도 시 명확한 에러 메시지 제공','서비스기획서 §4.3'),
        @('F2.그룹관리','REQ-013','그룹','그룹 멤버는 Free 플랜 기준 그룹당 5인까지 허용된다 (Pro 무제한)','Must','5인 초과 가입 시도 시 ''Pro 업그레이드 안내'' 모달 노출','서비스기획서 §6.2'),
        @('F2.그룹관리','REQ-014','그룹','그룹장은 멤버를 강제 퇴장(킥)하거나 그룹장 권한을 이양할 수 있다','Must','강제 퇴장된 멤버의 작성 콘텐츠는 보존되며 작성자만 (퇴장 멤버)로 표시','서비스기획서 §3.1 / 운영 정책'),
        @('F2.그룹관리','REQ-015','그룹','멤버는 자발적으로 그룹을 탈퇴할 수 있다','Must','탈퇴 시 본인 작성 일정의 데코·댓글은 보존, 작성자만 익명화','서비스기획서 §3.1'),
        @('F2.그룹관리','REQ-016','그룹','사용자는 본인이 속한 그룹 목록을 한눈에 보고 빠르게 전환할 수 있다','Must','좌측 사이드바 또는 모바일 드로어에서 그룹 스위처 제공, 전환 응답 1초 이내','서비스기획서 §4.1 / NFR-001'),
        # F3 일정
        @('F3.일정','REQ-020','일정','그룹 멤버는 공동 캘린더에 일정을 등록(C)할 수 있다','Must','제목·시작/종료 일시·종일 옵션·반복(매일/매주/매월/매년) 입력 가능','착수보고서 §3.1-1'),
        @('F3.일정','REQ-021','일정','일정은 모든 그룹 멤버에게 실시간으로 동기화된다','Must','Supabase Realtime LISTEN 기반, 등록·수정 1초 이내 타 멤버 화면에 반영','NLM PDF p.9 / NFR-001'),
        @('F3.일정','REQ-022','일정','사용자는 일정을 조회(R)·수정(U)·삭제(D)할 수 있다','Must','작성자 또는 그룹장만 수정/삭제 가능, 일반 멤버는 조회만 (권한 정책 PRD 부속)','착수보고서 §3.1-1'),
        @('F3.일정','REQ-023','일정','캘린더는 월/주/일/리스트 4가지 뷰를 제공한다','Must','뷰 전환 시 데이터 재요청 없이 클라이언트 캐시로 즉시 렌더링','서비스기획서 §4.2 / 착수보고서 §3.1-3'),
        @('F3.일정','REQ-024','일정','사용자는 멤버별·그룹별·태그별 필터로 일정을 좁혀 볼 수 있다','Must','멀티 셀렉트 필터, 필터 상태는 URL 쿼리에 보존(공유 가능)','서비스기획서 §4.2'),
        @('F3.일정','REQ-025','일정','일정은 그룹별로 색상 구분되어 표시된다','Must','그룹 생성 시 지정한 테마 컬러가 일정 카드에 반영, 색맹 친화 팔레트 제공','서비스기획서 §4.2'),
        @('F3.일정','REQ-026','일정','D-day 일정(기념일 등)은 캘린더 상단에 카운트다운으로 표시된다','Should','D-7, 오늘, D+3 형태, 그룹별 최대 3개까지 핀 가능','서비스기획서 §4.2'),
        @('F3.일정','REQ-027','일정','일정은 작성자가 ''비공개'' 토글로 본인만 보이게 설정할 수 있다','Should','비공개 일정은 다른 멤버에게 (비공개 일정)으로 시간만 표시','페르소나 박서연(커플) 니즈'),
        # F4 꾸미기 에디터
        @('F4.꾸미기에디터','REQ-030','에디터','사용자는 일정 카드를 열어 캔버스형 에디터로 자유 배치 꾸미기를 할 수 있다','Must','데스크탑 마우스 + 모바일 터치 모두에서 드래그·리사이즈·회전 동작','서비스기획서 §4.3 #1 / NLM PDF p.5'),
        @('F4.꾸미기에디터','REQ-031','에디터','사용자는 Kakao Map / Google Maps API로 위치 핀을 추가할 수 있다','Must','검색 → 선택 → 핀 배치 흐름 30초 이내, 좌표·장소명·주소 함께 저장','서비스기획서 §7.1 / 착수보고서 §1'),
        @('F4.꾸미기에디터','REQ-032','에디터','사용자는 사진을 업로드하여 일정 카드에 배치할 수 있다','Must','JPEG/PNG/HEIC, 최대 10MB/장, 자동 WebP 변환·리사이징','NLM PDF p.13 Risk 미디어 / 서비스기획서 §8'),
        @('F4.꾸미기에디터','REQ-033','에디터','사용자는 YouTube/Vimeo URL을 붙여넣어 영상 카드를 임베드할 수 있다','Must','oEmbed 자동 메타데이터 파싱(썸네일·제목), 인라인 재생 지원','서비스기획서 §7.1 / 착수보고서 §1'),
        @('F4.꾸미기에디터','REQ-034','에디터','사용자는 임의 URL을 붙여넣어 OG 메타데이터 기반 카드 미리보기를 만들 수 있다','Must','URL 파싱 3초 이내, 실패 시 텍스트 링크로 폴백','착수보고서 §3.1-2'),
        @('F4.꾸미기에디터','REQ-035','에디터','사용자는 텍스트 메모(다이어리 일기)를 자유 폰트·색상·크기로 추가할 수 있다','Must','폰트 3종 + 색상 12종 + 크기 5단계 기본 제공','서비스기획서 §4.2'),
        @('F4.꾸미기에디터','REQ-036','에디터','사용자는 기본 스티커 50종을 드래그앤드롭으로 배치할 수 있다','Must','Free 플랜 50종, Pro 프리미엄 무제한 (REQ-080 연계)','서비스기획서 §6.2'),
        @('F4.꾸미기에디터','REQ-037','에디터','에디터는 자동 저장(드래프트)을 30초 단위로 수행한다','Must','네트워크 단절 후 복귀 시 IndexedDB 캐시에서 복원','사용자 데이터 손실 방지'),
        @('F4.꾸미기에디터','REQ-038','에디터','사용자는 에디터에서 Undo/Redo를 최소 20단계까지 사용할 수 있다','Should','Ctrl+Z/Ctrl+Shift+Z 단축키, 모바일은 상단 툴바 버튼','사용성'),
        @('F4.꾸미기에디터','REQ-039','에디터','사용자는 본인 일정 데코를 ''템플릿으로 저장''하여 재사용할 수 있다','Could','그룹 내 멤버에게 템플릿 공유 토글 제공 (Phase 2)','락인 전략 / NLM PDF p.8 Flywheel'),
        # F5 소셜·리액션
        @('F5.소셜·리액션','REQ-040','댓글','멤버는 일정 카드에 댓글을 작성할 수 있다','Must','텍스트 최대 500자, 이미지 첨부 1장 가능, 실시간 동기화','착수보고서 §3.1-5'),
        @('F5.소셜·리액션','REQ-041','리액션','멤버는 일정 또는 댓글에 6종 이모지로 마이크로 리액션할 수 있다','Must','1인 1리액션 토글, 집계 카운트 실시간 반영','서비스기획서 §4.3 #3 / NLM PDF p.5'),
        @('F5.소셜·리액션','REQ-042','댓글','멤버는 @멘션으로 다른 멤버를 호명할 수 있다','Should','멘션된 멤버에게 푸시·이메일 알림 자동 발송 (REQ-051 연계)','서비스기획서 §3.1'),
        @('F5.소셜·리액션','REQ-043','댓글','댓글은 작성자가 수정·삭제할 수 있으며 5분 후에는 ''수정됨'' 표기가 노출된다','Should','5분 이내 수정은 표기 없음, 이후 수정은 ''수정됨'' 뱃지','운영 정책'),
        @('F5.소셜·리액션','REQ-044','리액션','일정 카드 상단에 누적 리액션 수가 시간순 첫 멤버 아바타와 함께 요약된다','Should','♥3 외 2명이 반응 형태, 클릭 시 상세 리스트 모달','UI 사용성'),
        # F6 알림
        @('F6.알림','REQ-050','알림','시스템은 일정 등록·수정·삭제 시 그룹 멤버에게 웹 푸시 알림을 발송한다','Must','발송 지연 5초 이내, 작성자 본인은 제외','착수보고서 §3.1-4'),
        @('F6.알림','REQ-051','알림','시스템은 D-day 일정·멘션·신규 댓글에 대해 웹 푸시 + 이메일을 발송한다','Must','D-day 알림은 시작 1일 전·당일 오전 9시(사용자 타임존), 멘션·댓글은 즉시','서비스기획서 §4.2'),
        @('F6.알림','REQ-052','알림','사용자는 알림 빈도(즉시/요약/끄기)를 그룹별로 다르게 설정할 수 있다','Should','요약 옵션: 매일 1회 또는 매주 월요일 오전 9시 묶음 발송','페르소나 이준호(동호회) 니즈'),
        @('F6.알림','REQ-053','알림','시스템은 알림 클릭 시 해당 일정 카드 또는 댓글로 딥링크 이동한다','Must','PWA 환경에서도 정상 동작, 권한 없는 경우 로그인 페이지 경유','UX 일관성'),
        @('F6.알림','REQ-054','알림','시스템은 알림 수신함(인박스)에 최근 30일 알림 이력을 보관한다','Should','읽음/안 읽음 구분, 일괄 읽음 처리 가능','사용성'),
        # F7 PWA·UX
        @('F7.PWA·UX','REQ-060','PWA','서비스는 PWA로 동작하여 홈화면 추가·오프라인 캐싱·웹 푸시를 지원한다','Must','Lighthouse PWA 점수 90 이상','서비스기획서 §4.3 #5 / NLM PDF p.9'),
        @('F7.PWA·UX','REQ-061','UX','서비스는 모바일 320px부터 데스크탑 1920px까지 반응형으로 동작한다','Must','주요 뷰포트(360/768/1024/1440) 모두 깨짐 없이 렌더링','착수보고서 §3.1-6'),
        @('F7.PWA·UX','REQ-062','UX','서비스는 다크모드와 라이트모드를 OS 설정에 따라 자동 전환한다','Must','수동 토글 옵션 제공, 사용자 선택을 LocalStorage에 보존','착수보고서 §3.1-6'),
        @('F7.PWA·UX','REQ-063','UX','모든 인터랙티브 요소(버튼·아이콘)는 최소 44x44px 터치 타겟을 확보한다','Must','WCAG 2.5.5 Target Size 준수','모바일 사용성'),
        @('F7.PWA·UX','REQ-064','UX','페이지 전환·로딩 시 스켈레톤 UI 또는 프로그레스 인디케이터를 제공한다','Should','LCP 2.5초 초과 시 무조건 스켈레톤 노출','체감 성능'),
        # F8 아카이빙·검색
        @('F8.아카이빙·검색','REQ-070','아카이빙','사용자는 그룹의 과거 일정을 월/년 단위 타임라인으로 회고할 수 있다','Must','이달의 추억, 1년 전 오늘 등 자동 큐레이션 카드 제공','NLM PDF p.8 Flywheel Step 4 / 서비스기획서 §4.1'),
        @('F8.아카이빙·검색','REQ-071','검색','사용자는 일정 제목·메모·장소·태그·작성자로 검색할 수 있다','Must','검색 응답 1초 이내, 키워드 하이라이팅','NFR-001'),
        @('F8.아카이빙·검색','REQ-072','아카이빙','사용자는 그룹의 지도 핀 누적 뷰(우리가 다녀온 곳) 지도를 볼 수 있다','Must','핀 클릭 시 해당 일정 카드로 이동','서비스기획서 §4.3 #2 / 페르소나 박서연'),
        @('F8.아카이빙·검색','REQ-073','아카이빙','사용자는 본인 또는 그룹 전체 콘텐츠를 ZIP/PDF로 내보낼 수 있다','Could','Free는 월 1회·최대 100건, Pro 무제한','데이터 이동권 / 개인정보보호법'),
        # F9 확장
        @('F9.확장(Phase2/3)','REQ-080','마켓','사용자·디자이너는 스티커 팩을 등록·판매할 수 있다 (Phase 2)','Should','심사 워크플로우 포함, 거래의 15% 플랫폼 수수료','서비스기획서 §4.2 §6.1'),
        @('F9.확장(Phase2/3)','REQ-081','마켓','사용자는 스티커 마켓에서 무료/유료 팩을 다운로드하여 에디터에서 사용할 수 있다','Should','다운로드 즉시 에디터 우측 패널에 노출','서비스기획서 §6.1'),
        @('F9.확장(Phase2/3)','REQ-082','연동','사용자는 Google Calendar / Apple iCal과 양방향 동기화할 수 있다 (Phase 2)','Should','동기화 충돌 시 사용자 선택 UI 제공','서비스기획서 §4.2 / 착수보고서 §3.2-1'),
        @('F9.확장(Phase2/3)','REQ-083','결제','사용자는 Pro / Family 구독을 토스페이먼츠로 결제할 수 있다 (Phase 3)','Could','KRW 통화, 멱등 confirm API, 결제 실패 시 재시도 흐름','서비스기획서 §7.1 / CLAUDE.md 결제 체크리스트'),
        @('F9.확장(Phase2/3)','REQ-084','결제','사용자는 정기결제 해지·환불 요청을 셀프 서비스로 처리할 수 있다','Could','해지 즉시 다음 결제 주기 종료, 일할 환불 정책 명시','운영 정책'),
        @('F9.확장(Phase2/3)','REQ-089','운영','관리자는 백오피스에서 사용자·그룹·결제·신고 콘텐츠를 관리할 수 있다','Could','RBAC 기반(슈퍼/일반 관리자 권한), 감사 로그 보관','운영 필수')
    )
}

# Sheet 2: 비기능 요구사항
$sheets += @{
    Name = '2.비기능요구사항'
    Cols = @(16, 12, 60, 30, 40, 30)
    Headers = @('카테고리','ID','요구사항','기준값','측정 방법','출처')
    Rows = @(
        # 성능
        @('성능','NFR-001','일정 조회 응답시간','1초 이내 (P95)','Lighthouse / Real User Monitoring','서비스기획서 §1.2 / 착수보고서 §2'),
        @('성능','NFR-002','일정 등록 → 타 멤버 실시간 반영 지연','1초 이내 (Supabase Realtime)','자동 E2E 테스트 (2개 브라우저 세션)','NLM PDF p.9'),
        @('성능','NFR-003','미디어 업로드 후 썸네일 노출','3초 이내 (10MB 이미지 기준)','자동 리사이징·WebP 변환 포함','NLM PDF p.13 Risk'),
        @('성능','NFR-004','페이지 LCP (Largest Contentful Paint)','2.5초 이내','Lighthouse / WebVitals','사용성'),
        @('성능','NFR-005','검색 응답시간','1초 이내 (P95, 1만 일정 기준)','Postgres 인덱스 튜닝','REQ-071'),
        # 가용성
        @('가용성','NFR-010','서비스 가동률 (월간)','99.5% 이상','Vercel + Supabase 상태 모니터링 / Uptime Robot','서비스기획서 §1.2 / 착수보고서 §2'),
        @('가용성','NFR-011','장애 발생 시 복구 시간 (RTO)','30분 이내','자동 페일오버 + 알림 + 롤백 절차','운영 정책'),
        @('가용성','NFR-012','데이터 손실 허용 시간 (RPO)','15분 이내','Supabase Daily Backup + PITR','운영 정책'),
        # 보안
        @('보안','NFR-020','모든 통신은 HTTPS(TLS 1.2+)로 암호화','전 구간 HTTPS','Vercel 기본 + HSTS 헤더','착수보고서 §3.1-6'),
        @('보안','NFR-021','그룹 외 사용자는 그룹 데이터에 접근 불가','Supabase RLS 정책 100% 적용','RLS 정책 자동 테스트 (Phase 1 CI)','서비스기획서 §4.3 #4 / NLM PDF p.13 Risk 3'),
        @('보안','NFR-022','비밀번호·토큰·민감 정보는 평문 저장 금지','bcryptjs 해싱 (서버리스), JWT 서명','코드 리뷰 + 시크릿 스캐너','서비스기획서 §7.1'),
        @('보안','NFR-023','초대 링크는 1회 사용 또는 24시간 후 자동 만료','만료 토큰 검증','E2E 테스트','NLM PDF p.13 Risk 3'),
        @('보안','NFR-024','미디어 업로드 파일은 RLS 기반 서명 URL로 접근 제어','Supabase Storage 정책 적용','비인가 URL 접근 차단 테스트','서비스기획서 §7.1'),
        @('보안','NFR-025','시스템은 KISA 보안 가이드라인을 준수한다','KISA 점검 항목 90% 이상 충족','자체 점검 체크리스트','서비스기획서 §4.3 #4'),
        @('보안','NFR-026','시스템은 사용자 동의 기반 감사 로그를 보관한다','1년 보관, 관리자만 접근','별도 로그 테이블 + RLS','운영 정책'),
        @('보안','NFR-027','시스템은 XSS·CSRF·SQL Injection 등 OWASP Top 10에 대응한다','OWASP ZAP 스캔 Critical 0건','CI 보안 스캔','일반 보안 표준'),
        # 사용성
        @('사용성','NFR-030','모바일 퍼스트 반응형 UI','320px ~ 1920px 모두 정상 렌더링','디바이스 매트릭스 테스트','REQ-061'),
        @('사용성','NFR-031','WCAG 2.1 AA 수준 접근성 준수','접근성 자동 검사 도구(axe) 위반 0건','CI 단계 axe 통합','사용성 표준'),
        @('사용성','NFR-032','UI 텍스트는 한국어 기본, 다국어 확장 가능 구조','i18n 키 분리, 영어 추가 시 코드 변경 없음','코드 구조 검증','글로벌 확장 대비'),
        @('사용성','NFR-033','모든 폼은 인라인 유효성 검증·에러 메시지를 제공한다','필수 입력 누락 시 즉시 안내','UI 테스트','UX'),
        @('사용성','NFR-034','페이지 평균 학습 시간 (First Time User Experience)','첫 그룹 생성·일정 등록까지 5분 이내','사용성 테스트 (W13 베타)','페르소나 김지우(Z세대)'),
        # 호환성
        @('호환성','NFR-040','브라우저 호환','Chrome / Safari / Edge / Samsung Internet 최신 2개 메이저 버전','BrowserStack 자동 테스트','PWA 표준'),
        @('호환성','NFR-041','모바일 OS 호환','iOS 15+ / Android 10+','실기기 회귀 테스트 (베타)','시장 점유 95% 커버'),
        @('호환성','NFR-042','PWA 설치 가능 환경','Chrome / Safari / Samsung Internet','Lighthouse 인증','REQ-060'),
        # 확장성
        @('확장성','NFR-050','MVP 동시 접속 처리','500명 이내 안정 동작','k6 부하 테스트 (Phase 1 종료 직전)','착수보고서 §3.2-3'),
        @('확장성','NFR-051','M5+ 단계 트래픽 증가 시 Express 백엔드 분리 가능한 구조 유지','API 코드 모듈화, 의존성 명확','코드 리뷰 + CLAUDE.md M1~M5 정책 정합','CLAUDE.md Backend 배치 전략'),
        @('확장성','NFR-052','미디어 스토리지는 CDN 캐싱으로 글로벌 응답 보장','Supabase Storage + Vercel Edge','RUM 모니터링','NLM PDF p.9'),
        # 유지보수성
        @('유지보수성','NFR-060','타입 안정성','TypeScript strict 모드, tsc --noEmit 에러 0','CI 단계 강제','CLAUDE.md'),
        @('유지보수성','NFR-061','테스트 커버리지','핵심 비즈니스 로직 80% 이상','Jest + Vitest 커버리지 리포트','착수보고서 §2 (테스트 통과율 95%)'),
        @('유지보수성','NFR-062','CI/CD 자동화','GitHub Actions로 lint·type·test·build·deploy 일괄','워크플로우 정상 동작 확인','서비스기획서 §7.1 / 착수보고서 §4'),
        @('유지보수성','NFR-063','구조화 로그 + 에러 모니터링','Sentry 또는 동등 솔루션 연동, 5분 이내 알림','장애 시뮬레이션','운영 필수'),
        # 법규
        @('법규·컴플라이언스','NFR-070','개인정보보호법(한국)·GDPR(글로벌) 준수','개인정보 처리방침 게시, 동의·철회 흐름 구현','법무 검토 (W14 전)','법규'),
        @('법규·컴플라이언스','NFR-071','14세 미만 청소년 가입 제한 또는 법정대리인 동의 절차','가입 시 생년월일 확인 + 14세 미만은 동의 흐름 분기','E2E 테스트','청소년보호법'),
        @('법규·컴플라이언스','NFR-072','사용자 데이터 이동권(데이터 다운로드) 보장','REQ-073 연계, 30일 내 응답','운영 절차서','GDPR / 국내법')
    )
}

# Sheet 3: MoSCoW 매트릭스
$sheets += @{
    Name = '3.MoSCoW매트릭스'
    Cols = @(14, 50, 14, 10, 24)
    Headers = @('우선순위','정의','요구사항 수','비율','적용 단계')
    Rows = @(
        @('Must (필수)','MVP 런칭 전 반드시 구현','38건','~64%','W1~W12'),
        @('Should (중요)','MVP 런칭에 강력 권장, 누락 시 사용자 불만 가능','13건','~22%','W4~W15'),
        @('Could (선택)','시간·자원 여유 시 구현, Phase 2/3 후순위','7건','~12%','Phase 2 / Phase 3'),
        @("Won't (이번 제외)",'명시적 범위 외','1건','~2%','차기')
    )
}

# Sheet 4: 사용자 스토리
$sheets += @{
    Name = '4.사용자스토리'
    Cols = @(10, 28, 40, 50, 50, 22)
    Headers = @('ID','As a (페르소나)','I want (기능)','So that (가치)','연결 REQ','출처')
    Rows = @(
        # 김지우
        @('US-001','대학생 친구 그룹 리더 (김지우)','우리 4명만 보는 폐쇄 그룹을 5분 안에 만들고 초대 링크로 친구를 부르고 싶다','카톡 단톡방 대신 우리만의 공간을 빠르게 시작할 수 있다','REQ-010~012, NFR-034','서비스기획서 §3.1'),
        @('US-002','Z세대 다꾸 친화 사용자 (김지우)','일정 카드에 우리 만난 카페 사진과 스티커, 이모지를 자유 배치하고 싶다','인스타 부계정 대신 우리 그룹 안에서 다꾸 욕구를 충족할 수 있다','REQ-030, 032, 035, 036','서비스기획서 §3.1'),
        @('US-003','매주 만나는 친구 그룹 멤버 (김지우)','친구가 일정에 ♥ 리액션 남기는 걸 즉시 보고 싶다','단톡방 사진 만료의 외로움 없이 즉각 피드백을 받을 수 있다','REQ-041, NFR-002','서비스기획서 §3.1'),
        @('US-004','1년 후의 김지우','작년 이맘때 우리가 뭘 했는지 이달의 추억 카드로 보고 싶다','단톡방·인스타와 달리 시간이 쌓인 우리만의 히스토리북을 갖는다','REQ-070','NLM PDF p.8 Flywheel'),
        # 박서연
        @('US-010','5년 사귄 커플의 한쪽 (박서연)','다녀온 데이트 카페·여행지를 자동 지도 핀으로 누적하고 싶다','종이 다이어리에 폴라로이드 붙이는 노력 없이 추억 동선을 시각화한다','REQ-031, REQ-072','서비스기획서 §3.1'),
        @('US-011','기념일이 중요한 커플 사용자 (박서연)','D-day 일정에 카운트다운과 알림을 받고 싶다','기념일을 놓치지 않고, 둘이 함께 미리 준비할 수 있다','REQ-026, REQ-051','서비스기획서 §3.1'),
        @('US-012','Between 텍스트 일색에 지친 커플 (박서연)','일정 카드를 캔버스처럼 자유 배치해 감성적으로 꾸미고 싶다','종이 다이어리의 감성을 모바일에서도 유지할 수 있다','REQ-030, REQ-035','서비스기획서 §3.1'),
        @('US-013','둘만 보는 비공개 일정이 필요한 사용자 (박서연)','가족 그룹에서는 일부 일정만 본인에게 보이도록 비공개 설정하고 싶다','그룹 내에서도 사적 영역을 안전하게 분리할 수 있다','REQ-027','페르소나 박서연'),
        # 이준호
        @('US-020','12명 동호회 운영자 (이준호)','매월 정기 모임 일정을 반복으로 등록하고 멤버 참석 여부를 한눈에 확인하고 싶다','네이버 밴드 + 카톡 + Sheets를 한 곳으로 통합할 수 있다','REQ-020, REQ-024','서비스기획서 §3.1'),
        @('US-021','정기 모임 운영자 (이준호)','매월 모임 일정이 캘린더에 누적되며 시각적 히스토리 북이 형성되길 원한다','게시판에 사진이 묻히는 네이버 밴드의 한계를 극복한다','REQ-070, REQ-072','서비스기획서 §3.1'),
        @('US-022','알림을 너무 자주 받으면 지치는 운영자 (이준호)','동호회 그룹은 매주 월요일 요약 알림만 받고 싶다','알림 과잉으로 인한 푸시 끄기 / 이탈을 방지한다','REQ-052','페르소나 이준호'),
        @('US-023','동호회 운영자 (이준호)','우리 동호회 전용 스티커 팩을 직접 만들어 사용하고 싶다 (Phase 2)','동호회 정체성과 브랜드를 시각적으로 형성할 수 있다','REQ-080, REQ-081','서비스기획서 §3.1'),
        # 운영
        @('US-030','서비스 운영자 (PM)','신고된 콘텐츠·결제 분쟁·이상 사용자를 백오피스에서 한 번에 처리하고 싶다','신속한 운영 대응으로 사용자 만족과 신뢰를 유지한다','REQ-089, NFR-026','운영 정책'),
        @('US-031','보안 관리자','그룹 외 사용자는 어떤 API로도 그룹 데이터에 접근할 수 없어야 한다','개인정보·미디어 유출 리스크를 원천 차단한다','NFR-021, NFR-024','보안 표준'),
        @('US-032','개발팀','모든 PR에서 lint·type·test·build·deploy가 자동 실행되길 원한다','회귀 결함을 사전 차단하고 1인 운영 부하를 최소화한다','NFR-060~062','CLAUDE.md')
    )
}

# Sheet 5: 추적 매트릭스
$sheets += @{
    Name = '5.추적매트릭스'
    Cols = @(14, 22, 30, 32, 22, 30)
    Headers = @('REQ ID','기능명세서(#6)','화면설계서(#9)','API스펙(#7)','테스트시나리오(#15)','비고')
    Rows = @(
        @('REQ-001','F-AUTH-001 (소셜 로그인)','S-LOGIN','POST /api/auth/social','TC-AUTH-001~005','Kakao/Google/Apple'),
        @('REQ-010~016','F-GROUP-001~007','S-GROUP-LIST, S-GROUP-DETAIL, S-INVITE','/api/groups/*','TC-GROUP-*','초대 링크 만료 핵심 검증'),
        @('REQ-020~025','F-EVENT-001~006','S-CALENDAR-M/W/D/L','/api/events/*','TC-EVENT-*','Realtime 동기화 포함'),
        @('REQ-030~036','F-EDITOR-001~007','S-EVENT-EDITOR','/api/decorations/*, /api/media/upload','TC-EDITOR-*','모바일 터치 PoC 필수'),
        @('REQ-040~041','F-SOCIAL-001~002','S-EVENT-DETAIL','/api/comments/*, /api/reactions/*','TC-SOCIAL-*','6종 이모지 표준'),
        @('REQ-050~051','F-NOTIFY-001~002','(백그라운드)','/api/notifications/*, Service Worker','TC-NOTIFY-*','웹 푸시 권한 동의 흐름'),
        @('REQ-060~063','F-PWA-001~004','(전역)','(manifest.json, sw.js)','TC-PWA-*','Lighthouse 자동화'),
        @('REQ-070~072','F-ARCHIVE-001~003','S-TIMELINE, S-MEMORY-MAP','/api/archive/*','TC-ARCHIVE-*','M3 KPI 직결')
    )
}

# Sheet 6: 가정·제약
$sheets += @{
    Name = '6.가정과제약'
    Cols = @(10, 10, 56, 50)
    Headers = @('구분','ID','내용','근거 / 영향')
    Rows = @(
        @('가정','A-001','Supabase Auth가 Kakao 소셜 로그인을 안정 지원한다','Supabase 공식 문서'),
        @('가정','A-002','Kakao Map API 무료 쿼터(월 300,000건)가 MVP 기간 충분하다','MVP MAU 5만 시나리오 기준'),
        @('가정','A-003','Vercel Hobby/Pro 플랜의 Lambda 60초 한도 내에서 핵심 흐름이 동작한다','CLAUDE.md M1~M4 배치 전략'),
        @('가정','A-004','사용자 미디어 평균 크기는 일정당 2~5MB, 1GB Free 한도로 충분하다','페르소나 분석'),
        @('제약','C-001','기술 스택 V0.42 표준(Next.js + Supabase + Vercel) 변경 불가','라이브러리 선택지 제한'),
        @('제약','C-002','1인 운영을 기본 전제로 M1~M4는 백엔드 통합 배치 유지','NFR-051 / CLAUDE.md'),
        @('제약','C-003','MVP 예산상 Sentry·CDN 등 유료 SaaS는 Free 티어 우선 사용','NFR-063 / 운영 비용'),
        @('제약','C-004','한국 사업자 PG 1순위는 토스페이먼츠(Stripe는 한국 미지원)','REQ-083 / CLAUDE.md 결제'),
        @('제약','C-005','16주(W1~W16) 일정 내 P0(Must) 38건 완수가 최우선','착수보고서 §4')
    )
}

Write-Output "Total sheets: $($sheets.Count)"
foreach ($s in $sheets) {
    Write-Output "  $($s.Name): $($s.Rows.Count) rows"
}

# ----- Build xlsx -----
$zipStream = [System.IO.File]::Create($xlsxPath)
$archive = [System.IO.Compression.ZipArchive]::new($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-Entry($archive, $path, $content) {
    $entry = $archive.CreateEntry($path, [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($content)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
}

# [Content_Types].xml
$overrides = ''
for ($i = 1; $i -le $sheets.Count; $i++) {
    $overrides += "<Override PartName=`"/xl/worksheets/sheet$i.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml`"/>"
}
$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>$overrides<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>
"@
Add-Entry $archive '[Content_Types].xml' $contentTypes

# _rels/.rels
$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>
"@
Add-Entry $archive '_rels/.rels' $rels

# xl/_rels/workbook.xml.rels
$wbRels = ''
for ($i = 1; $i -le $sheets.Count; $i++) {
    $wbRels += "<Relationship Id=`"rId$i`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet`" Target=`"worksheets/sheet$i.xml`"/>"
}
$styleRelId = "rId" + ($sheets.Count + 1)
$wbRels += "<Relationship Id=`"$styleRelId`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles`" Target=`"styles.xml`"/>"
$wbRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">$wbRels</Relationships>
"@
Add-Entry $archive 'xl/_rels/workbook.xml.rels' $wbRelsXml

# xl/workbook.xml
$sheetTags = ''
for ($i = 0; $i -lt $sheets.Count; $i++) {
    $name = Esc $sheets[$i].Name
    $sid = $i + 1
    $sheetTags += "<sheet name=`"$name`" sheetId=`"$sid`" r:id=`"rId$sid`"/>"
}
$workbookXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>$sheetTags</sheets></workbook>
"@
Add-Entry $archive 'xl/workbook.xml' $workbookXml

# xl/styles.xml (header=style2 with coral fill+white bold, data=style1 with wrap+top align)
$stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="맑은 고딕"/></font><font><b/><sz val="11"/><name val="맑은 고딕"/><color rgb="FFFFFFFF"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF8FA3"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFE0E0E0"/></left><right style="thin"><color rgb="FFE0E0E0"/></right><top style="thin"><color rgb="FFE0E0E0"/></top><bottom style="thin"><color rgb="FFE0E0E0"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>
'@
Add-Entry $archive 'xl/styles.xml' $stylesXml

# Worksheets
for ($s = 0; $s -lt $sheets.Count; $s++) {
    $sheet = $sheets[$s]
    $colsXml = '<cols>'
    for ($c = 0; $c -lt $sheet.Cols.Count; $c++) {
        $w = $sheet.Cols[$c]
        $colIdx = $c + 1
        $colsXml += "<col min=`"$colIdx`" max=`"$colIdx`" width=`"$w`" customWidth=`"1`"/>"
    }
    $colsXml += '</cols>'

    $rowsXml = ''
    # Header row (row 1)
    $rowsXml += '<row r="1" ht="22" customHeight="1">'
    for ($c = 0; $c -lt $sheet.Headers.Count; $c++) {
        $cellRef = (ColLetter ($c + 1)) + '1'
        $val = Esc $sheet.Headers[$c]
        $rowsXml += "<c r=`"$cellRef`" s=`"2`" t=`"inlineStr`"><is><t xml:space=`"preserve`">$val</t></is></c>"
    }
    $rowsXml += '</row>'

    # Data rows
    for ($r = 0; $r -lt $sheet.Rows.Count; $r++) {
        $row = $sheet.Rows[$r]
        $rowNum = $r + 2
        $rowsXml += "<row r=`"$rowNum`">"
        for ($c = 0; $c -lt $row.Count; $c++) {
            $cellRef = (ColLetter ($c + 1)) + $rowNum
            $val = Esc $row[$c]
            $rowsXml += "<c r=`"$cellRef`" s=`"1`" t=`"inlineStr`"><is><t xml:space=`"preserve`">$val</t></is></c>"
        }
        $rowsXml += '</row>'
    }

    $lastCol = ColLetter $sheet.Headers.Count
    $lastRow = $sheet.Rows.Count + 1
    $dim = "A1:$lastCol$lastRow"
    $filterRef = "A1:${lastCol}1"

    $sheetXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="$dim"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>$colsXml<sheetData>$rowsXml</sheetData><autoFilter ref="$filterRef"/></worksheet>
"@
    $sheetNum = $s + 1
    Add-Entry $archive "xl/worksheets/sheet$sheetNum.xml" $sheetXml
}

$archive.Dispose()
$zipStream.Close()

Write-Output ""
Write-Output "Created: $xlsxPath"
$fi = Get-Item $xlsxPath
Write-Output "Size: $($fi.Length) bytes"
