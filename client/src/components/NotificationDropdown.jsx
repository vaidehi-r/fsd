import { format } from 'date-fns';
import { HiBell, HiCheckCircle } from 'react-icons/hi';
import useNotificationStore from '../stores/notificationStore';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAllRead, markOneRead } = useNotificationStore();

  const typeIcons = {
    booking_confirmed: '✅',
    booking_cancelled: '❌',
    new_booking: '📦',
    owner_approved: '🎉',
    owner_rejected: '😔',
    review_received: '⭐',
    report_resolved: '🔍',
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-slide-down max-h-[28rem] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
        <button onClick={markAllRead}
          className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
          <HiCheckCircle className="text-sm" /> Mark all read
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <HiBell className="text-4xl text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notif) => (
            <button
              key={notif._id}
              onClick={() => { markOneRead(notif._id); }}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                !notif.isRead ? 'bg-primary-50/50' : ''
              }`}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[notif.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!notif.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
