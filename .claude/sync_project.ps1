# PAT는 .AP-key.md를 직접 참조하거나 환경변수로 주입하세요 (저장소에 평문 커밋 금지)
$token = $env:GITHUB_TOKEN
$owner = "asdymj"
$repo = "schedule"
$projectNumber = 4

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
}

# WBS 태스크 데이터 정의 (Level 2 핵심 태스크 11개)
$tasks = @(
    @{ title = "WBS 1.1: 요구사항 분석"; body = "담당: 기획자 / PM`n예상 공수: 9 MD`n기간: 2026-05-18 ~ 2026-05-24`n산출물: 요구사항 정의서" },
    @{ title = "WBS 1.2: 서비스 기획 및 UI/UX 설계"; body = "담당: 기획자 / 디자이너`n예상 공수: 18 MD`n기간: 2026-05-25 ~ 2026-05-31`n산출물: 화면설계 및 스타일 가이드" },
    @{ title = "WBS 1.3: 시스템 아키텍처 및 상세 설계"; body = "담당: 개발자`n예상 공수: 10 MD`n기간: 2026-06-01 ~ 2026-06-07`n산출물: 아키텍처 및 DB 설계" },
    @{ title = "WBS 2.1: 프론트엔드 개발"; body = "담당: 개발자(프론트)`n예상 공수: 48 MD`n기간: 2026-06-08 ~ 2026-07-26`n산출물: 프론트엔드 컴포넌트" },
    @{ title = "WBS 2.2: 백엔드 개발"; body = "담당: 개발자(백엔드)`n예상 공수: 31 MD`n기간: 2026-06-08 ~ 2026-07-26`n산출물: 백엔드 API 및 DB 연동" },
    @{ title = "WBS 2.3: 통합 및 1차 배포"; body = "담당: 개발자 전원 / PM`n예상 공수: 23 MD`n기간: 2026-07-27 ~ 2026-08-09`n산출물: 1차 통합본 및 배포" },
    @{ title = "WBS 3.1: 테스트 시나리오 작성 및 검증"; body = "담당: PM / 기획 / 디자인`n예상 공수: 12 MD`n기간: 2026-08-10 ~ 2026-08-16`n산출물: QA 결과 리포트" },
    @{ title = "WBS 3.2: 테스트 코드 구현 및 자동화"; body = "담당: 개발자 전원`n예상 공수: 16 MD`n기간: 2026-08-17 ~ 2026-08-23`n산출물: 자동화 파이프라인" },
    @{ title = "WBS 3.3: n8n 자동화 및 알림 워크플로우 셋업"; body = "담당: 개발자(백엔드)`n예상 공수: 5 MD`n기간: 2026-08-24 ~ 2026-08-30`n산출물: n8n 워크플로우" },
    @{ title = "WBS 4.1: 서비스 안정화 및 버그 핫픽스"; body = "담당: 개발자 / 디자인`n예상 공수: 10 MD`n기간: 2026-08-31 ~ 2026-09-04`n산출물: 핫픽스 완료 코드" },
    @{ title = "WBS 4.2: 프로젝트 마무리 및 배포"; body = "담당: PM`n예상 공수: 5 MD`n기간: 2026-09-04 ~ 2026-09-06`n산출물: 최종 마감 보고서" }
)

# 1. Project 및 Repo의 Node ID 획득 (GraphQL)
$query = @"
query {
  user(login: "$owner") {
    projectV2(number: $projectNumber) {
      id
    }
  }
  repository(owner: "$owner", name: "$repo") {
    id
  }
}
"@

$body = @{ query = $query } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $body -ContentType "application/json"

$projectId = $response.data.user.projectV2.id
$repoId = $response.data.repository.id

Write-Host "Project ID: $projectId"
Write-Host "Repo ID: $repoId"

if (-not $projectId -or -not $repoId) {
    Write-Error "Failed to fetch Project ID or Repo ID. Check Token permissions."
    exit
}

# 2. 각 WBS 태스크를 Issue로 등록하고 Project Board에 추가
foreach ($task in $tasks) {
    Write-Host "Creating issue: $($task.title)..."
    
    $issueBody = @{
        title = $task.title
        body = $task.body
    } | ConvertTo-Json -Compress
    
    # UTF-8 인코딩
    $issueBodyBytes = [System.Text.Encoding]::UTF8.GetBytes($issueBody)
    
    $issueResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/issues" -Method Post -Headers $headers -Body $issueBodyBytes -ContentType "application/json; charset=utf-8"
    
    $issueNodeId = $issueResponse.node_id
    Write-Host "Created Issue Node ID: $issueNodeId"
    
    # GraphQL로 Project Board 아이템 추가
    $mutation = @"
mutation {
  addProjectV2ItemById(input: {projectId: "$projectId", contentId: "$issueNodeId"}) {
    item {
      id
    }
  }
}
"@
    $mutBody = @{ query = $mutation } | ConvertTo-Json
    $mutResponse = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $mutBody -ContentType "application/json"
    
    Write-Host "Added to project. Item ID: $($mutResponse.data.addProjectV2ItemById.item.id)"
}

Write-Host "All WBS tasks have been successfully registered to the GitHub Project Board!"
