import axios from 'axios';

async function fullTest() {
    try {
        const client = axios.create({ baseURL: 'http://localhost:3000', withCredentials: true });

        // 1. Login
        console.log("Logging in...");
        const loginRes = await client.post('/api/auth/login', {
            email: 'xitiz@gandu.com',
            password: 'gandu123'
        });
        const cookie = loginRes.headers['set-cookie']?.join('; ') || '';

        // 2. Fetch stats before
        console.log("Fetching stats (Before)...");
        const statsBefore = await client.get('/api/reports/dashboard-stats', {
            headers: { Cookie: cookie }
        });

        const emp006Before = statsBefore.data.dailyDetails.find((d: any) => d.employeeId === 'EMP006');
        console.log("EMP006 Before:", emp006Before);

        // 3. Update to a new random time
        console.log("Patching...");
        const newClockIn = "05:05";
        const patchRes = await client.patch('/api/admin/attendance', {
            employeeId: 'EMP006',
            date: '2026-02-22',
            clockIn: newClockIn,
            clockOut: '17:00',
            reason: 'Testing full flow',
            location: 'Office'
        }, {
            headers: { Cookie: cookie }
        });
        console.log("Patch Success ID:", patchRes.data.id);

        // 4. Fetch stats after
        console.log("Fetching stats (After)...");
        const statsAfter = await client.get('/api/reports/dashboard-stats', {
            headers: { Cookie: cookie }
        });
        const emp006After = statsAfter.data.dailyDetails.find((d: any) => d.employeeId === 'EMP006');
        console.log("EMP006 After:", emp006After);

    } catch (e: any) {
        console.error("Test Failed:", e.response?.data || e.message);
    }
}

fullTest();
