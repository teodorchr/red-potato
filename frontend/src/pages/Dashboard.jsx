import { useDashboard } from '../hooks/useDashboard';
import { Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { formatDate, getDaysRemainingClass, getDaysRemainingText } from '../utils/formatters';

export const Dashboard = () => {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.overview?.totalClients || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'ITP Expired',
      value: stats?.overview?.expiredCount || 0,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Expires in 7 days',
      value: stats?.overview?.expiringSoonCount || 0,
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'Notifications today',
      value: stats?.notifications?.sentToday || 0,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

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
          Upcoming Expirations (next 7 days)
        </h2>

        {stats?.upcomingExpirations?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No ITPs expiring in the next 7 days
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Client</th>
                  <th className="table-header-cell">License Plate</th>
                  <th className="table-header-cell">Expiration Date</th>
                  <th className="table-header-cell">Days Remaining</th>
                  <th className="table-header-cell">Contact</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {stats?.upcomingExpirations?.map((client) => (
                  <tr key={client.id}>
                    <td className="table-cell font-medium">{client.nume}</td>
                    <td className="table-cell">
                      <span className="font-mono">{client.numarInmatriculare}</span>
                    </td>
                    <td className="table-cell">{formatDate(client.dataExpirareItp)}</td>
                    <td className="table-cell">
                      <span className={`badge ${getDaysRemainingClass(client.daysRemaining)}`}>
                        {getDaysRemainingText(client.daysRemaining)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div>{client.numarTelefon}</div>
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
            Recently Added Clients
          </h2>
          <div className="space-y-3">
            {stats.recentClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{client.nume}</p>
                  <p className="text-sm text-gray-500 font-mono">{client.numarInmatriculare}</p>
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
