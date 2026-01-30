import { useTranslation } from 'react-i18next';
import { useDashboard } from '../hooks/useDashboard';
import { Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { formatDate, getDaysRemainingClass, getDaysRemainingText } from '../utils/formatters';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('dashboard.totalClients'),
      value: stats?.overview?.totalClients || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: t('dashboard.itpExpired'),
      value: stats?.overview?.expiredCount || 0,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: t('dashboard.expiresIn7Days'),
      value: stats?.overview?.expiringSoonCount || 0,
      icon: Clock,
      color: 'yellow',
    },
    {
      title: t('dashboard.notificationsToday'),
      value: stats?.notifications?.sentToday || 0,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            red: 'bg-red-100 text-red-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            green: 'bg-green-100 text-green-600',
          };

          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Expirations */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.upcomingExpirations')}
        </h2>

        {stats?.upcomingExpirations?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {t('dashboard.noUpcomingExpirations')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">{t('dashboard.client')}</th>
                  <th className="table-header-cell">{t('dashboard.licensePlate')}</th>
                  <th className="table-header-cell">{t('dashboard.expirationDate')}</th>
                  <th className="table-header-cell">{t('dashboard.daysRemaining')}</th>
                  <th className="table-header-cell">{t('dashboard.contact')}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {stats?.upcomingExpirations?.map((client) => (
                  <tr key={client.id}>
                    <td className="table-cell font-medium">{client.name}</td>
                    <td className="table-cell">
                      <span className="font-mono">{client.licensePlate}</span>
                    </td>
                    <td className="table-cell">{formatDate(client.itpExpirationDate)}</td>
                    <td className="table-cell">
                      <span className={`badge ${getDaysRemainingClass(client.daysRemaining)}`}>
                        {getDaysRemainingText(client.daysRemaining, t)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div>{client.phoneNumber}</div>
                        <div className="text-gray-500">{client.email}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Clients */}
      {stats?.recentClients?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.recentlyAddedClients')}
          </h2>
          <div className="space-y-3">
            {stats.recentClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{client.licensePlate}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {formatDate(client.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
