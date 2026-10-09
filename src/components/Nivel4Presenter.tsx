'use client';

import React from 'react';
import { Level4Submission } from '@/lib/types';
import { AGENT_CONCEPTS } from '@/lib/data';
import { Users, Award, Bot, Cpu, AlertTriangle } from 'lucide-react';

interface Nivel4PresenterProps {
  submissions: Level4Submission[];
}

export const Nivel4Presenter: React.FC<Nivel4PresenterProps> = ({ submissions }) => {
  const totalSubmissions = submissions.length;

  const averageScore =
    totalSubmissions > 0
      ? (submissions.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions).toFixed(1)
      : '0.0';

  const conceptStats = AGENT_CONCEPTS.map((c) => {
    let correctCount = 0;

    submissions.forEach((sub) => {
      if (sub.matches && sub.matches[c.id] === c.correctMeaningId) {
        correctCount++;
      }
    });

    const accuracyPct = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

    return {
      conceptObj: c,
      correctCount,
      accuracyPct
    };
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
            Proyección en Pantalla · Formador
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Nivel 4: Agentes Autónomos e Industriales
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Consolidado del dominio de conceptos de agentes y machine learning por la clase.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
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

      {/* Grid of Concept Accuracy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {conceptStats.map(({ conceptObj, correctCount, accuracyPct }) => {
          return (
            <div
              key={conceptObj.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-extrabold text-white">{conceptObj.concept}</h3>
                  </div>

                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black border ${
                      accuracyPct >= 80
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : accuracyPct >= 50
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}
                  >
                    {accuracyPct}% ({correctCount}/{totalSubmissions})
                  </span>
                </div>

                <p className="text-xs text-indigo-300 italic mb-2">
                  Ejemplo: {conceptObj.caseExample}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${accuracyPct}%` }}
                    className="bg-blue-500 h-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-1">
                  <span>Precisión de la clase</span>
                  <span>{accuracyPct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
