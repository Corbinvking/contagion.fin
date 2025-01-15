import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  color?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  color = 'rgb(0, 247, 195)' // Default primary color
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      life: number;
      maxLife: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createParticle = () => {
      const size = Math.random() * 2 + 1;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: Math.random() * 100 + 100
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particles.length < 50) {
        particles.push(createParticle());
      }

      // Update and draw particles
      particles = particles.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life++;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Calculate opacity based on life
        const opacity = Math.sin((particle.life / particle.maxLife) * Math.PI);

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${opacity * 0.2})`);
        ctx.fill();

        // Remove dead particles
        return particle.life < particle.maxLife;
      });

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'blur(1px)' }}
    />
  );
};

export default ParticleBackground;