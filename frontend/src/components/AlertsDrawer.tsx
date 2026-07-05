import React, { useEffect, useState, useRef } from 'react';
import { Patient } from '../types';
import { Bell, AlertTriangle, X, ChevronRight, Activity, Heart, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AlertsDrawerProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
}

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'hr' | 'bp' | 'spo2' | 'temp';
  message: string;
  value: string | number;
  timestamp: Date;
  read: boolean;
}

export default function AlertsDrawer({ patients, onSelectPatient }: AlertsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const prevPatientsRef = useRef<Record<string, Patient>>({});
  const alertsRef = useRef<Alert[]>([]);

  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    
    patients.forEach(patient => {
      const prev = prevPatientsRef.current[patient.id];
      if (!prev) return; // Skip first render
      
      const checkThreshold = (
        type: Alert['type'], 
        currentVal: number | string, 
        prevVal: number | string, 
        condition: boolean, 
        message: string
      ) => {
        // Only alert if condition is met AND it wasn't met previously (edge trigger)
        if (condition && currentVal !== prevVal) {
          // Additional check to ensure we don't spam the exact same alert if it's already active
          const isAlreadyAlerting = alertsRef.current.some(a => a.patientId === patient.id && a.type === type && !a.read);
          
          if (!isAlreadyAlerting) {
            const alertId = Math.random().toString(36).substring(2, 9);
            const newAlert: Alert = {
              id: alertId,
              patientId: patient.id,
              patientName: patient.name,
              type,
              message,
              value: currentVal,
              timestamp: new Date(),
              read: false
            };
            newAlerts.push(newAlert);
            
            // Trigger toast (Disabled by user request)
            // toast.error(`Critical Alert: ${patient.name}`, {
            //   description: message,
            //   action: {
            //     label: 'View',
            //     onClick: () => {
            //       onSelectPatient(patient.id);
            //       setIsOpen(true);
            //     }
            //   },
            //   icon: <AlertTriangle className="w-5 h-5 text-red-500" />
            // });
          }
        }
      };

      // HR Check
      checkThreshold(
        'hr', 
        patient.vitals.hr, 
        prev.vitals.hr, 
        patient.vitals.hr < 60 || patient.vitals.hr > 100, 
        `Abnormal Heart Rate: ${patient.vitals.hr} bpm`
      );

      // SpO2 Check
      checkThreshold(
        'spo2', 
        patient.vitals.spo2, 
        prev.vitals.spo2, 
        patient.vitals.spo2 < 95, 
        `Low SpO2: ${patient.vitals.spo2}%`
      );

      // BP Check
      const sys = parseInt(patient.vitals.bp.split('/')[0]) || 120;
      const dia = parseInt(patient.vitals.bp.split('/')[1]) || 80;
      checkThreshold(
        'bp', 
        patient.vitals.bp, 
        prev.vitals.bp, 
        sys > 130 || sys < 90 || dia > 85 || dia < 60, 
        `Abnormal Blood Pressure: ${patient.vitals.bp} mmHg`
      );
      
      // Temp Check
      checkThreshold(
        'temp', 
        patient.vitals.temp, 
        prev.vitals.temp, 
        patient.vitals.temp > 38.0 || patient.vitals.temp < 36.0, 
        `Abnormal Temperature: ${patient.vitals.temp}°C`
      );
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50
    }

    // Update prev state
    const newPrev: Record<string, Patient> = {};
    patients.forEach(p => newPrev[p.id] = p);
    prevPatientsRef.current = newPrev;

  }, [patients]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleAlertClick = (alert: Alert) => {
    markRead(alert.id);
    onSelectPatient(alert.patientId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'hr': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'spo2': return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'bp': return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 border border-slate-700 rounded-full shadow-2xl shadow-slate-950/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors z-40"
      >
        <div className="relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900">
              {unreadCount}
            </span>
          )}
        </div>
      </motion.button>

      {/* Persistent Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-80 h-screen bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-200">Clinical Alerts</h3>
                {unreadCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {alerts.length > 0 && unreadCount > 0 && (
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-end">
                <button 
                  onClick={markAllRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm space-y-3">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <AnimatePresence>
                  {alerts.map(alert => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleAlertClick(alert)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        alert.read 
                          ? 'bg-slate-950/50 border-slate-800/50 opacity-60' 
                          : 'bg-red-950/20 border-red-500/30 hover:bg-red-950/40 hover:border-red-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${alert.read ? 'bg-slate-900' : 'bg-red-950/50'}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${alert.read ? 'text-slate-400' : 'text-slate-200'}`}>
                              {alert.patientName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {!alert.read && (
                          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-xs ${alert.read ? 'text-slate-500' : 'text-rose-400/90 font-medium'}`}>
                          {alert.message}
                        </p>
                        <ChevronRight className={`w-4 h-4 ${alert.read ? 'text-slate-600' : 'text-slate-400'}`} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
