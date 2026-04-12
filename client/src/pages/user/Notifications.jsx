import { useEffect } from 'react';
import { format } from 'date-fns';
import { HiBell } from 'react-icons/hi';
import useNotificationStore from '../../stores/notificationStore';
import PageHeader from '../../components/PageHeader';

const Notifications = () => {
  const { notifications, fetchNotifications, markAllRead, markOneRead } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  const typeIcons = { booking_confirmed: '✅', booking_cancelled: '❌', new_booking: '📦', owner_approved: '🎉', owner_rejected: '😔', review_received: '⭐', report_resolved: '🔍' };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Notifications"
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Notifications' }]}
        actions={<button onClick={markAllRead} className="btn-secondary text-sm">Mark All Read</button>}
      />
      {notifications.length === 0 ? (
        <div className="card p-16 text-center"><HiBell className="text-5xl text-gray-200 mx-auto mb-3"/><p className="text-slate-400">No notifications yet</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button key={n._id} onClick={() => markOneRead(n._id)}
              className={`w-full card p-4 flex items-start gap-3 text-left transition-colors ${!n.isRead ? 'bg-primary-50/50 border-primary-100' : ''}`}>
              <span className="text-2xl">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1">
                <p className={`text-sm ${!n.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}</p>
              </div>
              {!n.isRead && <span className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default Notifications;
