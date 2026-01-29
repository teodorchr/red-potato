import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import clientService from '../services/clientService';
import { validateClientForm, normalizePlateNumber, normalizePhoneNumber } from '../utils/validators';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nume: '',
    numarInmatriculare: '',
    numarTelefon: '',
    email: '',
    dataExpirareItp: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const client = await clientService.getClientById(id);
      setFormData({
        nume: client.nume,
        numarInmatriculare: client.numarInmatriculare,
        numarTelefon: client.numarTelefon,
        email: client.email,
        dataExpirareItp: client.dataExpirareItp.split('T')[0],
      });
    } catch (error) {
      toast.error('Error loading client');
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
      numarInmatriculare: normalizePlateNumber(formData.numarInmatriculare),
      numarTelefon: normalizePhoneNumber(formData.numarTelefon),
    };

    setLoading(true);

    try {
      if (isEdit) {
        await clientService.updateClient(id, submitData);
        toast.success('Client updated successfully');
      } else {
        await clientService.createClient(submitData);
        toast.success('Client added successfully');
      }
      navigate('/clients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving');
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
          {isEdit ? 'Edit Client' : 'New Client'}
        </h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            name="nume"
            required
            value={formData.nume}
            onChange={handleChange}
            error={errors.nume}
            placeholder="John Doe"
          />

          <Input
            label="License Plate Number"
            name="numarInmatriculare"
            required
            value={formData.numarInmatriculare}
            onChange={handleChange}
            error={errors.numarInmatriculare}
            placeholder="B-123-ABC"
            className="uppercase"
          />

          <Input
            label="Phone Number"
            name="numarTelefon"
            type="tel"
            required
            value={formData.numarTelefon}
            onChange={handleChange}
            error={errors.numarTelefon}
            placeholder="+40722123456 or 0722123456"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john.doe@example.com"
          />

          <Input
            label="ITP Expiration Date"
            name="dataExpirareItp"
            type="date"
            required
            value={formData.dataExpirareItp}
            onChange={handleChange}
            error={errors.dataExpirareItp}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Client'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/clients')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
