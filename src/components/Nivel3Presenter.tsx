'use client';

import React from 'react';
import { Level3Submission } from '@/lib/types';
import { MEDICO_CASES } from '@/lib/data';
import { Users, Award, Stethoscope, Pill, AlertTriangle } from 'lucide-react';

interface Nivel3PresenterProps {
  submissions: Level3Submission[];
}

export const Nivel3Presenter: React.FC<Nivel3PresenterProps> = ({ submissions }) => {
  const totalSubmissions = submissions.length;

  const averageScore =
    totalSubmissions > 0
      ? (submissions.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions).toFixed(1)
      : '0.0';

  const caseStats = MEDICO_CASES.map((c) => {
    let causaCorrect = 0;
    let solucionCorrect = 0;

    submissions.forEach((sub) => {
      const ans = sub.answers[c.id];
      if (ans) {
        if (ans.causaId === c.correctCausaId) causaCorrect++;
        if (ans.solucionId === c.correctSolucionId) solucionCorrect++;
      }
    });

    const causaPct = totalSubmissions > 0 ? Math.round((causaCorrect / totalSubmissions) * 100) : 0;
    const solucionPct = totalSubmissions > 0 ? Math.round((solucionCorrect / totalSubmissions) * 100) : 0;

    return {
      caseObj: c,
      causaPct,
      solucionPct,
      avgPct: Math.round((causaPct + solucionPct) / 2)
    };
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 border border-teal-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
            Proyección en Pantalla · Formador
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Nivel 3: Médico IA
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Consolidado de precisión en el diagnóstico y recetas de soluciones en el taller.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-teal-400 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-400">Participantes</span>
            </div>
            <span className="text-3xl font-black text-white">{totalSubmissions}</span>
          </div>

          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Award className="w-5 h-5" />
              <span className="text-xs font-semibold text-slate-400">Nota Media</span>
            </div>
            <span className="text-3xl font-black text-emerald-400">{averageScore} / 6</span>
          </div>
        </div>
      </div>

      {/* Case Accuracy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caseStats.map(({ caseObj, causaPct, solucionPct, avgPct }) => {
          return (
            <div
              key={caseObj.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h3 className="text-base font-extrabold text-white">{caseObj.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-950 text-teal-300 border border-teal-800">
                    {avgPct}% Acierto
                  </span>
                </div>

                <p className="text-xs text-slate-400 italic mb-4">{caseObj.description}</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>🩺 Diagnóstico de Causa</span>
                      <span className="text-amber-400">{causaPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div style={{ width: `${causaPct}%` }} className="bg-amber-500 h-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>💊 Receta de Solución</span>
                      <span className="text-teal-400">{solucionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div style={{ width: `${solucionPct}%` }} className="bg-teal-500 h-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
