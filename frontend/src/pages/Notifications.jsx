import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { formatDateTime, formatNotificationStatus, getNotificationStatusClass, formatNotificationType } from '../utils/formatters';
import { Filter } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tip: '', status: '' });

  useEffect(() => {
    fetchData();
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
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600">Total Notifications</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Sent Successfully</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.byStatus.sent}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.byStatus.failed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">SMS / Email</p>
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
            value={filter.tip}
            onChange={(e) => handleFilterChange('tip', e.target.value)}
            className="input w-48"
          >
            <option value="">All types</option>
            <option value="SMS">SMS</option>
            <option value="EMAIL">Email</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input w-48"
          >
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Client</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Message</th>
                  <th className="table-header-cell">Send Date</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{notification.client.nume}</div>
                        <div className="text-sm text-gray-500 font-mono">
                          {notification.client.numarInmatriculare}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-info">
                        {formatNotificationType(notification.tip)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getNotificationStatusClass(notification.status)}`}>
                        {formatNotificationStatus(notification.status)}
                      </span>
                    </td>
                    <td className="table-cell max-w-md truncate">{notification.mesaj}</td>
                    <td className="table-cell whitespace-nowrap">
                      {formatDateTime(notification.dataTrimitere)}
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
