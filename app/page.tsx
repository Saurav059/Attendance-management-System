'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, UserCheck, MapPin, Settings, User } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function KioskPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocation = (): string | undefined => {
    return locationInput.trim() || undefined;
  };

  const handleClockIn = async () => {
    try {
      const location = getLocation();
      await axios.post('/api/attendance/clock-in', { identifier: employeeId, location });
      setStatus('success');
      setMessage(`Welcome, ${employeeId}! Clocked IN at ${format(new Date(), 'hh:mm a')}`);
      setTimeout(() => setStatus('idle'), 5000);
      setEmployeeId('');
      setLocationInput('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Error clocking in');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleClockOut = async () => {
    try {
      const location = getLocation();
      const res = await axios.post('/api/attendance/clock-out', { identifier: employeeId, location });
      setStatus('success');
      const hours = typeof res.data.totalHours === 'number' ? res.data.totalHours.toFixed(2) : '0.00';
      setMessage(`Goodbye! Clocked OUT. Total hours: ${hours}h`);
      setTimeout(() => setStatus('idle'), 5000);
      setEmployeeId('');
      setLocationInput('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Error clocking out');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient text-white flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>

      <div className="z-10 text-center space-y-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-card p-10 rounded-[2.5rem] relative group"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-50"></div>
            <Clock className="w-20 h-20 text-blue-400 relative z-10" strokeWidth={1.5} />
          </div>

          <div className="space-y-2 mb-10">
            <h1 className="text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              {format(currentTime, 'hh:mm:ss')}
              <span className="text-2xl ml-2 font-medium bg-clip-text text-white/40 uppercase">
                {format(currentTime, 'a')}
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium tracking-wide">
              {format(currentTime, 'EEEE, MMMM do')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="group/input relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter Employee ID"
                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-left text-2xl font-bold tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 placeholder:tracking-normal group-hover/input:border-white/20"
              />
            </div>

            <div className="group/input relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Work Location (Optional)"
                className="w-full bg-slate-900/40 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-left text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 group-hover/input:border-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockIn}
                disabled={!employeeId}
                className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-blue-900/20 group/btn"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                Clock In
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockOut}
                disabled={!employeeId}
                className="relative overflow-hidden bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all group/btn"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                Clock Out
              </motion.button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`p-6 rounded-[1.5rem] glass-card border-t-2 ${status === 'success'
                ? 'border-green-500/50 text-green-100 shadow-green-900/20'
                : 'border-rose-500/50 text-rose-100 shadow-rose-900/20'
                }`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`p-2 rounded-full ${status === 'success' ? 'bg-green-500/20' : 'bg-rose-500/20'}`}>
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold">{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center"
        >
          <Link
            href="/login"
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-sm font-medium border border-white/5"
          >
            <Settings className="w-4 h-4" />
            Admin Login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
