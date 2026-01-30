/**
 * API Test Script
 *
 * Usage:
 *   TEST_USERNAME=admin TEST_PASSWORD=yourpassword node test_api.js
 *
 * Environment variables:
 *   TEST_USERNAME - Username for authentication (required)
 *   TEST_PASSWORD - Password for authentication (required)
 *   API_URL - Backend API URL (default: http://localhost:3000)
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

if (!TEST_USERNAME || !TEST_PASSWORD) {
    console.error('Error: TEST_USERNAME and TEST_PASSWORD environment variables are required.');
    console.error('Usage: TEST_USERNAME=admin TEST_PASSWORD=yourpassword node test_api.js');
    process.exit(1);
}

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
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD })
        });

        const loginData = await loginRes.json();
        if (!loginData.success) {
            throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        }
        const token = loginData.data.token;
        console.log('Login successful');

        // 2. Create Client
        console.log('Creating client...');
        const response = await fetch(`${API_URL}/api/clients`, {
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
