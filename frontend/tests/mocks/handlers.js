import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { username, password } = await request.json();
    if (username === 'admin' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: { id: '1', username: 'admin', email: 'admin@test.com', rol: 'admin' },
        },
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: { id: '1', username: 'admin', email: 'admin@test.com', rol: 'admin' },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Client handlers
  http.get(`${API_URL}/clients`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      success: true,
      data: {
        clients: [
          {
            id: '1',
            name: 'Test Client',
            licensePlate: 'B-123-ABC',
            phoneNumber: '+40722000001',
            email: 'client1@test.com',
            itpExpirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: 5,
            active: true,
          },
          {
            id: '2',
            name: 'Another Client',
            licensePlate: 'CJ-456-XYZ',
            phoneNumber: '+40722000002',
            email: 'client2@test.com',
            itpExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: 30,
            active: true,
          },
        ],
        pagination: { page, limit, total: 2, totalPages: 1 },
      },
    });
  }),

  http.get(`${API_URL}/clients/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Test Client',
        licensePlate: 'B-123-ABC',
        phoneNumber: '+40722000001',
        email: 'client1@test.com',
        itpExpirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Test notes',
        active: true,
        notifications: [],
      },
    });
  }),

  http.post(`${API_URL}/clients`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: 'new-id', ...data },
    }, { status: 201 });
  }),

  http.put(`${API_URL}/clients/:id`, async ({ params, request }) => {
    const data = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...data },
    });
  }),

  http.delete(`${API_URL}/clients/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_URL}/clients/expiring`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Expiring Client',
          licensePlate: 'B-999-EXP',
          itpExpirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 3,
        },
      ],
    });
  }),

  // Dashboard handlers
  http.get(`${API_URL}/dashboard/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalClients: 100,
        activeClients: 95,
        expiringThisWeek: 5,
        expiringThisMonth: 20,
        expiredClients: 3,
        notificationsSentToday: 10,
        notificationsSentThisMonth: 150,
        upcomingExpirations: [
          { id: '1', name: 'Client 1', licensePlate: 'B-111-AAA', daysRemaining: 2 },
          { id: '2', name: 'Client 2', licensePlate: 'B-222-BBB', daysRemaining: 5 },
        ],
        recentClients: [
          { id: '3', name: 'New Client', licensePlate: 'B-333-CCC', createdAt: new Date().toISOString() },
        ],
      },
    });
  }),

  // Notification handlers
  http.get(`${API_URL}/notifications`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        notifications: [
          {
            id: '1',
            type: 'SMS',
            status: 'SENT',
            createdAt: new Date().toISOString(),
            client: { name: 'Test Client', licensePlate: 'B-123-ABC' },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });
  }),

  http.get(`${API_URL}/notifications/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total: 100,
        sent: 90,
        failed: 5,
        pending: 5,
        byType: { SMS: 60, EMAIL: 40 },
      },
    });
  }),

  http.post(`${API_URL}/notifications/test`, () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Test notification sent' },
    });
  }),
];
