'use client';

import React, { useState } from 'react';

interface HeroVisualWidgetProps {
  currentSlide: number;
  selectedCourse: 'IA' | 'ESG';
}

export const HeroVisualWidget: React.FC<HeroVisualWidgetProps> = ({ currentSlide }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
  };

  return (
    <div
      key={`hero-illustration-${currentSlide}`}
      className="animate-fade-in"
      onClick={handleClick}
      title="Clique para ver a animação!"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '320px',
        height: '280px',
        position: 'relative',
        userSelect: 'none',
        cursor: 'pointer',
        overflow: 'visible',
      }}
    >
      <style jsx>{`
        /* Flutuação contínua e suave da figura inteira */
        .floating-figure {
          animation: calmFloat 5s ease-in-out infinite;
          transform-origin: center center;
          transition: transform 0.15s ease-out;
          overflow: visible;
        }
        .floating-figure:hover {
          transform: scale(1.03);
        }
        .floating-figure:active {
          transform: scale(0.97);
        }

        @keyframes calmFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(0.8deg);
          }
        }

        /* ============================================================== */
        /* ANIMAÇÃO DO CAPELO (GIRO CONTÍNUO 360° REAL E SEM PARADAS)    */
        /* ============================================================== */
        .cap-toss-wrapper {
          animation: capTossVertical 0.72s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform;
        }

        .cap-spin-360 {
          animation: capSpinFull 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: 160px 88px;
          will-change: transform;
        }

        @keyframes capTossVertical {
          0% {
            transform: translateY(0);
          }
          45% {
            transform: translateY(-36px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes capSpinFull {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* ============================================================== */
        /* ANIMAÇÃO DO CAFÉ (PULO DA CANECA + FUMAÇA VERTICAL PURA)       */
        /* ============================================================== */
        .mug-jump-smooth {
          animation: mugJumpSmooth 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: 160px 220px;
        }

        @keyframes mugJumpSmooth {
          0% {
            transform: scale(1, 1) translateY(0);
          }
          30% {
            transform: scale(1.12, 0.88) translateY(6px);
          }
          65% {
            transform: scale(0.94, 1.08) translateY(-12px);
          }
          100% {
            transform: scale(1, 1) translateY(0);
          }
        }

        /* Vapores de Fumaça Branca Subindo 100% Verticais */
        .steam-rise-center {
          animation: steamPureVertical1 1.2s ease-out forwards;
        }
        .steam-rise-left {
          animation: steamPureVertical2 1.2s ease-out 0.1s forwards;
        }
        .steam-rise-right {
          animation: steamPureVertical3 1.2s ease-out 0.2s forwards;
        }

        @keyframes steamPureVertical1 {
          0% {
            opacity: 0;
            transform: translateY(0) scaleX(0.7);
          }
          30% {
            opacity: 0.9;
            transform: translateY(-25px) scaleX(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-70px) scaleX(1.4);
          }
        }

        @keyframes steamPureVertical2 {
          0% {
            opacity: 0;
            transform: translateY(0) scaleX(0.7);
          }
          30% {
            opacity: 0.8;
            transform: translateY(-22px) scaleX(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-65px) scaleX(1.35);
          }
        }

        @keyframes steamPureVertical3 {
          0% {
            opacity: 0;
            transform: translateY(0) scaleX(0.7);
          }
          30% {
            opacity: 0.8;
            transform: translateY(-26px) scaleX(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-68px) scaleX(1.35);
          }
        }

        /* ============================================================== */
        /* ANIMAÇÃO DA PASTA 3D (FLAP DE ABERTURA + CARDS EM LEQUE)       */
        /* ============================================================== */
        .folder-flap-smooth {
          animation: folderFlapSmooth 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: 160px 220px;
        }

        @keyframes folderFlapSmooth {
          0% {
            transform: rotateX(0deg);
          }
          30% {
            transform: rotateX(-22deg) translateY(5px);
          }
          75% {
            transform: rotateX(-8deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }

        .card-spread-left {
          animation: cardSpreadLeft 1.1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: 160px 180px;
        }
        @keyframes cardSpreadLeft {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4) rotate(0deg);
          }
          35% {
            opacity: 1;
            transform: translate(-65px, -60px) scale(1.05) rotate(-14deg);
          }
          75% {
            opacity: 1;
            transform: translate(-55px, -50px) scale(1) rotate(-10deg);
          }
          100% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3) rotate(0deg);
          }
        }

        .card-spread-center {
          animation: cardSpreadCenter 1.1s cubic-bezier(0.25, 1, 0.5, 1) 0.06s forwards;
          transform-origin: 160px 180px;
        }
        @keyframes cardSpreadCenter {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4);
          }
          35% {
            opacity: 1;
            transform: translate(0, -82px) scale(1.1);
          }
          75% {
            opacity: 1;
            transform: translate(0, -70px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3);
          }
        }

        .card-spread-right {
          animation: cardSpreadRight 1.1s cubic-bezier(0.25, 1, 0.5, 1) 0.12s forwards;
          transform-origin: 160px 180px;
        }
        @keyframes cardSpreadRight {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4) rotate(0deg);
          }
          35% {
            opacity: 1;
            transform: translate(65px, -60px) scale(1.05) rotate(14deg);
          }
          75% {
            opacity: 1;
            transform: translate(55px, -50px) scale(1) rotate(10deg);
          }
          100% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3) rotate(0deg);
          }
        }
      `}</style>

      {/* ============================================================== */}
      {/* SLIDE 0: CAPELO E LIVRO ACADÊMICO (GIRO ÁGIL E POLIDO)         */}
      {/* ============================================================== */}
      {currentSlide === 0 && (
        <div className="floating-figure">
          <svg
            width="320"
            height="320"
            viewBox="0 -70 320 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible', filter: 'drop-shadow(0 20px 25px rgba(2, 132, 199, 0.2))' }}
          >
            <defs>
              <linearGradient id="cap-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="cap-rim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="gold-tassel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="book-cover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="70%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>
              <linearGradient id="pages-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="pages-right" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>

            {/* Sombra de Contato Suave */}
            <ellipse cx="160" cy="245" rx="110" ry="16" fill="rgba(15, 23, 42, 0.12)" />

            {/* LIVRO ABERTO */}
            <g transform="translate(0, 15)">
              <path
                d="M 38 185 C 80 178, 125 185, 160 195 C 195 185, 240 178, 282 185 C 286 186, 288 190, 286 195 L 280 205 C 238 198, 195 204, 160 216 C 125 204, 82 198, 40 205 L 34 195 C 32 190, 34 186, 38 185 Z"
                fill="url(#book-cover)"
              />
              <path
                d="M 45 180 C 85 174, 125 180, 158 192 L 158 206 C 125 195, 85 189, 45 195 Z"
                fill="url(#pages-left)"
              />
              <path
                d="M 275 180 C 235 174, 195 180, 162 192 L 162 206 C 195 195, 235 189, 275 195 Z"
                fill="url(#pages-right)"
              />

              <path
                d="M 48 175 C 85 168, 125 172, 158 188 L 158 196 C 125 180, 85 176, 48 183 Z"
                fill="#ffffff"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
              />
              <line x1="68" y1="176" x2="135" y2="182" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <line x1="72" y1="182" x2="140" y2="188" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

              <path
                d="M 272 175 C 235 168, 195 172, 162 188 L 162 196 C 195 180, 235 176, 272 183 Z"
                fill="#ffffff"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
              />
              <line x1="185" y1="182" x2="252" y2="176" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="180" y1="188" x2="248" y2="182" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

              <path
                d="M 158 192 L 160 225 L 166 220 L 172 226 L 162 192 Z"
                fill="#e11d48"
              />
            </g>

            {/* CAPELO QUE SOBE E GIRA 360° DE FORMA CONTÍNUA E FLUIDA */}
            <g
              key={`cap-toss-${clickCount}`}
              className={clickCount > 0 ? 'cap-toss-wrapper' : ''}
              style={{ overflow: 'visible' }}
            >
              <g
                key={`cap-spin-${clickCount}`}
                className={clickCount > 0 ? 'cap-spin-360' : ''}
                style={{ overflow: 'visible' }}
              >
                <path
                  d="M 120 95 C 120 85, 138 78, 160 78 C 182 78, 200 85, 200 95 L 196 112 C 196 122, 180 128, 160 128 C 140 128, 124 122, 124 112 Z"
                  fill="#0f172a"
                />
                <ellipse cx="160" cy="112" rx="36" ry="12" fill="#1e293b" />

                <path
                  d="M 160 40 L 255 76 L 160 112 L 65 76 Z"
                  fill="url(#cap-top)"
                  filter="drop-shadow(0 8px 14px rgba(0,0,0,0.3))"
                />
                <path
                  d="M 65 76 L 160 112 L 255 76 L 252 80 L 160 116 L 68 80 Z"
                  fill="url(#cap-rim)"
                />
                <ellipse cx="160" cy="76" rx="7" ry="4" fill="url(#gold-tassel)" />

                <path
                  d="M 160 76 C 180 76, 215 88, 222 105 L 222 135"
                  stroke="url(#gold-tassel)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 218 135 L 226 135 L 228 155 L 216 155 Z"
                  fill="url(#gold-tassel)"
                  filter="drop-shadow(0 2px 4px rgba(217, 119, 6, 0.4))"
                />
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* ============================================================== */}
      {/* SLIDE 1: CAFÉ COM FUMAÇA 100% VERTICAL                         */}
      {/* ============================================================== */}
      {currentSlide === 1 && (
        <div className="floating-figure">
          <svg
            width="320"
            height="320"
            viewBox="0 -70 320 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible', filter: 'drop-shadow(0 20px 25px rgba(5, 150, 105, 0.2))' }}
          >
            <defs>
              <linearGradient id="ceramic-mug" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="40%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              <linearGradient id="mug-inner-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>

              <linearGradient id="coffee-surface" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#542b10" />
                <stop offset="50%" stopColor="#3d1804" />
                <stop offset="100%" stopColor="#260f02" />
              </linearGradient>

              <linearGradient id="saucer-plate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              <filter id="pure-steam-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>
            </defs>

            {/* Sombra de Contato do Pires */}
            <ellipse cx="160" cy="248" rx="105" ry="16" fill="rgba(15, 23, 42, 0.1)" />

            {/* Pires 3D */}
            <ellipse cx="160" cy="230" rx="98" ry="24" fill="url(#saucer-plate)" />
            <ellipse cx="160" cy="226" rx="84" ry="18" fill="#f1f5f9" />
            <ellipse cx="160" cy="224" rx="55" ry="12" fill="#e2e8f0" />

            {/* Caneca com pulo elástico no clique */}
            <g
              key={`mug-${clickCount}`}
              className={clickCount > 0 ? 'mug-jump-smooth' : ''}
              style={{ overflow: 'visible' }}
            >
              <path
                d="M 218 132 C 265 132, 265 186, 212 192 L 206 180 C 242 176, 242 144, 208 144 Z"
                fill="url(#ceramic-mug)"
                filter="drop-shadow(2px 6px 8px rgba(4, 120, 87, 0.35))"
              />

              <path
                d="M 96 118 L 112 208 C 114 218, 128 226, 160 226 C 192 226, 206 218, 208 208 L 224 118 Z"
                fill="url(#ceramic-mug)"
              />

              <path
                d="M 118 126 L 126 198 C 128 203, 132 206, 138 206 L 144 206 L 135 126 Z"
                fill="rgba(255, 255, 255, 0.28)"
              />

              <ellipse cx="160" cy="118" rx="64" ry="19" fill="url(#mug-inner-dark)" />
              <ellipse cx="160" cy="120" rx="58" ry="15" fill="url(#coffee-surface)" />
              <ellipse cx="150" cy="118" rx="36" ry="8" fill="#d97706" opacity="0.35" />
              <ellipse cx="145" cy="117" rx="20" ry="4" fill="#fef3c7" opacity="0.25" />
            </g>

            {/* VAPOR BRANCO PURO 100% VERTICAL */}
            {clickCount > 0 && (
              <g key={`steam-burst-${clickCount}`} style={{ filter: 'url(#pure-steam-blur)', overflow: 'visible' }}>
                <path
                  className="steam-rise-center"
                  d="M 160 110 C 154 90, 166 70, 160 45 C 155 30, 165 15, 160 0"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  className="steam-rise-left"
                  d="M 148 112 C 142 92, 152 74, 146 50 C 140 32, 150 18, 148 4"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  className="steam-rise-right"
                  d="M 172 112 C 178 92, 168 74, 174 50 C 180 32, 170 18, 172 4"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* ============================================================== */}
      {/* SLIDE 2: PASTA 3D COM FLAP E CARDS EM LEQUE                     */}
      {/* ============================================================== */}
      {currentSlide === 2 && (
        <div className="floating-figure">
          <svg
            width="320"
            height="320"
            viewBox="0 -70 320 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible', filter: 'drop-shadow(0 20px 25px rgba(217, 119, 6, 0.22))' }}
          >
            <defs>
              <linearGradient id="folder-back-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              <linearGradient id="folder-front-grad" x1="0%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="80%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              <linearGradient id="folder-lip" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>

              <linearGradient id="card-ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <linearGradient id="card-esg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              <linearGradient id="card-fatec-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Sombra de Contato da Pasta */}
            <ellipse cx="160" cy="245" rx="115" ry="18" fill="rgba(15, 23, 42, 0.12)" />

            {/* 1. ABA TRASEIRA DA PASTA */}
            <path
              d="M 52 92 C 52 82, 60 74, 70 74 L 120 74 C 128 74, 136 78, 142 84 L 155 96 C 158 100, 164 102, 170 102 L 254 102 C 264 102, 272 110, 272 120 L 265 200 C 265 210, 255 218, 245 218 L 60 218 C 50 218, 42 210, 42 200 Z"
              fill="url(#folder-back-grad)"
            />

            {/* 2. PAPÉIS INTERNOS FIXOS */}
            <path
              d="M 85 70 C 85 64, 90 60, 96 60 L 225 60 C 231 60, 236 64, 236 70 L 244 150 L 78 150 Z"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <path
              d="M 98 52 C 98 46, 103 42, 110 42 L 242 42 C 248 42, 254 46, 254 52 L 258 160 L 92 160 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.06))"
            />
            <line x1="116" y1="62" x2="175" y2="62" stroke="var(--accent-blue)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="116" y1="76" x2="230" y2="76" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="116" y1="90" x2="210" y2="90" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />

            {/* CARDS QUE SALTAM EM LEQUE RE-ACIONÁVEIS A CADA CLIQUE */}
            {clickCount > 0 && (
              <g key={`cards-burst-${clickCount}`} style={{ overflow: 'visible' }}>
                <g className="card-spread-left">
                  <rect
                    x="115"
                    y="100"
                    width="70"
                    height="85"
                    rx="8"
                    fill="url(#card-ai-grad)"
                    stroke="#ffffff"
                    strokeWidth="2"
                    filter="drop-shadow(0 10px 14px rgba(2, 132, 199, 0.45))"
                  />
                  <rect x="123" y="110" width="30" height="12" rx="4" fill="#ffffff" />
                  <text x="127" y="119" fill="#0284c7" fontSize="8" fontWeight="800" fontFamily="sans-serif">IA</text>
                  <circle cx="150" cy="142" r="14" fill="rgba(255, 255, 255, 0.25)" />
                  <text x="139" y="146" fill="#ffffff" fontSize="11" fontWeight="700" fontFamily="monospace">.py</text>
                  <line x1="125" y1="168" x2="175" y2="168" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                </g>

                <g className="card-spread-center">
                  <rect
                    x="125"
                    y="95"
                    width="70"
                    height="85"
                    rx="8"
                    fill="url(#card-fatec-grad)"
                    stroke="#ffffff"
                    strokeWidth="2"
                    filter="drop-shadow(0 12px 16px rgba(217, 119, 6, 0.45))"
                  />
                  <rect x="133" y="105" width="40" height="12" rx="4" fill="#ffffff" />
                  <text x="137" y="114" fill="#d97706" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">FATEC</text>
                  <circle cx="160" cy="138" r="14" fill="rgba(255, 255, 255, 0.25)" />
                  <text x="151" y="142" fill="#ffffff" fontSize="10" fontWeight="700" fontFamily="monospace">PDF</text>
                  <line x1="135" y1="164" x2="185" y2="164" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                </g>

                <g className="card-spread-right">
                  <rect
                    x="135"
                    y="100"
                    width="70"
                    height="85"
                    rx="8"
                    fill="url(#card-esg-grad)"
                    stroke="#ffffff"
                    strokeWidth="2"
                    filter="drop-shadow(0 10px 14px rgba(5, 150, 105, 0.45))"
                  />
                  <rect x="143" y="110" width="35" height="12" rx="4" fill="#ffffff" />
                  <text x="147" y="119" fill="#059669" fontSize="8" fontWeight="800" fontFamily="sans-serif">ESG</text>
                  <circle cx="170" cy="142" r="14" fill="rgba(255, 255, 255, 0.25)" />
                  <text x="160" y="146" fill="#ffffff" fontSize="11" fontWeight="700" fontFamily="monospace">.eco</text>
                  <line x1="145" y1="168" x2="195" y2="168" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                </g>
              </g>
            )}

            {/* 3. CAPA FRONTAL DA PASTA */}
            <path
              key={`flap-1-${clickCount}`}
              className={clickCount > 0 ? 'folder-flap-smooth' : ''}
              d="M 40 135 C 38 125, 46 116, 56 116 L 245 116 C 255 116, 263 124, 265 134 L 278 205 C 280 216, 272 226, 260 226 L 68 226 C 56 226, 46 217, 44 205 Z"
              fill="url(#folder-front-grad)"
            />
            <path
              key={`flap-2-${clickCount}`}
              className={clickCount > 0 ? 'folder-flap-smooth' : ''}
              d="M 56 116 L 245 116 C 255 116, 263 124, 265 134 L 263 138 C 261 128, 253 122, 244 122 L 56 122 C 47 122, 40 128, 38 138 L 40 135 C 42 125, 48 116, 56 116 Z"
              fill="url(#folder-lip)"
            />
            <path
              key={`flap-3-${clickCount}`}
              className={clickCount > 0 ? 'folder-flap-smooth' : ''}
              d="M 52 140 L 72 215 C 73 220, 78 224, 84 224 L 95 224 L 75 140 Z"
              fill="rgba(255, 255, 255, 0.28)"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
