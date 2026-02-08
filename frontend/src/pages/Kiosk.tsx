import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, UserCheck, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const Kiosk = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getLocation = (): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (locationInput.trim()) {
                resolve(locationInput.trim());
                return;
            }
            if (!navigator.geolocation) {
                resolve(undefined);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    resolve(undefined);
                },
                { timeout: 5000 }
            );
        });
    };

    const handleClockIn = async () => {
        try {
            const location = await getLocation();
            await api.post('/attendance/clock-in', { identifier: employeeId, location });
            setStatus('success');
            setMessage(`Welcome, ${employeeId}! Clocked IN at ${format(new Date(), 'HH:mm')}`);
            setTimeout(() => setStatus('idle'), 3000);
            setEmployeeId('');
            setLocationInput('');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Error clocking in');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleClockOut = async () => {
        try {
            const location = await getLocation();
            const res = await api.post('/attendance/clock-out', { identifier: employeeId, location });
            setStatus('success');
            const hours = res.data.totalHours ? res.data.totalHours.toFixed(2) : 0;
            setMessage(`Goodbye! Clocked OUT. Total hours: ${hours}`);
            setTimeout(() => setStatus('idle'), 3000);
            setEmployeeId('');
            setLocationInput('');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Error clocking out');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Particles (Simplified for now) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="z-10 text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md"
                >
                    <div className="flex justify-center mb-6">
                        <Clock className="w-16 h-16 text-blue-400" />
                    </div>

                    <h1 className="text-4xl font-bold mb-2 tracking-tight">
                        {format(currentTime, 'HH:mm:ss')}
                    </h1>
                    <p className="text-slate-400 mb-8">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="Enter Employee ID"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />

                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                placeholder="Location (Optional)"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleClockIn}
                                disabled={!employeeId}
                                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Clock In
                            </button>
                            <button
                                onClick={handleClockOut}
                                disabled={!employeeId}
                                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Clock Out
                            </button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {status !== 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`p-4 rounded-lg backdrop-blur-md border ${status === 'success'
                                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                : 'bg-red-500/20 border-red-500/50 text-red-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5" />
                                <span className="font-medium">{message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Kiosk;
