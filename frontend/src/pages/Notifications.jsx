import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import notificationService from '../services/notificationService';
import { formatDateTime, formatNotificationStatus, getNotificationStatusClass, formatNotificationType } from '../utils/formatters';
import { Filter } from 'lucide-react';

export const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifData, statsData] = await Promise.all([
        notificationService.getNotifications({ limit: 50, ...filter }),
        notificationService.getStats(),
      ]);
      setNotifications(notifData.notifications);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600">{t('notifications.totalNotifications')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">{t('notifications.sentSuccessfully')}</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.byStatus.sent}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">{t('notifications.failed')}</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.byStatus.failed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">{t('notifications.smsEmail')}</p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              {stats.byType.sms} / {stats.byType.email}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="input w-48"
          >
            <option value="">{t('notifications.allTypes')}</option>
            <option value="SMS">{t('notifications.sms')}</option>
            <option value="EMAIL">{t('notifications.email')}</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input w-48"
          >
            <option value="">{t('notifications.allStatuses')}</option>
            <option value="sent">{t('notifications.sent')}</option>
            <option value="failed">{t('notifications.failed')}</option>
            <option value="pending">{t('notifications.pending')}</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('notifications.noNotifications')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">{t('notifications.client')}</th>
                  <th className="table-header-cell">{t('notifications.type')}</th>
                  <th className="table-header-cell">{t('notifications.status')}</th>
                  <th className="table-header-cell">{t('notifications.message')}</th>
                  <th className="table-header-cell">{t('notifications.sendDate')}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{notification.client.name}</div>
                        <div className="text-sm text-gray-500 font-mono">
                          {notification.client.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-info">
                        {formatNotificationType(notification.type, t)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getNotificationStatusClass(notification.status)}`}>
                        {formatNotificationStatus(notification.status, t)}
                      </span>
                    </td>
                    <td className="table-cell max-w-md truncate">{notification.message}</td>
                    <td className="table-cell whitespace-nowrap">
                      {formatDateTime(notification.sentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
