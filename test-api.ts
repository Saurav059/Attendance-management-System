import axios from 'axios';

async function testApi() {
    try {
        const client = axios.create({ baseURL: 'http://localhost:3000', withCredentials: true });

        // Login
        const loginRes = await client.post('/api/auth/login', {
            email: 'xitiz@gandu.com',
            password: 'gandu123'
        });

        const cookie = loginRes.headers['set-cookie']?.join('; ') || '';

        // Try doing the PATCH
        const patchRes = await client.patch('/api/admin/attendance', {
            employeeId: 'EMP006',
            date: '2026-02-22',
            clockIn: '08:00',
            clockOut: '17:00',
            reason: 'Testing from script',
            location: 'Office'
        }, {
            headers: { Cookie: cookie }
        });

        console.log("Patch Success:", patchRes.data);
    } catch (e: any) {
        console.error("Patch Failed:", e.response?.data || e.message);
    }
}

testApi();
