import React from 'react';

interface MascotGaloProps {
  size?: number;
  className?: string;
  withBadge?: boolean;
}

export const MascotGalo: React.FC<MascotGaloProps> = ({
  size = 64,
  className = '',
  withBadge = false,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(2, 132, 199, 0.15))' }}
      >
        {/* Fundo do Avatar Estilizado */}
        <circle cx="50" cy="50" r="46" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="2.5" />

        {/* Crista do Galo Azul/Cyan Institucional */}
        <path
          d="M48 16 C48 12, 54 10, 57 14 C60 11, 67 13, 67 18 C70 17, 75 21, 72 26 C75 28, 77 34, 72 37 L54 36 Z"
          fill="#0284c7"
        />

        {/* Cabeça do Galo */}
        <path
          d="M38 42 C38 28, 55 24, 65 34 C72 40, 72 56, 64 64 C56 72, 42 70, 38 60 Z"
          fill="#ffffff"
          stroke="#0284c7"
          strokeWidth="2.5"
        />

        {/* Bico Estilizado (Acento Esmeralda/Dourado) */}
        <path
          d="M66 44 L80 48 L65 55 Z"
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="1.5"
        />

        {/* Papilha (Gorgomilo) */}
        <path
          d="M62 55 C65 60, 64 66, 58 65 C55 64, 58 57, 62 55 Z"
          fill="#ef4444"
        />

        {/* Olho Tecnológico / IA */}
        <circle cx="56" cy="40" r="4.5" fill="#0f172a" />
        <circle cx="57.5" cy="38.5" r="1.5" fill="#38bdf8" />

        {/* Corpo e Penugem Dinamica */}
        <path
          d="M38 60 C32 64, 25 72, 28 84 C34 85, 46 84, 55 78 C52 74, 45 68, 38 60 Z"
          fill="#059669"
          opacity="0.9"
        />
        <path
          d="M46 68 C42 73, 38 80, 42 86 C48 86, 56 83, 62 76 C58 72, 52 69, 46 68 Z"
          fill="#0284c7"
          opacity="0.8"
        />
      </svg>

      {withBadge && (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -4,
            background: '#059669',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '9999px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '2px solid #ffffff',
            letterSpacing: '0.04em',
          }}
        >
          IA/ESG
        </span>
      )}
    </div>
  );
};

export default MascotGalo;
