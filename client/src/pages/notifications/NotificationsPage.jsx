import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sprout,
  ScanSearch,
  CloudSun,
  Clock
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'weather_alert':
        return <CloudSun className="w-5 h-5 text-blue-600" />;
      case 'disease_alert':
        return <ScanSearch className="w-5 h-5 text-amber-600" />;
      case 'advisory':
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-agri-700" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Farming Alerts & Notifications"
        subtitle="Real-time agricultural telemetry, weather cautions, and completed advisory reports"
        badge={
          unreadCount > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
              {unreadCount} Unread
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              All caught up
            </span>
          )
        }
      />

      {loading ? (
        <LoadingState message="Loading your farming notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="You will receive real-time notifications when crop advisories are ready or severe weather conditions are detected."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-surface-border shadow-xs divide-y divide-surface-border overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.is_read ? 'bg-white hover:bg-surface-hover/50' : 'bg-agri-50/40 hover:bg-agri-50/70'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-surface-border flex items-center justify-center shrink-0 shadow-xs">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs ${notif.is_read ? 'font-semibold text-text-main' : 'font-extrabold text-agri-950'}`}>
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-light shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.created_at).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-agri-600 shrink-0 mt-1.5" title="Unread" />
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
