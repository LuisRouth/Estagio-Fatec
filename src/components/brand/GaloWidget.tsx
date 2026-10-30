'use client';

import React, { useState } from 'react';

interface RealisticFeather {
  id: number;
  startX: number;
  driftDir: number; // 1 = oscila pra direita primeiro, -1 = pra esquerda
  scale: number;
  tilt: number;
  colorType: 'emerald' | 'cyan';
}

export const GaloWidget: React.FC = () => {
  const [feathers, setFeathers] = useState<RealisticFeather[]>([]);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = () => {
    // Pulinho elástico do galo
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);

    // Gerar pena realista com física e trajetória única (não padronizada)
    const newFeather: RealisticFeather = {
      id: Date.now() + Math.random(),
      startX: (Math.random() - 0.5) * 12,
      driftDir: Math.random() > 0.5 ? 1 : -1,
      scale: 0.85 + Math.random() * 0.3, // tamanhos variados
      tilt: (Math.random() - 0.5) * 20,
      colorType: Math.random() > 0.3 ? 'emerald' : 'cyan', // maioria verde como na logo
    };

    setFeathers((prev) => [...prev, newFeather]);

    // Remoção limpa após completar a queda (2.3s)
    setTimeout(() => {
      setFeathers((prev) => prev.filter((f) => f.id !== newFeather.id));
    }, 2300);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <style jsx>{`
        .galo-square-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: #ffffff;
          border: 1px solid var(--border-light);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
          user-select: none;
        }

        .galo-square-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
          border-color: rgba(5, 150, 105, 0.35);
        }

        .galo-square-btn:active {
          transform: translateY(1px) scale(0.95);
        }

        .galo-bounce {
          animation: galoBobSmooth 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes galoBobSmooth {
          0% {
            transform: scale(1);
          }
          35% {
            transform: scale(0.9, 1.12) translateY(-4px);
          }
          70% {
            transform: scale(1.06, 0.95) translateY(2px);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Queda com Aerodinâmica Fluida de Pena (Oscilação 3D em Z e Y com resistência do ar) */
        .realistic-feather-anim {
          position: absolute;
          top: 10px;
          pointer-events: none;
          z-index: 60;
          perspective: 600px;
          will-change: transform, opacity;
        }

        .drift-right {
          animation: driftPathRight 2.2s cubic-bezier(0.2, 0.6, 0.35, 1) forwards;
        }

        .drift-left {
          animation: driftPathLeft 2.2s cubic-bezier(0.2, 0.6, 0.35, 1) forwards;
        }

        @keyframes driftPathRight {
          0% {
            opacity: 0;
            transform: translate(0, -6px) rotate(0deg) rotateY(0deg);
          }
          12% {
            opacity: 1;
            transform: translate(14px, 14px) rotate(18deg) rotateY(35deg);
          }
          35% {
            transform: translate(-10px, 38px) rotate(-16deg) rotateY(-40deg);
          }
          58% {
            transform: translate(16px, 66px) rotate(14deg) rotateY(30deg);
          }
          80% {
            opacity: 0.8;
            transform: translate(-6px, 92px) rotate(-8deg) rotateY(-20deg);
          }
          100% {
            opacity: 0;
            transform: translate(8px, 115px) rotate(6deg) rotateY(0deg);
          }
        }

        @keyframes driftPathLeft {
          0% {
            opacity: 0;
            transform: translate(0, -6px) rotate(0deg) rotateY(0deg);
          }
          12% {
            opacity: 1;
            transform: translate(-14px, 14px) rotate(-18deg) rotateY(-35deg);
          }
          35% {
            transform: translate(10px, 38px) rotate(16deg) rotateY(40deg);
          }
          58% {
            transform: translate(-16px, 66px) rotate(-14deg) rotateY(-30deg);
          }
          80% {
            opacity: 0.8;
            transform: translate(6px, 92px) rotate(8deg) rotateY(20deg);
          }
          100% {
            opacity: 0;
            transform: translate(-8px, 115px) rotate(-6deg) rotateY(0deg);
          }
        }
      `}</style>

      {/* Botão Quadrado com Pontas Arredondadas */}
      <button
        type="button"
        className={`galo-square-btn ${isBouncing ? 'galo-bounce' : ''}`}
        onClick={handleClick}
        title="FATEC Rio Claro"
        aria-label="FATEC Rio Claro"
      >
        <img
          src="/brand/mascote-galo.png"
          alt="FATEC Rio Claro"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </button>

      {/* Penas Reais com Silhueta Anatômica de Ave e Farpar Separadas */}
      {feathers.map((f) => {
        const isEmerald = f.colorType === 'emerald';
        const primaryColor = isEmerald ? '#059669' : '#0284c7';
        const secondaryColor = isEmerald ? '#10b981' : '#38bdf8';
        const darkColor = isEmerald ? '#047857' : '#0369a1';

        return (
          <div
            key={f.id}
            className={`realistic-feather-anim ${f.driftDir === 1 ? 'drift-right' : 'drift-left'}`}
            style={{
              left: `calc(50% + ${f.startX}px)`,
              transform: `scale(${f.scale}) rotate(${f.tilt}deg)`,
            }}
          >
            <svg
              width="24"
              height="44"
              viewBox="0 0 28 50"
              fill="none"
              style={{
                filter: `drop-shadow(0 2px 6px ${primaryColor}45)`,
              }}
            >
              <defs>
                {/* Gradiente da Vâna Larga (Traseira) */}
                <linearGradient id={`wide-vane-${f.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={secondaryColor} />
                  <stop offset="60%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={darkColor} />
                </linearGradient>

                {/* Gradiente da Vâna Estreita (Dianteira) */}
                <linearGradient id={`narrow-vane-${f.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={secondaryColor} />
                  <stop offset="70%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={darkColor} />
                </linearGradient>
              </defs>

              {/* Vâna Larga Traseira (Curvada, com Entalhes Naturais de Penas) */}
              <path
                d="M 14 3 
                   C 19 8, 26 18, 26 29 
                   C 26 33, 24 35, 23 35 L 21 34 
                   C 23 36, 22 39, 18 41 
                   C 16 42, 14.5 42.5, 14 43 
                   Z"
                fill={`url(#wide-vane-${f.id})`}
              />

              {/* Vâna Estreita Dianteira (Silhueta Asimétrica de Pena Real) */}
              <path
                d="M 14 3 
                   C 10 9, 5 19, 5 28 
                   C 5 33, 7 35, 9 36 L 7 37 
                   C 8 39, 11 41.5, 13.8 42.8 L 14 43 
                   Z"
                fill={`url(#narrow-vane-${f.id})`}
              />

              {/* Farpar Finas e Textura Interna de Pena */}
              <g stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.7" strokeLinecap="round">
                <line x1="14" y1="12" x2="20" y2="16" />
                <line x1="14" y1="18" x2="22" y2="23" />
                <line x1="14" y1="24" x2="22" y2="30" />
                <line x1="14" y1="31" x2="19" y2="36" />

                <line x1="14" y1="14" x2="8" y2="18" />
                <line x1="14" y1="20" x2="7" y2="25" />
                <line x1="14" y1="27" x2="8" y2="32" />
              </g>

              {/* Raque / Eixo Central Curvo de Pena */}
              <path
                d="M 14 2 Q 13.7 22, 14 43 L 14 48"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Cálamo (Ponta Base da Pena) */}
              <line x1="14" y1="43" x2="14" y2="48" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" strokeLinecap="round" />

              {/* Penugem Fina na Base (Afterfeather) */}
              <path
                d="M 14 40 C 11 42, 10 44, 11 46 M 14 41 C 17 42, 18 45, 16 46"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
