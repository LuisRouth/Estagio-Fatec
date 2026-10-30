'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'ai' | 'esg';
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

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const EcoTechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

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

    // Partículas da Rede Simbiótica (IA & ESG) - Densidade ampliada para maior dinamismo
    const particleCount = Math.max(42, Math.floor(Math.min(width, 1920) / 20));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.4 + 1.1,
        type: i % 2 === 0 ? 'esg' : 'ai',
        baseAlpha: Math.random() * 0.2 + 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const pulses: Pulse[] = [];
    const maxPulses = 6;
    const shockwaves: Shockwave[] = [];

    // Rastreamento suave do cursor
    let targetMouseX = width / 2;
    let targetMouseY = height / 3;
    let currentMouseX = width / 2;
    let currentMouseY = height / 3;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    // ====================================================================
    // CLIQUE NO FUNDO: ONDA SUAVE DE ONDULAÇÃO (SEM LINHAS QUEBRADAS)
    // ====================================================================
    const handleGlobalClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      // 1. Onda sutil de água que se espalha em tom neutro suave
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: 150,
        alpha: 0.35, // Força bem mais suave
      });

      // 2. Leve empurrão nos nós vizinhos
      const pushRadius = 160;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.hypot(dx, dy);

        if (dist < pushRadius && dist > 0) {
          const force = (1 - dist / pushRadius) * 2.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleGlobalClick);

    let time = 0;

    // Ondas Neutras e Suaves (SEM CORES FORTES, APENAS ARDÓSIA / CINZA SUTIL)
    const waveLayers = [
      {
        baseY: 0.3,
        amplitude: 20, // Reduzida a força das ondas
        frequency: 0.0014,
        speed: 0.005,
        stroke: 'rgba(148, 163, 184, 0.09)', // Cinza ardósia suave
        dash: [0],
        width: 1,
      },
      {
        baseY: 0.34,
        amplitude: 24,
        frequency: 0.0012,
        speed: 0.003,
        stroke: 'rgba(148, 163, 184, 0.06)',
        dash: [5, 7],
        width: 0.9,
      },
      {
        baseY: 0.68,
        amplitude: 22,
        frequency: 0.0013,
        speed: -0.004,
        stroke: 'rgba(148, 163, 184, 0.08)',
        dash: [0],
        width: 1,
      },
      {
        baseY: 0.72,
        amplitude: 18,
        frequency: 0.0016,
        speed: -0.003,
        stroke: 'rgba(148, 163, 184, 0.05)',
        dash: [6, 8],
        width: 0.9,
      },
    ];

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      // 1. Efeito Sutil de Luz no Cursor
      if (mouseActive) {
        const glow = ctx.createRadialGradient(
          currentMouseX,
          currentMouseY,
          0,
          currentMouseX,
          currentMouseY,
          200
        );
        glow.addColorStop(0, 'rgba(2, 132, 199, 0.04)');
        glow.addColorStop(0.5, 'rgba(5, 150, 105, 0.02)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Ondas Neutras e Calmas (Monocromáticas em Ardósia Fina)
      waveLayers.forEach((wave) => {
        ctx.save();
        ctx.beginPath();
        if (wave.dash[0] > 0) {
          ctx.setLineDash(wave.dash);
        }

        const startY = height * wave.baseY;
        const waveTime = time * wave.speed * 30;

        for (let x = 0; x <= width; x += 18) {
          const y =
            startY +
            Math.sin(x * wave.frequency + waveTime) * wave.amplitude +
            Math.cos(x * wave.frequency * 0.5 - waveTime * 0.5) * (wave.amplitude * 0.3);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = wave.stroke;
        ctx.lineWidth = wave.width;
        ctx.stroke();
        ctx.restore();
      });

      // 3. Ondas de Choque Sutis ao Clicar (Suaves, Sem Cores Agressivas)
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 3.5;
        sw.alpha = Math.max(0, 0.35 * (1 - sw.radius / sw.maxRadius));

        if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${sw.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Mover Partículas
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.98;
        p.vy *= 0.98;

        if (Math.abs(p.vx) < 0.08) p.vx = (Math.random() - 0.5) * 0.22;
        if (Math.abs(p.vy) < 0.08) p.vy = (Math.random() - 0.5) * 0.22;

        // Envoltório Toroidal Contínuo: o neurônio nunca some nem quica bruscamente;
        // ao cruzar uma borda da tela com margem de segurança, reaparece do lado oposto.
        const margin = 24;
        if (p.x < -margin) {
          p.x = width + margin;
        } else if (p.x > width + margin) {
          p.x = -margin;
        }

        if (p.y < -margin) {
          p.y = height + margin;
        } else if (p.y > height + margin) {
          p.y = -margin;
        }

        const dx = p.x - currentMouseX;
        const dy = p.y - currentMouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 110 && dist > 0) {
          const force = (1 - dist / 110) * 0.35;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // 5. Conexões de Rede Simbiótica
      const connectionDist = 120;
      const activePairs: [number, number][] = [];

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDist) {
            activePairs.push([i, j]);
            const alpha = (1 - dist / connectionDist) * 0.14;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            if (p1.type === 'esg' && p2.type === 'esg') {
              ctx.strokeStyle = `rgba(5, 150, 105, ${alpha.toFixed(3)})`;
            } else if (p1.type === 'ai' && p2.type === 'ai') {
              ctx.strokeStyle = `rgba(2, 132, 199, ${alpha.toFixed(3)})`;
            } else {
              ctx.strokeStyle = `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
            }

            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 6. Pulsos Lentos e Calmos
      if (pulses.length < maxPulses && activePairs.length > 0 && Math.random() < 0.04) {
        const pair = activePairs[Math.floor(Math.random() * activePairs.length)];
        const p1 = particles[pair[0]];
        pulses.push({
          sourceIdx: pair[0],
          targetIdx: pair[1],
          progress: 0,
          speed: Math.random() * 0.012 + 0.008,
          color: p1.type === 'esg' ? 'rgba(5, 150, 105, 0.65)' : 'rgba(2, 132, 199, 0.65)',
        });
      }

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

        const px = p1.x + (p2.x - p1.x) * pulse.progress;
        const py = p1.y + (p2.y - p1.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.fill();
      }

      // 7. Desenhar Nós
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulseFactor = Math.sin(time * 2 + p.phase) * 0.15 + 0.85;
        const alpha = p.baseAlpha * pulseFactor;

        const color =
          p.type === 'esg'
            ? `rgba(5, 150, 105, ${alpha.toFixed(3)})`
            : `rgba(2, 132, 199, ${alpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleGlobalClick);
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
      {/* Iluminação Suave de Aurora Atmosférica Discreta */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          left: '10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.05) 0%, transparent 65%)',
          filter: 'blur(75px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '-6%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Canvas Interativo Calmo */}
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
