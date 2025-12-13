import React, { useEffect, useRef } from 'react';
import './ParticlesBackground.css';

const ParticlesBackground = ({ chaosMode = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = chaosMode ? 200 : 120;
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = chaosMode ? Math.random() * 4 + 1 : Math.random() * 2 + 0.5;
        this.speedX = chaosMode ? (Math.random() - 0.5) * 3 : Math.random() * 0.5 - 0.25;
        this.speedY = chaosMode ? (Math.random() - 0.5) * 3 : Math.random() * 0.5 - 0.25;
        this.opacity = chaosMode ? Math.random() * 0.8 + 0.3 : Math.random() * 0.5 + 0.2;
        this.chaosRotation = Math.random() * Math.PI * 2;
      }

      update() {
        if (chaosMode) {
          // Chaotic movement with rotation
          this.chaosRotation += (Math.random() - 0.5) * 0.2;
          this.speedX += (Math.random() - 0.5) * 0.3;
          this.speedY += (Math.random() - 0.5) * 0.3;
          
          // Limit speed
          this.speedX = Math.max(-5, Math.min(5, this.speedX));
          this.speedY = Math.max(-5, Math.min(5, this.speedY));
        }
        
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        const color = chaosMode ? 
          `rgba(${255 - Math.random() * 50}, ${100 + Math.random() * 50}, ${200 + Math.random() * 55}, ${this.opacity})` :
          `rgba(0, 217, 255, ${this.opacity})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function connectParticles() {
      const maxDistance = chaosMode ? 150 : 120;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * (chaosMode ? 0.3 : 0.2);
            const color = chaosMode ? 
              `rgba(${200 + Math.random() * 55}, ${100 + Math.random() * 50}, ${200 + Math.random() * 55}, ${opacity})` :
              `rgba(0, 217, 255, ${opacity})`;
            ctx.strokeStyle = color;
            ctx.lineWidth = chaosMode ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      connectParticles();
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [chaosMode]);

  return <canvas ref={canvasRef} id="particles-background" />;
};

export default ParticlesBackground;

