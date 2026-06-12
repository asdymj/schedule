// export_jobs(#12 §7) 리포지토리 — F-604/REQ-073 데이터 내보내기 (다운로드)
// (P-402 원본 'download' 리포지토리를 모먼토 도메인으로 매핑: download -> export job)
// 지금은 목업 구현이며, 함수 시그니처는 실습6에서 Supabase SDK 쿼리로 교체될 때 동일하게 유지됩니다.

export interface ExportJobRow {
  id: string;
  group_id: string;
  requested_by: string;
  format: 'zip' | 'pdf';
  status: 'pending' | 'processing' | 'done' | 'failed';
  result_url: string | null;
  created_at: string;
}

const mockExportJobs: ExportJobRow[] = [];

// POST /api/groups/{gid}/export (owner 전용, 202 Accepted)
export async function createExportJob(input: {
  groupId: string;
  requestedBy: string;
  format: ExportJobRow['format'];
}): Promise<ExportJobRow> {
  const job: ExportJobRow = {
    id: `job-${String(mockExportJobs.length + 1).padStart(3, '0')}`,
    group_id: input.groupId,
    requested_by: input.requestedBy,
    format: input.format,
    status: 'pending',
    result_url: null,
    created_at: new Date().toISOString(),
  };
  mockExportJobs.push(job);
  return job;
}

// GET /api/jobs/{job_id} (status_url)
export async function getExportJobById(jobId: string): Promise<ExportJobRow | null> {
  return mockExportJobs.find((j) => j.id === jobId) ?? null;
}

export async function listExportJobsByGroupId(groupId: string): Promise<ExportJobRow[]> {
  return mockExportJobs.filter((j) => j.group_id === groupId);
}
