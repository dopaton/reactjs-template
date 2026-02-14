import { type FC, useCallback, useRef, useEffect } from 'react';
import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js';
import { useGameStore } from '@/game/store';
import { cn } from '@/lib/cn';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  scale: number;
  life: number;
  color: number;
}

export const PixiCoin: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const coinGraphicRef = useRef<Graphics | null>(null);
  const coinContainerRef = useRef<Container | null>(null);

  const state = useGameStore(s => s.state);
  const tap = useGameStore(s => s.tap);
  const floatingTexts = useGameStore(s => s.floatingTexts);
  const hasEnergy = state ? state.energy >= state.tapPower : false;

  // Initialize PixiJS
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const initPixi = async () => {
      const app = new Application();
      await app.init({
        canvas: canvasRef.current!,
        width: 280,
        height: 280,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      appRef.current = app;

      // Main coin container
      const coinContainer = new Container();
      coinContainer.x = 140;
      coinContainer.y = 140;
      coinContainerRef.current = coinContainer;
      app.stage.addChild(coinContainer);

      // Outer glow
      const glow = new Graphics();
      glow.circle(0, 0, 105);
      glow.fill({ color: 0xffd700, alpha: 0.15 });
      coinContainer.addChild(glow);

      // Coin shadow
      const shadow = new Graphics();
      shadow.ellipse(0, 10, 85, 20);
      shadow.fill({ color: 0x000000, alpha: 0.2 });
      coinContainer.addChild(shadow);

      // Main coin body
      const coin = new Graphics();
      // Outer ring
      coin.circle(0, 0, 92);
      coin.fill(0xffaa00);
      // Inner circle
      coin.circle(0, 0, 82);
      coin.fill(0xffd700);
      // Ring detail
      coin.circle(0, 0, 72);
      coin.stroke({ color: 0xffaa00, width: 2, alpha: 0.5 });
      // Center highlight
      coin.circle(-15, -15, 30);
      coin.fill({ color: 0xffffff, alpha: 0.15 });

      coinGraphicRef.current = coin;
      coinContainer.addChild(coin);

      // Dollar sign text on coin
      const dollarStyle = new TextStyle({
        fontFamily: 'Arial Black, Arial',
        fontSize: 60,
        fontWeight: 'bold',
        fill: 0xffec80,
        stroke: { color: '#cc8800', width: 3 },
        dropShadow: {
          color: '#000000',
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
        },
      });
      const dollarText = new Text({ text: '$', style: dollarStyle });
      dollarText.anchor.set(0.5);
      coinContainer.addChild(dollarText);

      // Sparkle particles container
      const sparkleContainer = new Container();
      app.stage.addChild(sparkleContainer);

      // Animation loop
      let pulseTime = 0;
      app.ticker.add((ticker) => {
        pulseTime += ticker.deltaTime * 0.02;

        // Coin pulse
        const pulseScale = 1 + Math.sin(pulseTime * 2) * 0.02;
        coinContainer.scale.set(pulseScale);

        // Glow oscillation
        glow.alpha = 0.15 + Math.sin(pulseTime * 3) * 0.1;

        // Update particles
        sparkleContainer.removeChildren();
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravity
          p.life -= 0.02;
          p.alpha = Math.max(0, p.life);
          p.scale *= 0.98;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          const pg = new Graphics();
          pg.circle(0, 0, 4 * p.scale);
          pg.fill({ color: p.color, alpha: p.alpha });
          pg.x = p.x;
          pg.y = p.y;
          sparkleContainer.addChild(pg);
        }
      });

    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // Tap bounce animation
  const animateTap = useCallback(() => {
    const container = coinContainerRef.current;
    if (!container) return;

    // Quick scale bounce
    container.scale.set(0.9);
    setTimeout(() => container.scale.set(1.05), 60);
    setTimeout(() => container.scale.set(1.0), 120);
  }, []);

  // Spawn particles on tap
  const spawnParticles = useCallback((x: number, y: number) => {
    const colors = [0xffd700, 0xffaa00, 0xffec80, 0xffffff, 0x4ecdc4];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        scale: 0.5 + Math.random() * 1,
        life: 0.6 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, []);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current || !hasEnergy) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Fire particles at tap point (canvas coords)
    spawnParticles(x * (window.devicePixelRatio || 1), y * (window.devicePixelRatio || 1));
    animateTap();
    tap(x, y);
  }, [tap, hasEnergy, spawnParticles, animateTap]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      handleInteraction(touch.clientX, touch.clientY);
    }
  }, [handleInteraction]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Canvas wrapper */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={cn(
            'w-[280px] h-[280px] cursor-pointer',
            !hasEnergy && 'opacity-50 cursor-not-allowed grayscale-[50%]',
          )}
          onTouchStart={hasEnergy ? handleTouchStart : undefined}
          onClick={hasEnergy ? handleClick : undefined}
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        />

        {/* Floating texts overlay */}
        {floatingTexts.map((ft) => (
          <span
            key={ft.id}
            className="absolute pointer-events-none text-2xl font-extrabold text-coin animate-float-up z-10"
            style={{
              left: ft.x,
              top: ft.y,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            +{ft.value}
          </span>
        ))}
      </div>
    </div>
  );
};
