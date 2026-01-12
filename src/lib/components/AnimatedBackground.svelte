<script>
	import { onMount } from 'svelte';

	let canvas;
	let container;
	
	onMount(() => {
		const ctx = canvas.getContext('2d');
		let animationFrameId;
		let particles = [];
		let width, height;

		const resize = () => {
			if (!container) return;
			width = container.clientWidth;
			height = container.clientHeight;
			canvas.width = width;
			canvas.height = height;
			initParticles();
		};

		const initParticles = () => {
			particles = [];
			const particleCount = Math.min(60, Math.floor((width * height) / 15000));
			
			for (let i = 0; i < particleCount; i++) {
				particles.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: Math.random() * 2 + 1, // Slightly larger
					vx: (Math.random() - 0.5) * 0.5,
					vy: (Math.random() - 0.5) * 0.5,
					color: Math.random() > 0.5 ? 'rgba(59, 130, 246, ' : 'rgba(147, 51, 234, ' // Blue or Purple
				});
			}
		};

		const draw = () => {
			ctx.clearRect(0, 0, width, height);
			
			// Draw particles
			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;

				if (p.x < 0) p.x = width;
				if (p.x > width) p.x = 0;
				if (p.y < 0) p.y = height;
				if (p.y > height) p.y = 0;

				ctx.beginPath();
				const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
				gradient.addColorStop(0, p.color + '0.4)');
				gradient.addColorStop(1, p.color + '0)');
				ctx.fillStyle = gradient;
				ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
				ctx.fill();

				ctx.beginPath();
				ctx.fillStyle = p.color + '0.8)';
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fill();
			});
			
			// Connect particles
			ctx.strokeStyle = 'rgba(100, 116, 139, 0.05)';
			ctx.lineWidth = 1;
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < 150) {
						ctx.beginPath();
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.stroke();
					}
				}
			}

			animationFrameId = requestAnimationFrame(draw);
		};

		window.addEventListener('resize', resize);
		resize(); // Initial sizing
		draw(); // Start animation

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<div bind:this={container} class="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-slate-950">
	<!-- Gradient Background -->
	<div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f1020] to-[#1e1b4b]"></div>
	
	<!-- Glow Orbs -->
	<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow"></div>
	<div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow" style="animation-delay: 2s;"></div>
	
	<canvas bind:this={canvas} class="absolute inset-0 opacity-60"></canvas>
</div>

<style>
	.animate-pulse-slow {
		animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	@keyframes pulse-slow {
		0%, 100% { opacity: 0.1; transform: scale(1); }
		50% { opacity: 0.3; transform: scale(1.1); }
	}
</style>
