import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import clientService from '../services/clientService';
import { validateClientForm, normalizePlateNumber, normalizePhoneNumber } from '../utils/validators';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export const ClientForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    phoneNumber: '',
    email: '',
    itpExpirationDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadClient = async () => {
    try {
      const client = await clientService.getClientById(id);
      setFormData({
        name: client.name,
        licensePlate: client.licensePlate,
        phoneNumber: client.phoneNumber,
        email: client.email,
        itpExpirationDate: client.itpExpirationDate.split('T')[0],
      });
    } catch {
      toast.error(t('clients.errorLoading'));
      navigate('/clients');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateClientForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const submitData = {
      ...formData,
      licensePlate: normalizePlateNumber(formData.licensePlate),
      phoneNumber: normalizePhoneNumber(formData.phoneNumber),
    };

    setLoading(true);

    try {
      if (isEdit) {
        await clientService.updateClient(id, submitData);
        toast.success(t('clients.clientUpdated'));
      } else {
        await clientService.createClient(submitData);
        toast.success(t('clients.clientAdded'));
      }
      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.response?.data) {
        console.error('Validation details:', error.response.data);
      }
      const errorMessage = error.response?.data?.message || t('clients.errorSaving');
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('clients.editClient') : t('clients.newClient')}
        </h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('clients.name')}
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder={t('clients.namePlaceholder')}
          />

          <Input
            label={t('clients.licensePlateNumber')}
            name="licensePlate"
            required
            value={formData.licensePlate}
            onChange={handleChange}
            error={errors.licensePlate}
            placeholder={t('clients.licensePlatePlaceholder')}
            className="uppercase"
          />

          <Input
            label={t('clients.phone')}
            name="phoneNumber"
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            placeholder={t('clients.phonePlaceholder')}
          />

          <Input
            label={t('clients.email')}
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder={t('clients.emailPlaceholder')}
          />

          <Input
            label={t('clients.itpExpirationDate')}
            name="itpExpirationDate"
            type="date"
            required
            value={formData.itpExpirationDate}
            onChange={handleChange}
            error={errors.itpExpirationDate}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? t('clients.saving') : isEdit ? t('clients.update') : t('clients.addClient')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/clients')}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
