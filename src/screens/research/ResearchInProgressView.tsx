import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ResearchInProgressViewProps {
  onBack?: () => void;
}

/**
 * Full-screen "inverted waterfall" in-progress visual:
 * - Dark black background
 * - 5 white vertical lines, smooth curve flare to bottom
 * - Glowing elements moving along each line at different speeds
 */
export default function ResearchInProgressView({ onBack }: ResearchInProgressViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LINE_COUNT = 5;
    const TOP_SPACING_REM = 1;
    const BOTTOM_SPACING_REM = 20;
    const FLARE_START_RATIO = 0.8; // 60% from top
    const REM_PX = 16; // 1rem ≈ 16px
    const topSpacingPx = TOP_SPACING_REM * REM_PX;
    const bottomSpacingPx = BOTTOM_SPACING_REM * REM_PX;

    let animationId: number;
    let particles: Array<{
      lineIndex: number;
      y: number;
      speed: number;
      phase: number;
      radius: number;
    }> = [];

    function initParticles() {
      particles = [];
      const speeds = [0.15, 0.22, 0.18, 0.25, 0.12];
      for (let i = 0; i < LINE_COUNT; i++) {
        for (let j = 0; j < 3; j++) {
          particles.push({
            lineIndex: i,
            y: Math.random(),
            speed: speeds[i] * (0.8 + Math.random() * 0.4),
            phase: Math.random() * Math.PI * 2,
            radius: 4 + Math.random() * 6,
          });
        }
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const topTotalWidth = (LINE_COUNT - 1) * topSpacingPx;
      const bottomTotalWidth = (LINE_COUNT - 1) * bottomSpacingPx;
      const topStart = (w - topTotalWidth) / 2;
      const bottomStart = (w - bottomTotalWidth) / 2;
      const flareStartY = h * FLARE_START_RATIO;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Draw 5 lines as smooth curves (quadratic Bezier: vertical at top, bend, then to bottom)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      const k = FLARE_START_RATIO; // flareStartY / h
      for (let i = 0; i < LINE_COUNT; i++) {
        ctx.beginPath();
        const xTop = topStart + i * topSpacingPx;
        const xBottom = bottomStart + i * bottomSpacingPx;
        ctx.moveTo(xTop, 0);
        ctx.quadraticCurveTo(xTop, flareStartY, xBottom, h);
        ctx.stroke();
      }

      // Glowing elements along each curve (y is fraction 0..1 of height)
      const time = Date.now() / 1000;
      particles.forEach((p) => {
        const nextY = (p.y + p.speed * 0.016) % 1;
        p.y = nextY;
        // Solve quadratic for t so that y(t) = nextY: t^2(1-2k) + 2kt - nextY = 0
        const denom = 1 - 2 * k;
        const t = denom === 0
          ? Math.sqrt(nextY)
          : (-k + Math.sqrt(k * k + denom * nextY)) / denom;
        const tClamped = Math.max(0, Math.min(1, t));
        const xTop = topStart + p.lineIndex * topSpacingPx;
        const xBottom = bottomStart + p.lineIndex * bottomSpacingPx;
        const xPx = (1 - tClamped * tClamped) * xTop + tClamped * tClamped * xBottom;
        const yPx = 2 * (1 - tClamped) * tClamped * flareStartY + tClamped * tClamped * h;
        const pulse = 0.7 + 0.3 * Math.sin(time * 2 + p.phase);
        const gradient = ctx.createRadialGradient(xPx, yPx, 0, xPx, yPx, p.radius * 4);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * pulse})`);
        gradient.addColorStop(0.4, `rgba(200, 220, 255, ${0.4 * pulse})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(xPx, yPx, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <p className="text-white/80 text-sm font-medium">
          Research in progress…
        </p>
        <p className="text-white/50 text-xs max-w-sm text-center">
          Report runs in the background. Check the server terminal for logs. When done, refresh this page or go back to see updated findings.
        </p>
      </div>
    </div>
  );
}
