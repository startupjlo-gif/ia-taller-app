'use client';

import React from 'react';
import { Level2Submission } from '@/lib/types';
import { LEVEL2_CASES } from '@/lib/data';
import { Users, Award, Zap, Brain, Target, AlertTriangle } from 'lucide-react';

interface Nivel2PresenterProps {
  submissions: Level2Submission[];
}

export const Nivel2Presenter: React.FC<Nivel2PresenterProps> = ({ submissions }) => {
  const totalSubmissions = submissions.length;

  const averageScore =
    totalSubmissions > 0
      ? (submissions.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions).toFixed(1)
      : '0.0';

  // Stats per case
  const caseStats = LEVEL2_CASES.map((c) => {
    let correctDisparador = 0;
    let correctCerebro = 0;
    let correctAccion = 0;

    submissions.forEach((sub) => {
      const caseAns = sub.cases[c.id];
      if (caseAns) {
        if (caseAns.disparador === c.correct.disparador) correctDisparador++;
        if (caseAns.cerebro === c.correct.cerebro) correctCerebro++;
        if (caseAns.accion === c.correct.accion) correctAccion++;
      }
    });

    return {
      caseObj: c,
      disparadorPct: totalSubmissions > 0 ? Math.round((correctDisparador / totalSubmissions) * 100) : 0,
      cerebroPct: totalSubmissions > 0 ? Math.round((correctCerebro / totalSubmissions) * 100) : 0,
      accionPct: totalSubmissions > 0 ? Math.round((correctAccion / totalSubmissions) * 100) : 0
    };
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
            Proyección en Pantalla · Formador
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Nivel 2: Arma tu Automatización
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Resultados consolidados de la construcción de flujos por los participantes.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
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
            <span className="text-3xl font-black text-emerald-400">{averageScore} / 9</span>
          </div>
        </div>
      </div>

      {/* Case Accuracy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caseStats.map(({ caseObj, disparadorPct, cerebroPct, accionPct }) => {
          const caseAvg = Math.round((disparadorPct + cerebroPct + accionPct) / 3);

          return (
            <div
              key={caseObj.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h3 className="text-base font-extrabold text-white">{caseObj.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-950 text-purple-300 border border-purple-800">
                    {caseAvg}% Acierto
                  </span>
                </div>

                <p className="text-xs text-slate-400 italic mb-4">{caseObj.description}</p>

                {/* Progress per component */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>⚡ Disparador</span>
                      <span className="text-emerald-400">{disparadorPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${disparadorPct}%` }}
                        className="bg-emerald-500 h-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>🧠 Cerebro</span>
                      <span className="text-purple-400">{cerebroPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div style={{ width: `${cerebroPct}%` }} className="bg-purple-500 h-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>🎯 Acción</span>
                      <span className="text-indigo-400">{accionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div style={{ width: `${accionPct}%` }} className="bg-indigo-500 h-full" />
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
