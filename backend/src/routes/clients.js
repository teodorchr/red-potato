import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getExpiringClients,
} from '../controllers/clientController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate, validateUUID } from '../middlewares/validation.js';
import { clientSchema, clientUpdateSchema } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/clients/expiring - Get clients with ITP expiring soon
router.get('/expiring', getExpiringClients);

// GET /api/clients - Get list of all clients
router.get('/', getClients);

// GET /api/clients/:id - Get a client by ID
router.get('/:id', validateUUID('id'), getClientById);

// POST /api/clients - Create new client
router.post('/', validate(clientSchema), createClient);

// PUT /api/clients/:id - Update client
router.put('/:id', validateUUID('id'), validate(clientUpdateSchema), updateClient);

// DELETE /api/clients/:id - Delete client (soft delete)
router.delete('/:id', validateUUID('id'), deleteClient);

export default router;
