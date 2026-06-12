import { TopBar } from '@/components/layout/top-bar';
import { NotificationList } from '@/components/notification/notification-list';
import { getNotifications } from '@/lib/data';

// SCR-ID: S-NOTIFY-CENTER — 화면설계서 §8.1 (/notifications), GET /api/notifications
// 서버 컴포넌트가 알림 목록을 가져오고, 읽음/삭제/딥링크 인터랙션은 클라이언트 leaf(NotificationList)에 위임.
export default async function NotificationsPage() {
  const items = await getNotifications();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <TopBar title="알림" backHref="/home" />
      <NotificationList initialItems={items} />
    </main>
  );
}
