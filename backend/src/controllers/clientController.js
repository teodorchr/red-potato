import prisma from '../config/database.js';
import { getDaysDifference } from '../utils/helpers.js';
import config from '../config/env.js';

/**
 * Get list of all clients
 * GET /api/clients
 */
export const getClients = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'dataExpirareItp',
      sortOrder = 'asc',
      activ = 'true',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search conditions
    const where = {
      activ: activ === 'true',
      ...(search && {
        OR: [
          { nume: { contains: search, mode: 'insensitive' } },
          { numarInmatriculare: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { numarTelefon: { contains: search } },
        ],
      }),
    };

    // Count total records
    const total = await prisma.client.count({ where });

    // Get clients
    const clients = await prisma.client.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
    });

    // Calculate days remaining for each client
    const clientsWithDaysRemaining = clients.map((client) => ({
      ...client,
      daysRemaining: Math.ceil(
        (new Date(client.dataExpirareItp) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json({
      success: true,
      data: {
        clients: clientsWithDaysRemaining,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a client by ID
 * GET /api/clients/:id
 */
export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        notifications: {
          orderBy: { dataTrimitere: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Add days remaining
    const daysRemaining = Math.ceil(
      (new Date(client.dataExpirareItp) - new Date()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      success: true,
      data: {
        ...client,
        daysRemaining,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new client
 * POST /api/clients
 */
export const createClient = async (req, res, next) => {
  try {
    const { nume, numarInmatriculare, numarTelefon, email, dataExpirareItp } = req.body;

    const client = await prisma.client.create({
      data: {
        nume,
        numarInmatriculare: numarInmatriculare.toUpperCase(),
        numarTelefon,
        email,
        dataExpirareItp: new Date(dataExpirareItp),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client
 * PUT /api/clients/:id
 */
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nume, numarInmatriculare, numarTelefon, email, dataExpirareItp, activ } = req.body;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({ where: { id } });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Build update object
    const updateData = {};
    if (nume !== undefined) updateData.nume = nume;
    if (numarInmatriculare !== undefined)
      updateData.numarInmatriculare = numarInmatriculare.toUpperCase();
    if (numarTelefon !== undefined) updateData.numarTelefon = numarTelefon;
    if (email !== undefined) updateData.email = email;
    if (dataExpirareItp !== undefined)
      updateData.dataExpirareItp = new Date(dataExpirareItp);
    if (activ !== undefined) updateData.activ = activ;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete client (soft delete)
 * DELETE /api/clients/:id
 */
export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({ where: { id } });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Soft delete
    await prisma.client.update({
      where: { id },
      data: { activ: false },
    });

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get clients with ITP expiring in the next N days
 * GET /api/clients/expiring
 */
export const getExpiringClients = async (req, res, next) => {
  try {
    const { days = config.cron.itpReminderDays } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    futureDate.setHours(23, 59, 59, 999);

    const clients = await prisma.client.findMany({
      where: {
        activ: true,
        dataExpirareItp: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { dataExpirareItp: 'asc' },
    });

    // Add days remaining for each client
    const clientsWithDaysRemaining = clients.map((client) => ({
      ...client,
      daysRemaining: Math.ceil(
        (new Date(client.dataExpirareItp) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json({
      success: true,
      data: {
        clients: clientsWithDaysRemaining,
        count: clientsWithDaysRemaining.length,
        days: parseInt(days),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getExpiringClients,
};
