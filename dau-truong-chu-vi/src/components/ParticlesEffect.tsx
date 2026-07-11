import React, { useEffect, useRef } from 'react';

interface ParticlesEffectProps {
  type: 'confetti' | 'fireworks' | 'both' | 'none';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation?: number;
  rotationSpeed?: number;
  opacity: number;
  shape?: 'circle' | 'rect';
  trail?: { x: number; y: number }[];
}

export const ParticlesEffect: React.FC<ParticlesEffectProps> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF4444', '#44FF44', '#4444FF', '#FFA500', '#8A2BE2', '#FF1493'
    ];

    const createConfettiParticle = (x: number, y: number, angle: number, speed: number): Particle => {
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 3 + 2), // upward bias
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      };
    };

    const createFireworkSparks = (x: number, y: number) => {
      const sparksCount = 60;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < sparksCount; i++) {
        const angle = (i * 2 * Math.PI) / sparksCount + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 5 + 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.3 ? baseColor : colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 2,
          opacity: 1,
          shape: 'circle',
          trail: []
        });
      }
    };

    // Keep spawning new particles if types are active
    let confettiTimer = 0;
    let fireworkTimer = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Handle spawning
      if (type === 'confetti' || type === 'both') {
        confettiTimer++;
        if (confettiTimer % 8 === 0) {
          // Launch from bottom-left corner upwards and rightwards
          for (let i = 0; i < 4; i++) {
            particlesRef.current.push(
              createConfettiParticle(
                0, 
                canvas.height, 
                -Math.PI / 6 - Math.random() * (Math.PI / 4), 
                Math.random() * 10 + 12
              )
            );
          }
          // Launch from bottom-right corner upwards and leftwards
          for (let i = 0; i < 4; i++) {
            particlesRef.current.push(
              createConfettiParticle(
                canvas.width, 
                canvas.height, 
                -Math.PI * 5 / 6 + Math.random() * (Math.PI / 4), 
                Math.random() * 10 + 12
              )
            );
          }
        }
      }

      if (type === 'fireworks' || type === 'both') {
        fireworkTimer++;
        if (fireworkTimer % 45 === 0) {
          const fx = Math.random() * (canvas.width - 200) + 100;
          const fy = Math.random() * (canvas.height / 2 - 50) + 100;
          createFireworkSparks(fx, fy);
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        // Apply physics
        p.x += p.vx;
        p.y += p.vy;

        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
          // Confetti gravity
          p.vy += 0.15;
          p.vx *= 0.98;
          p.opacity -= 0.005;
        } else {
          // Firework spark physics
          p.vy += 0.08; // gravity
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.opacity -= 0.015;

          // Trail
          if (p.trail) {
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 5) {
              p.trail.shift();
            }
          }
        }

        if (p.opacity <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.opacity;

        // Draw trail if firework
        if (p.trail && p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size / 2;
          ctx.stroke();
        }

        // Draw body
        ctx.fillStyle = p.color;
        if (p.shape === 'rect' && p.rotation !== undefined) {
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    if (type !== 'none') {
      animationFrameIdRef.current = requestAnimationFrame(tick);
      
      // On start, if fireworks are requested, launch some immediately
      if (type === 'fireworks' || type === 'both') {
        const initialCount = 3;
        for (let i = 0; i < initialCount; i++) {
          setTimeout(() => {
            if (canvasRef.current) {
              const fx = Math.random() * (canvasRef.current.width - 200) + 100;
              const fy = Math.random() * (canvasRef.current.height / 2 - 50) + 100;
              createFireworkSparks(fx, fy);
            }
          }, i * 300);
        }
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [type]);

  if (type === 'none') return null;

  return (
    <canvas
      id="particles-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
};
