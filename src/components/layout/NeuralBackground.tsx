'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  phase: number;
}

interface Pulse {
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
  color: string;
}

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Adaptação para telas de alta densidade (Retina)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Parâmetros da Rede Neural Simbólica
    // Quantidade balanceada de nós para fluidez 60 FPS e elegância visual
    const nodeCount = Math.floor(Math.min(width, 1600) / 28);
    const particles: Particle[] = [];

    for (let i = 0; i < nodeCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.35,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Sinapses ativas (Pulsos de dados trafegando entre neurônios)
    const pulses: Pulse[] = [];
    const maxPulses = 12;

    // Rastreamento suave do cursor do usuário para interatividade orgânica
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const connectionDistance = 145;
    const mouseRadius = 150;

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Atualizar e mover partículas (neurônios)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bate e volta suave nas bordas da tela
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Reação sutil ao mouse (repulsão e atração elástica leve)
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 0.7;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // 2. Traçar Conexões Sinápticas (Arestas do Grafo Neural)
      const activePairs: [number, number, number][] = [];

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.22;
            activePairs.push([i, j, dist]);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Conexão sutil em ciano e ardósia técnica
            ctx.strokeStyle = `rgba(2, 132, 199, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // 3. Disparo de Pulsos de Dados Sinápticos (Sinais elétricos de IA)
      if (pulses.length < maxPulses && activePairs.length > 0 && Math.random() < 0.08) {
        const randomPair = activePairs[Math.floor(Math.random() * activePairs.length)];
        pulses.push({
          sourceIdx: randomPair[0],
          targetIdx: randomPair[1],
          progress: 0,
          speed: Math.random() * 0.018 + 0.012,
          color: Math.random() > 0.4 ? 'rgba(2, 132, 199, 0.85)' : 'rgba(5, 150, 105, 0.85)',
        });
      }

      // Renderizar Pulsos
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const p1 = particles[pulse.sourceIdx];
        const p2 = particles[pulse.targetIdx];
        if (!p1 || !p2) continue;

        const pulseX = p1.x + (p2.x - p1.x) * pulse.progress;
        const pulseY = p1.y + (p2.y - p1.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // 4. Renderizar Nós Neurais
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulseFactor = Math.sin(time * 2 + p.phase) * 0.2 + 0.8;
        const alpha = p.baseAlpha * pulseFactor;

        // Halo de dispersão em nós selecionados
        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(2, 132, 199, ${(alpha * 0.15).toFixed(3)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 23, 42, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* 1. Iluminação Ambiente Suave de Fundo (Aurora IA Latente) */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '8%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, rgba(56, 189, 248, 0.02) 50%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'neuralPulse 14s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '-8%',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.07) 0%, rgba(52, 211, 153, 0.02) 55%, transparent 75%)',
          filter: 'blur(80px)',
          animation: 'neuralPulse 16s ease-in-out infinite alternate-reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '30%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 2. Topografia de Otimização e Curvas de Espaço Latente (Loss Landscape) */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}
      >
        <defs>
          <linearGradient id="curve-gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
          </linearGradient>

          <pattern id="crosshair-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 40 36 L 40 44 M 36 40 L 44 40"
              stroke="#94a3b8"
              strokeWidth="0.8"
              strokeOpacity="0.2"
            />
          </pattern>
        </defs>

        {/* Marcadores de Coordenadas em Matriz Esparsa */}
        <rect width="100%" height="100%" fill="url(#crosshair-pattern)" />

        {/* Curvas Manifold / Superfícies de Decisão de IA */}
        <g fill="none" stroke="url(#curve-gradient-primary)" strokeWidth="1.2">
          <path d="M -100 220 C 350 120, 700 480, 1200 260 C 1600 110, 1900 390, 2300 210" />
          <path
            d="M -100 280 C 370 180, 720 540, 1220 320 C 1620 170, 1920 450, 2300 270"
            strokeDasharray="6 6"
            strokeOpacity="0.5"
          />
          <path d="M -100 680 C 420 500, 850 880, 1380 620 C 1780 440, 2050 720, 2300 580" strokeOpacity="0.7" />
        </g>
      </svg>

      {/* 3. Canvas Interativo de Grafo e Sinapses Neurais em Tempo Real */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};
