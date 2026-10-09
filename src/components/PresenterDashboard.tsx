'use client';

import React, { useState, useEffect } from 'react';
import { SessionData, LevelId } from '@/lib/types';
import { Header } from './Header';
import { Nivel0Presenter } from './Nivel0Presenter';
import { Nivel1Presenter } from './Nivel1Presenter';
import { Nivel2Presenter } from './Nivel2Presenter';
import { Nivel3Presenter } from './Nivel3Presenter';
import { Nivel4Presenter } from './Nivel4Presenter';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Layers, Users, RefreshCw, Sparkles, Monitor } from 'lucide-react';

interface PresenterDashboardProps {
  initialPin?: string;
}

export const PresenterDashboard: React.FC<PresenterDashboardProps> = ({
  initialPin = 'IA-2026'
}) => {
  const [pin, setPin] = useState<string>(initialPin);
  const [session, setSession] = useState<SessionData | null>(null);
  const [activeLevel, setActiveLevel] = useState<LevelId>(0);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [joinUrl, setJoinUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?pin=${pin}`;
      setJoinUrl(url);
    }
  }, [pin]);

  // Short-polling session endpoint every 1.5s
  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/session?pin=${pin}`, { cache: 'no-store' });
        if (res.ok) {
          const data: SessionData = await res.json();
          if (isMounted) {
            setSession(data);
            setActiveLevel(data.activeLevel);
          }
        }
      } catch (err) {
        console.error('Session fetch error:', err);
      }
    };

    fetchSession();
    const interval = setInterval(fetchSession, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pin]);

  const handleLevelChange = async (level: LevelId) => {
    setActiveLevel(level);
    try {
      await fetch('/api/presenter/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setLevel', pin, levelId: level })
      });
    } catch (err) {
      console.error('Set level error:', err);
    }
  };

  const handleResetSession = async () => {
    if (!confirm('¿Seguro que deseas reiniciar todas las respuestas de esta sesión?')) return;
    try {
      const res = await fetch('/api/presenter/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', pin })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleGenerateDemo = async () => {
    try {
      const res = await fetch('/api/presenter/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateDemo', pin })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error('Demo error:', err);
    }
  };

  const levelsMeta: { id: LevelId; title: string; subtitle: string }[] = [
    { id: 0, title: 'Nivel 0: Conceptos', subtitle: 'Dinámica de Emparejamiento' },
    { id: 1, title: 'Nivel 1: Diagnóstico Modelo', subtitle: 'Qué modelo elegir' },
    { id: 2, title: 'Nivel 2: Automatización', subtitle: 'Disparador, Cerebro, Acción' },
    { id: 3, title: 'Nivel 3: Médico IA', subtitle: 'Causa y Receta de fallos' },
    { id: 4, title: 'Nivel 4: Agentes e Industria', subtitle: 'Conceptos avanzados' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <Header
        pin={pin}
        isPresenter={true}
        activeLevel={activeLevel}
        participantCount={session?.participants?.length || 0}
        onLevelChange={handleLevelChange}
        onResetSession={handleResetSession}
        onGenerateDemo={handleGenerateDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Navigation Tabs Bar & QR Modal Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {levelsMeta.map((lvl) => {
              const isActive = activeLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelChange(lvl.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950 border border-indigo-400/40'
                      : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center font-extrabold text-xs">
                    N{lvl.id}
                  </span>
                  <span>{lvl.subtitle}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowQRModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>Código QR para Proyectar</span>
          </button>
        </div>

        {/* Consolidated Screen Display depending on Active Level */}
        <div className="transition-all duration-300">
          {activeLevel === 0 && <Nivel0Presenter answers={session?.level0Answers || []} />}
          {activeLevel === 1 && <Nivel1Presenter results={session?.level1Results || []} />}
          {activeLevel === 2 && <Nivel2Presenter submissions={session?.level2Submissions || []} />}
          {activeLevel === 3 && <Nivel3Presenter submissions={session?.level3Submissions || []} />}
          {activeLevel === 4 && <Nivel4Presenter submissions={session?.level4Submissions || []} />}
        </div>
      </main>

      {/* QR Code Modal for Projection */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-950 px-3.5 py-1 rounded-full border border-indigo-800">
              Escanea para Unirte
            </span>

            <h3 className="text-2xl font-black text-white">Unirse al Taller Práctico</h3>

            <div className="bg-white p-6 rounded-2xl inline-block shadow-xl border-4 border-indigo-500">
              <QRCodeSVG value={joinUrl || 'http://localhost:3005'} size={220} />
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">PIN de la sesión:</span>
              <p className="text-2xl font-black text-indigo-400 tracking-widest uppercase">{pin}</p>
              <p className="text-xs text-slate-400 truncate mt-2">{joinUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
