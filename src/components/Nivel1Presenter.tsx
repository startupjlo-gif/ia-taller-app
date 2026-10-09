'use client';

import React from 'react';
import { Level1Result, ProfileKey } from '@/lib/types';
import { PROFILE_DETAILS, DIAGNOSTIC_QUESTIONS } from '@/lib/data';
import { Users, TrendingUp, ShieldCheck, Cpu, Zap, DollarSign } from 'lucide-react';

interface Nivel1PresenterProps {
  results: Level1Result[];
}

export const Nivel1Presenter: React.FC<Nivel1PresenterProps> = ({ results }) => {
  const totalSubmissions = results.length;

  // Profile Distribution
  const profileCounts: Record<ProfileKey, number> = {
    rapido: 0,
    comercial: 0,
    multimodal: 0,
    opensource: 0
  };

  results.forEach((r) => {
    if (r.winnerProfile) {
      profileCounts[r.winnerProfile] = (profileCounts[r.winnerProfile] || 0) + 1;
    }
  });

  // Privacy Distribution (Q2)
  const privacyCounts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 };
  // Technical Capability Distribution (Q6)
  const techCounts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 };
  // Error Severity (Q5)
  const errorCounts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 };

  results.forEach((r) => {
    if (r.answers?.q2) privacyCounts[r.answers.q2]++;
    if (r.answers?.q6) techCounts[r.answers.q6]++;
    if (r.answers?.q5) errorCounts[r.answers.q5]++;
  });

  // Dominant profile calculation
  const dominantProfileKey = (Object.keys(profileCounts) as ProfileKey[]).sort(
    (a, b) => profileCounts[b] - profileCounts[a]
  )[0];

  const dominantProfile = PROFILE_DETAILS[dominantProfileKey || 'rapido'];
  const dominantPct =
    totalSubmissions > 0
      ? Math.round((profileCounts[dominantProfileKey || 'rapido'] / totalSubmissions) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Proyección en Pantalla · Formador
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Tendencia Global de Selección de Modelos
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Resumen consolidado de la distribución corporativa entre las 4 categorías de IA.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-400">Participantes</span>
            </div>
            <span className="text-3xl font-black text-white">{totalSubmissions}</span>
          </div>

          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-400">Tendencia Mayoritaria</span>
            </div>
            <span className="text-lg font-bold text-white block">
              {totalSubmissions > 0 ? dominantProfile.title : 'Sin datos'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 4 Profile Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(PROFILE_DETAILS) as ProfileKey[]).map((key) => {
          const profile = PROFILE_DETAILS[key];
          const count = profileCounts[key];
          const pct = totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0;

          return (
            <div
              key={key}
              className={`bg-slate-900/90 border-2 ${profile.borderColor} rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-extrabold text-white">{profile.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${profile.badgeColor}`}
                  >
                    {pct}% ({count} empresas)
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">
                    <strong className="text-slate-100">Solución:</strong> {profile.elige}
                  </p>
                  <p className="text-slate-400 text-xs">
                    <strong className="text-indigo-300">Ejemplos:</strong> {profile.ejemplos}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full transition-all duration-500 ${
                      key === 'rapido'
                        ? 'bg-emerald-500'
                        : key === 'comercial'
                        ? 'bg-blue-500'
                        : key === 'multimodal'
                        ? 'bg-purple-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-1">
                  <span>Adopción en el taller</span>
                  <span>{pct}% del total</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Variable Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Privacy breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase">
            <ShieldCheck className="w-4 h-4" />
            Privacidad de Datos
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Públicos (A):</span>
              <span className="font-bold">{privacyCounts.A}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Clientes / Empresa (B):</span>
              <span className="font-bold">{privacyCounts.B}</span>
            </div>
            <div className="flex justify-between text-amber-300 font-semibold">
              <span>Sensibles (C):</span>
              <span className="font-bold">{privacyCounts.C}</span>
            </div>
            <div className="flex justify-between text-red-400 font-bold">
              <span>No pueden salir (D):</span>
              <span className="font-bold">{privacyCounts.D}</span>
            </div>
          </div>
        </div>

        {/* Technical Capability */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase">
            <Cpu className="w-4 h-4" />
            Capacidad Técnica
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Sin código / No-Code (A):</span>
              <span className="font-bold">{techCounts.A}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Básica / APIs (B):</span>
              <span className="font-bold">{techCounts.B}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Avanzada / Servidores (C):</span>
              <span className="font-bold">{techCounts.C}</span>
            </div>
          </div>
        </div>

        {/* Error Risk Impact */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase">
            <DollarSign className="w-4 h-4" />
            Riesgo de Error
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Leve (A):</span>
              <span className="font-bold">{errorCounts.A}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Moderada (B):</span>
              <span className="font-bold">{errorCounts.B}</span>
            </div>
            <div className="flex justify-between text-red-400 font-bold">
              <span>Grave / Humano en bucle (C):</span>
              <span className="font-bold">{errorCounts.C}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
