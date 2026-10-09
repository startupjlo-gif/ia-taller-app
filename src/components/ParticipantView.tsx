'use client';

import React, { useState, useEffect } from 'react';
import { LevelId, SessionData } from '@/lib/types';
import { Header } from './Header';
import { Nivel0Participant } from './Nivel0Participant';
import { Nivel1Participant } from './Nivel1Participant';
import { Nivel2Participant } from './Nivel2Participant';
import { Nivel3Participant } from './Nivel3Participant';
import { Nivel4Participant } from './Nivel4Participant';
import { User, Sparkles, Send, Layers } from 'lucide-react';

interface ParticipantViewProps {
  initialPin?: string;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({ initialPin = 'IA-2026' }) => {
  const [pin, setPin] = useState<string>(initialPin);
  const [participantName, setParticipantName] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<LevelId>(0);
  const [presenterLevel, setPresenterLevel] = useState<LevelId>(0);
  const [autoSync, setAutoSync] = useState<boolean>(true);

  // Read saved profile from localStorage or URL query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPin = searchParams.get('pin');
      if (urlPin) setPin(urlPin.toUpperCase());

      let storedId = localStorage.getItem('ia_taller_participant_id');
      if (!storedId) {
        storedId = 'p_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('ia_taller_participant_id', storedId);
      }
      setParticipantId(storedId);

      const storedName = localStorage.getItem('ia_taller_participant_name');
      if (storedName) {
        setParticipantName(storedName);
        setHasJoined(true);
      }
    }
  }, []);

  // Poll session state to sync presenter level
  useEffect(() => {
    if (!hasJoined) return;
    let isMounted = true;

    const pollSession = async () => {
      try {
        const res = await fetch(`/api/session?pin=${pin}`, { cache: 'no-store' });
        if (res.ok) {
          const data: SessionData = await res.json();
          if (isMounted) {
            setPresenterLevel(data.activeLevel);
            if (autoSync && data.activeLevel !== undefined) {
              setActiveLevel(data.activeLevel);
            }
          }
        }
      } catch (err) {
        console.error('Session poll error:', err);
      }
    };

    pollSession();
    const interval = setInterval(pollSession, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pin, hasJoined, autoSync]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) return;
    localStorage.setItem('ia_taller_participant_name', participantName.trim());
    setHasJoined(true);
  };

  const levelTabs: { id: LevelId; label: string }[] = [
    { id: 0, label: 'Nivel 0' },
    { id: 1, label: 'Nivel 1' },
    { id: 2, label: 'Nivel 2' },
    { id: 3, label: 'Nivel 3' },
    { id: 4, label: 'Nivel 4' }
  ];

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="p-3 bg-indigo-600/30 border border-indigo-500/40 rounded-2xl text-indigo-400 inline-block">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
              Taller Práctico de IA
            </span>
            <h2 className="text-2xl font-black text-white mt-1">Unirse a la Sesión</h2>
            <p className="text-slate-400 text-xs mt-1">
              Ingresa tu nombre o empresa para participar en las actividades dinámicas.
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                PIN de la Sesión
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-black tracking-widest text-indigo-400 uppercase focus:border-indigo-500 focus:outline-none"
                placeholder="IA-2026"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Tu Nombre o Empresa
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Ej. Carlos - Ac me Corp"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Entrar a la Dinámica
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header pin={pin} isPresenter={false} participantName={participantName} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Sync Status Banner */}
        <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Sesión activa: <strong className="text-white">{pin}</strong> · Formador en:{' '}
              <strong className="text-indigo-400">Nivel {presenterLevel}</strong>
            </span>
          </div>

          <button
            onClick={() => {
              setAutoSync(true);
              setActiveLevel(presenterLevel);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              autoSync
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {autoSync ? 'Sincronizado con Formador' : 'Ir a nivel del Formador'}
          </button>
        </div>

        {/* Level Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {levelTabs.map((tab) => {
            const isActive = activeLevel === tab.id;
            const isPresenterLvl = presenterLevel === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setAutoSync(false);
                  setActiveLevel(tab.id);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all relative flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {isPresenterLvl && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Nivel del Formador" />
                )}
              </button>
            );
          })}
        </div>

        {/* Level Activity */}
        <div className="transition-all duration-300">
          {activeLevel === 0 && (
            <Nivel0Participant
              pin={pin}
              participantId={participantId}
              participantName={participantName}
            />
          )}
          {activeLevel === 1 && (
            <Nivel1Participant
              pin={pin}
              participantId={participantId}
              participantName={participantName}
            />
          )}
          {activeLevel === 2 && (
            <Nivel2Participant
              pin={pin}
              participantId={participantId}
              participantName={participantName}
            />
          )}
          {activeLevel === 3 && (
            <Nivel3Participant
              pin={pin}
              participantId={participantId}
              participantName={participantName}
            />
          )}
          {activeLevel === 4 && (
            <Nivel4Participant
              pin={pin}
              participantId={participantId}
              participantName={participantName}
            />
          )}
        </div>
      </main>
    </div>
  );
};
