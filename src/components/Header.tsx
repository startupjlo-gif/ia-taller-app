'use client';

import React from 'react';
import { Sparkles, Monitor, Phone, Users, RefreshCw } from 'lucide-react';
import { LevelId } from '@/lib/types';

interface HeaderProps {
  pin: string;
  isPresenter?: boolean;
  activeLevel?: LevelId;
  participantCount?: number;
  onLevelChange?: (level: LevelId) => void;
  onResetSession?: () => void;
  onGenerateDemo?: () => void;
  participantName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  pin,
  isPresenter = false,
  activeLevel = 0,
  participantCount = 0,
  onLevelChange,
  onResetSession,
  onGenerateDemo,
  participantName
}) => {
  const levelNames: Record<LevelId, string> = {
    0: 'Nivel 0: Conceptos',
    1: 'Nivel 1: Qué modelo elegir',
    2: 'Nivel 2: Automatización',
    3: 'Nivel 3: Médico IA',
    4: 'Nivel 4: Agentes e Industria'
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Taller Práctico de IA
            </h1>
            <p className="text-xs text-slate-400">
              {isPresenter ? 'Panel interactivo del Formador' : 'Vista de Participante'}
            </p>
          </div>
        </div>

        {/* Center: Session PIN & Level selector */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
          <span className="text-xs font-medium text-slate-400">PIN SESIÓN:</span>
          <span className="text-sm font-extrabold text-indigo-400 tracking-widest uppercase">
            {pin}
          </span>

          {isPresenter && participantCount !== undefined && (
            <div className="flex items-center gap-1 ml-3 pl-3 border-l border-slate-700 text-xs text-emerald-400 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{participantCount} participantes</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isPresenter ? (
            <>
              {/* Level Quick Selector for Presenter */}
              <div className="hidden md:flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                {([0, 1, 2, 3, 4] as LevelId[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onLevelChange?.(lvl)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeLevel === lvl
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    N{lvl}
                  </button>
                ))}
              </div>

              {onGenerateDemo && (
                <button
                  onClick={onGenerateDemo}
                  className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                  title="Cargar participantes de prueba para demostración"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Datos Demo</span>
                </button>
              )}

              {onResetSession && (
                <button
                  onClick={onResetSession}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-medium rounded-lg transition-all"
                  title="Reiniciar respuestas"
                >
                  Limpiar
                </button>
              )}

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Modo Teléfono</span>
              </a>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {participantName && (
                <span className="text-xs text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/50">
                  👤 {participantName}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
