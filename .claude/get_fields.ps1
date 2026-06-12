# PAT는 .AP-key.md를 직접 참조하거나 환경변수로 주입하세요 (저장소에 평문 커밋 금지)
$token = $env:GITHUB_TOKEN
$owner = "asdymj"
$projectNumber = 4

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
}

$query = @"
query {
  user(login: "$owner") {
    projectV2(number: $projectNumber) {
      fields(first: 50) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
          }
          ... on ProjectV2IterationField {
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

$body = @{ query = $query } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $body -ContentType "application/json"
$res.data.user.projectV2.fields.nodes | ConvertTo-Json
