# PAT는 .AP-key.md를 직접 참조하거나 환경변수로 주입하세요 (저장소에 평문 커밋 금지)
$token = $env:GITHUB_TOKEN
$owner = "asdymj"
$projectNumber = 4
$projectId = "PVT_kwHOEQHZGs4BYoGI"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
}

# 1. WBS ID를 기준으로 날짜 정의 (영문만 사용)
$wbsDates = @{
    "WBS 1.1" = @{ start = "2026-05-18"; end = "2026-05-24" }
    "WBS 1.2" = @{ start = "2026-05-25"; end = "2026-05-31" }
    "WBS 1.3" = @{ start = "2026-06-01"; end = "2026-06-07" }
    "WBS 2.1" = @{ start = "2026-06-08"; end = "2026-07-26" }
    "WBS 2.2" = @{ start = "2026-06-08"; end = "2026-07-26" }
    "WBS 2.3" = @{ start = "2026-07-27"; end = "2026-08-09" }
    "WBS 3.1" = @{ start = "2026-08-10"; end = "2026-08-16" }
    "WBS 3.2" = @{ start = "2026-08-17"; end = "2026-08-23" }
    "WBS 3.3" = @{ start = "2026-08-24"; end = "2026-08-30" }
    "WBS 4.1" = @{ start = "2026-08-31"; end = "2026-09-04" }
    "WBS 4.2" = @{ start = "2026-09-04"; end = "2026-09-06" }
}

# GraphQL 요청 헬퍼
function Send-GraphQL($query, $variables = $null) {
    $body = @{ query = $query }
    if ($variables) { $body.variables = $variables }
    $bodyJson = $body | ConvertTo-Json
    return Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $bodyJson -ContentType "application/json"
}

# 2. 기존 프로젝트 필드 조회
Write-Host "Checking existing fields..."
$fieldsQuery = @"
query {
  node(id: "$projectId") {
    ... on ProjectV2 {
      fields(first: 50) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
        }
      }
    }
  }
}
"@
$fieldsRes = Send-GraphQL $fieldsQuery
$fields = $fieldsRes.data.node.fields.nodes

$startDateFieldId = ($fields | Where-Object { $_.name -eq "Start Date" -and $_.dataType -eq "DATE" }).id
$endDateFieldId = ($fields | Where-Object { $_.name -eq "End Date" -and $_.dataType -eq "DATE" }).id

# Start Date 필드 생성 (존재하지 않을 경우)
if (-not $startDateFieldId) {
    Write-Host "Creating 'Start Date' field..."
    $createStartQuery = @"
mutation {
  createProjectV2Field(input: {projectId: "$projectId", dataType: DATE, name: "Start Date"}) {
    projectV2Field {
      ... on ProjectV2Field {
        id
      }
    }
  }
}
"@
    $createStartRes = Send-GraphQL $createStartQuery
    $startDateFieldId = $createStartRes.data.createProjectV2Field.projectV2Field.id
}

# End Date 필드 생성 (존재하지 않을 경우)
if (-not $endDateFieldId) {
    Write-Host "Creating 'End Date' field..."
    $createEndQuery = @"
mutation {
  createProjectV2Field(input: {projectId: "$projectId", dataType: DATE, name: "End Date"}) {
    projectV2Field {
      ... on ProjectV2Field {
        id
      }
    }
  }
}
"@
    $createEndRes = Send-GraphQL $createEndQuery
    $endDateFieldId = $createEndRes.data.createProjectV2Field.projectV2Field.id
}

Write-Host "Start Date Field ID: $startDateFieldId"
Write-Host "End Date Field ID: $endDateFieldId"

# 3. 프로젝트 보드 아이템들 가져오기
Write-Host "Fetching project items..."
$itemsQuery = @"
query {
  node(id: "$projectId") {
    ... on ProjectV2 {
      items(first: 50) {
        nodes {
          id
          content {
            ... on Issue {
              title
            }
          }
        }
      }
    }
  }
}
"@
$itemsRes = Send-GraphQL $itemsQuery
$items = $itemsRes.data.node.items.nodes

# 4. 각 아이템에 WBS 날짜 업데이트 수행
foreach ($item in $items) {
    $title = $item.content.title
    
    # 정규식을 사용하여 제목에서 "WBS X.X" 매칭 및 추출
    if ($title -match 'WBS \d+\.\d+') {
        $wbsId = $Matches[0]
        if ($wbsDates.ContainsKey($wbsId)) {
            $dates = $wbsDates[$wbsId]
            $itemId = $item.id
            Write-Host "Updating dates for: $title ($wbsId)..."
            
            # Start Date 주입
            $upStartQuery = @"
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "$projectId"
    itemId: "$itemId"
    fieldId: "$startDateFieldId"
    value: { date: "$($dates.start)" }
  }) {
    projectV2Item { id }
  }
}
"@
            $null = Send-GraphQL $upStartQuery
            
            # End Date 주입
            $upEndQuery = @"
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "$projectId"
    itemId: "$itemId"
    fieldId: "$endDateFieldId"
    value: { date: "$($dates.end)" }
  }) {
    projectV2Item { id }
  }
}
"@
            $null = Send-GraphQL $upEndQuery
            
            Write-Host "Successfully updated: $title (Start: $($dates.start), End: $($dates.end))"
        }
    }
}

Write-Host "All WBS dates have been successfully populated to the GitHub Project Board fields!"
