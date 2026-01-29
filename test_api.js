
const testClient = {
    name: 'Test Client',
    licensePlate: 'B123TST',
    phoneNumber: '+40722123456',
    email: 'test@example.com',
    itpExpirationDate: '2026-12-31'
};

async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        const loginData = await loginRes.json();
        if (!loginData.success) {
            throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        }
        const token = loginData.data.token;
        console.log('Login successful');

        // 2. Create Client
        console.log('Creating client...');
        const response = await fetch('http://localhost:3000/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testClient)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
