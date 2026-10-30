import React from 'react';

interface LogoFatecProps {
  className?: string;
  height?: number;
  showSubtitle?: boolean;
}

export const LogoFatec: React.FC<LogoFatecProps> = ({
  className = '',
  height = 44,
  showSubtitle = true,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1.25rem',
        userSelect: 'none',
      }}
      className={className}
    >
      {/* Logomarca Oficial FATEC */}
      <img
        src="/brand/logo-fatec.png"
        alt="Logotipo Oficial FATEC - Faculdade de Tecnologia"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {/* Divisor Institucional e Marca Oficial do Centro Paula Souza */}
      {showSubtitle && (
        <>
          <div
            style={{
              height: `${Math.round(height * 0.8)}px`,
              width: '1.5px',
              backgroundColor: '#cbd5e1',
              margin: '0 0.15rem',
            }}
          />

          <img
            src="/brand/logo-cps.png"
            alt="Logotipo Oficial Centro Paula Souza"
            style={{
              height: `${Math.round(height * 0.88)}px`,
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </>
      )}
    </div>
  );
};
