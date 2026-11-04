'use client';

import React from 'react';

interface CampusDoorProps {
  active: boolean;
}

export const CampusDoorTransition: React.FC<CampusDoorProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0284c7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      <style jsx>{`
        .stage {
          position: relative;
          width: 120px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Personagem: já surge ao lado da porta e dá 2 passos rápidos para dentro (0.65s total) */
        .runner {
          position: absolute;
          left: 22px;
          bottom: 4px;
          animation: quickStepIn 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes quickStepIn {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          45% {
            transform: translateX(26px) scale(0.96);
            opacity: 1;
          }
          75% {
            transform: translateX(42px) scale(0.85);
            opacity: 0.9;
          }
          100% {
            transform: translateX(52px) scale(0.5);
            opacity: 0;
          }
        }

        /* Articulações ágeis (cabeça, braços e pernas) */
        .j-head {
          animation: jHead 0.16s ease-in-out infinite alternate;
          transform-origin: center bottom;
        }
        .j-arm-l {
          animation: jArmL 0.16s ease-in-out infinite alternate;
          transform-origin: 2px 2px;
        }
        .j-arm-r {
          animation: jArmR 0.16s ease-in-out infinite alternate;
          transform-origin: 2px 2px;
        }
        .j-leg-l {
          animation: jLegL 0.16s ease-in-out infinite alternate;
          transform-origin: 2px 1px;
        }
        .j-leg-r {
          animation: jLegR 0.16s ease-in-out infinite alternate;
          transform-origin: 2px 1px;
        }

        @keyframes jHead {
          0% { transform: translateY(0); }
          100% { transform: translateY(-1px); }
        }
        @keyframes jArmL {
          0% { transform: rotate(38deg); }
          100% { transform: rotate(-38deg); }
        }
        @keyframes jArmR {
          0% { transform: rotate(-38deg); }
          100% { transform: rotate(38deg); }
        }
        @keyframes jLegL {
          0% { transform: rotate(-36deg); }
          100% { transform: rotate(36deg); }
        }
        @keyframes jLegR {
          0% { transform: rotate(36deg); }
          100% { transform: rotate(-36deg); }
        }

        /* Porta: abre imediatamente em perspectiva 3D quando ele aproxima e fecha em seguida */
        .door-leaf {
          animation: doorFastSwing 0.65s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
          transform-origin: left center;
        }

        @keyframes doorFastSwing {
          0% { transform: scaleX(1); }
          25% { transform: scaleX(0.08); }
          70% { transform: scaleX(0.08); }
          100% { transform: scaleX(1); }
        }
      `}</style>

      <div className="stage">
        {/* Personagem com cores sólidas integradas (SEM contornos brancos soltos) */}
        <div className="runner">
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
            {/* 1. Cabeça (com tom de pele natural e cabelo escuro) */}
            <g className="j-head">
              <rect x="7" y="1" width="8" height="7" rx="2" fill="#fed7aa" />
              <rect x="7" y="1" width="8" height="2.5" rx="1" fill="#1e293b" />
              <rect x="12" y="4" width="1.4" height="1.4" rx="0.5" fill="#0f172a" />
            </g>

            {/* 2. Tronco (Camiseta Verde FATEC ESG) */}
            <rect x="7.5" y="8" width="7" height="9" rx="1.5" fill="#059669" />

            {/* 3. Braço Traseiro */}
            <g className="j-arm-r" style={{ transformBox: 'fill-box' }}>
              <rect x="13" y="8.5" width="2.5" height="7.5" rx="1" fill="#047857" />
              <circle cx="14.2" cy="16" r="1.2" fill="#fed7aa" />
            </g>

            {/* 4. Perna Traseira */}
            <g className="j-leg-r" style={{ transformBox: 'fill-box' }}>
              <rect x="10.8" y="16.5" width="3" height="8.5" rx="1" fill="#334155" />
              <rect x="10.8" y="24" width="4" height="2" rx="0.8" fill="#0f172a" />
            </g>

            {/* 5. Perna Dianteira */}
            <g className="j-leg-l" style={{ transformBox: 'fill-box' }}>
              <rect x="7.5" y="16.5" width="3" height="8.5" rx="1" fill="#1e293b" />
              <rect x="7.5" y="24" width="4" height="2" rx="0.8" fill="#0284c7" />
            </g>

            {/* 6. Braço Dianteiro */}
            <g className="j-arm-l" style={{ transformBox: 'fill-box' }}>
              <rect x="5.5" y="8.5" width="2.5" height="7.5" rx="1" fill="#10b981" />
              <circle cx="6.7" cy="16" r="1.2" fill="#fed7aa" />
            </g>
          </svg>
        </div>

        {/* Porta do Campus Limpa (sem batentes brancos bizarros) */}
        <div style={{ position: 'absolute', right: '18px', bottom: '3px' }}>
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
            {/* Interior Escuro da Porta (Sala) */}
            <rect x="3" y="2" width="18" height="26" rx="2" fill="#0369a1" />

            {/* Folha da Porta que Abre */}
            <g className="door-leaf">
              <rect x="3" y="2" width="18" height="26" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Vidro da porta */}
              <rect x="6" y="5" width="12" height="9" rx="1.5" fill="#e0f2fe" />
              {/* Maçaneta */}
              <circle cx="17.5" cy="16" r="1.3" fill="#d97706" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
