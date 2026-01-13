<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// Particle configuration
	const PARTICLE_COUNT = 80;
	const CONNECTION_DISTANCE = 150;
	const MOUSE_DISTANCE = 200;
	
	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let animationFrame: number;
	let particles: Particle[] = [];
	let mouse = { x: -1000, y: -1000 };
	let width = 0;
	let height = 0;

	// Warm iridescent palette
	const colors = [
		'rgba(244, 63, 94, 0.5)',   // Rose
		'rgba(217, 70, 239, 0.5)',  // Fuchsia
		'rgba(245, 158, 11, 0.5)',  // Amber
		'rgba(139, 92, 246, 0.5)'   // Violet
	];

	function resize() {
		if (canvas) {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
			initParticles();
		}
	}

	function initParticles() {
		particles = [];
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				size: Math.random() * 2 + 1,
				color: colors[Math.floor(Math.random() * colors.length)]
			});
		}
	}

	function animate() {
		if (!ctx) return;
		
		ctx.clearRect(0, 0, width, height);
		
		// Create a subtle gradient background
		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, '#1a0524'); // Deep purple
		gradient.addColorStop(0.5, '#2e1065'); // Violet dark
		gradient.addColorStop(1, '#4c0519'); // Rose dark
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Update and draw particles
		particles.forEach((p, i) => {
			// Move
			p.x += p.vx;
			p.y += p.vy;

			// Bounce off edges
			if (p.x < 0 || p.x > width) p.vx *= -1;
			if (p.y < 0 || p.y > height) p.vy *= -1;

			// Mouse interaction
			const dx = mouse.x - p.x;
			const dy = mouse.y - p.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < MOUSE_DISTANCE) {
				const forceDirectionX = dx / distance;
				const forceDirectionY = dy / distance;
				const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE;
				const directionX = forceDirectionX * force * 0.5;
				const directionY = forceDirectionY * force * 0.5;

				p.vx -= directionX;
				p.vy -= directionY;
			}

			// Draw particle
			ctx!.beginPath();
			ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx!.fillStyle = p.color;
			ctx!.fill();

			// Draw connections
			for (let j = i + 1; j < particles.length; j++) {
				const p2 = particles[j];
				const dx2 = p.x - p2.x;
				const dy2 = p.y - p2.y;
				const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

				if (dist2 < CONNECTION_DISTANCE) {
					ctx!.beginPath();
					ctx!.strokeStyle = `rgba(255, 200, 200, ${1 - dist2 / CONNECTION_DISTANCE})`;
					ctx!.lineWidth = 0.5;
					ctx!.moveTo(p.x, p.y);
					ctx!.lineTo(p2.x, p2.y);
					ctx!.stroke();
				}
			}
		});

		animationFrame = requestAnimationFrame(animate);
	}

	function handleMouseMove(e: MouseEvent) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	}

	onMount(() => {
		if (browser) {
			ctx = canvas.getContext('2d');
			window.addEventListener('resize', resize);
			window.addEventListener('mousemove', handleMouseMove);
			resize();
			animate();
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', handleMouseMove);
			cancelAnimationFrame(animationFrame);
		}
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 -z-10 h-full w-full object-cover transition-colors duration-1000"
></canvas>

<style>
	/* Subtle noise overlay */
	canvas::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
		opacity: 0.1;
		pointer-events: none;
	}
</style>
