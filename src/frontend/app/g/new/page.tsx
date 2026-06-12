import { TopBar } from '@/components/layout/top-bar';
import { GroupNewForm } from '@/components/group/group-new-form';

// SCR-ID: S-GROUP-NEW — 화면설계서 §4.1 (/g/new), POST /api/groups
// 서버 컴포넌트 셸 + 폼 입력은 클라이언트 leaf(GroupNewForm)로 분리.
export default function GroupNewPage() {
  return (
    <main className="min-h-screen bg-background">
      <TopBar title="새 그룹 만들기" backHref="/home" />
      <GroupNewForm />
    </main>
  );
}
