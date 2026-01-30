import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClients } from '../hooks/useClients';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { formatDate, getDaysRemainingClass, getDaysRemainingText } from '../utils/formatters';

export const Clients = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clients, loading, pagination, setPage, setSearch, deleteClient } = useClients();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(t('clients.deleteConfirm', { name }))) {
      await deleteClient(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('clients.title')}</h1>
        <Button onClick={() => navigate('/clients/new')}>
          <Plus className="w-4 h-4 mr-2" />
          {t('clients.addClient')}
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="card">
        <div className="flex gap-4">
          <Input
            placeholder={t('clients.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="w-4 h-4 mr-2" />
            {t('common.search')}
          </Button>
        </div>
      </form>

      {/* Clients Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('clients.noClients')}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">{t('clients.name')}</th>
                    <th className="table-header-cell">{t('clients.licensePlate')}</th>
                    <th className="table-header-cell">{t('clients.phone')}</th>
                    <th className="table-header-cell">{t('clients.email')}</th>
                    <th className="table-header-cell">{t('clients.itpExpirationDate')}</th>
                    <th className="table-header-cell">{t('clients.daysRemaining')}</th>
                    <th className="table-header-cell">{t('clients.actions')}</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="table-cell font-medium">{client.name}</td>
                      <td className="table-cell">
                        <span className="font-mono">{client.licensePlate}</span>
                      </td>
                      <td className="table-cell">{client.phoneNumber}</td>
                      <td className="table-cell text-sm">{client.email}</td>
                      <td className="table-cell">{formatDate(client.itpExpirationDate)}</td>
                      <td className="table-cell">
                        <span className={`badge ${getDaysRemainingClass(client.daysRemaining)}`}>
                          {getDaysRemainingText(client.daysRemaining, t)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id, client.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-700">
                  {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages} ({pagination.total} {t('common.clients')})
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Clients;
