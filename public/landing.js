// HTW 2025 Landing Page JavaScript
// Handles animations, interactions, and data visualizations

// Import the CSS
import './landing.css';

// State management
let animationFrameId = null;
let isCountingUp = false;

// Utility functions
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        const current = Math.floor(start + (target - start) * easedProgress);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
            element.classList.add('animate-counter');
        }
    }
    
    requestAnimationFrame(update);
}

// Initialize metric counters
function initMetricCounters() {
    if (isCountingUp) return;
    isCountingUp = true;
    
    const metrics = document.querySelectorAll('.metric-number[data-target]');
    
    metrics.forEach((metric, index) => {
        const target = parseInt(metric.dataset.target);
        setTimeout(() => {
            animateNumber(metric, target);
        }, index * 200);
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger metric animation when hero metrics come into view
                if (entry.target.classList.contains('hero-metrics') && !isCountingUp) {
                    setTimeout(initMetricCounters, 500);
                }
                
                // Trigger chart animations when impact cards come into view
                if (entry.target.classList.contains('impact-card')) {
                    const chartId = entry.target.querySelector('.card-chart')?.id;
                    if (chartId && entry.target.querySelector('.card-chart svg')) {
                        setTimeout(() => {
                            triggerChartAnimation(chartId);
                        }, 300);
                    }
                }
                
                // Trigger stat bar animations
                if (entry.target.classList.contains('stat-item')) {
                    setTimeout(() => {
                        const bar = entry.target.querySelector('.stat-bar');
                        if (bar) {
                            bar.style.transform = 'scaleX(1)';
                        }
                    }, 300);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .hero-content,
        .hero-visual,
        .hero-metrics,
        .section-header,
        .impact-card,
        .stats-category,
        .stat-item,
        .insight-callout,
        .cta-content
    `);
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const scrollButton = document.getElementById('scroll-to-stats');
    const targetSection = document.getElementById('global-impact');
    
    if (scrollButton && targetSection) {
        scrollButton.addEventListener('click', (e) => {
            e.preventDefault();
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
}

// Navigation scroll effect
function initNavigationEffects() {
    const nav = document.querySelector('.nav-header');
    let lastScrollY = window.scrollY;
    
    function updateNavigation() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            nav.style.background = 'rgba(250, 252, 255, 0.98)';
            nav.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(250, 252, 255, 0.95)';
            nav.style.boxShadow = 'none';
        }
        
        // Hide/show nav on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    }
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateNavigation();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Simple globe visualization
function initGlobeVisualization() {
    const globeContainer = document.getElementById('landing-globe');
    if (!globeContainer) return;
    
    // Create a simple animated globe representation
    const globe = document.createElement('div');
    globe.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: 
            radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, var(--htw-deep-sea) 0%, var(--htw-pacific-teal) 100%);
        position: relative;
        overflow: hidden;
        animation: globeRotate 20s linear infinite;
    `;
    
    // Add rotating overlay pattern
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 200%;
        height: 100%;
        background: 
            repeating-linear-gradient(
                90deg,
                transparent 0px,
                rgba(0, 212, 255, 0.1) 1px,
                transparent 2px,
                transparent 20px
            );
        animation: globePattern 15s linear infinite;
    `;
    
    // Add connection points
    for (let i = 0; i < 12; i++) {
        const point = document.createElement('div');
        const angle = (i / 12) * 360;
        const radius = 45 + Math.random() * 10;
        
        point.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: var(--htw-cyan);
            box-shadow: 0 0 8px var(--htw-cyan);
            left: ${50 + radius * Math.cos(angle * Math.PI / 180)}%;
            top: ${50 + radius * Math.sin(angle * Math.PI / 180)}%;
            transform: translate(-50%, -50%);
            animation: pointPulse ${2 + Math.random() * 2}s ease-in-out infinite alternate;
        `;
        
        globe.appendChild(point);
    }
    
    globe.appendChild(overlay);
    globeContainer.appendChild(globe);
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes globeRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @keyframes globePattern {
            from { transform: translateX(-50%); }
            to { transform: translateX(0%); }
        }
        
        @keyframes pointPulse {
            from { 
                opacity: 0.5; 
                transform: translate(-50%, -50%) scale(1);
            }
            to { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1.5);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize stat bar animations
function initStatBars() {
    const statBars = document.querySelectorAll('.stat-bar');
    
    statBars.forEach(bar => {
        bar.style.transformOrigin = 'left center';
        bar.style.transform = 'scaleX(0)';
        bar.style.transition = 'transform 1.5s ease-out';
    });
}

// Trigger chart animations when they come into view
function triggerChartAnimation(chartId) {
    const chart = document.getElementById(chartId);
    if (!chart) return;
    
    const svg = chart.querySelector('svg');
    if (!svg) return;
    
    // Restart all animations in the SVG
    const animations = svg.querySelectorAll('animate, animateTransform');
    animations.forEach(anim => {
        anim.beginElement();
    });
}

// Initialize chart visualizations
function initChartVisualizations() {
    createGlobalReachChart();
    createHawaiiChart();
    createIndustryChart();
}

// Global Reach Chart - World Map with Connection Lines
function createGlobalReachChart() {
    const container = document.getElementById('global-chart');
    if (!container) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 300 200');
    svg.style.background = 'var(--htw-soft-blue)';
    
    // World map simplified paths
    const worldPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    worldPath.setAttribute('d', 'M50,80 Q80,60 120,70 Q160,65 200,75 Q240,70 270,85 L270,120 Q240,140 200,135 Q160,145 120,140 Q80,150 50,130 Z M80,100 Q100,90 130,95 Q160,90 180,100 L180,115 Q160,125 130,120 Q100,130 80,115 Z');
    worldPath.setAttribute('fill', 'var(--htw-deep-sea)');
    worldPath.setAttribute('opacity', '0.3');
    
    // Connection points (major countries)
    const connections = [
        { x: 90, y: 105, country: 'USA', participants: 2224, delay: 0 },
        { x: 140, y: 95, country: 'Canada', participants: 8, delay: 0.2 },
        { x: 200, y: 90, country: 'Israel', participants: 2, delay: 0.4 },
        { x: 220, y: 110, country: 'Philippines', participants: 2, delay: 0.6 },
        { x: 250, y: 100, country: 'Australia', participants: 1, delay: 0.8 }
    ];
    
    svg.appendChild(worldPath);
    
    // Hawaii center point
    const hawaiiPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hawaiiPoint.setAttribute('cx', '90');
    hawaiiPoint.setAttribute('cy', '130');
    hawaiiPoint.setAttribute('r', '8');
    hawaiiPoint.setAttribute('fill', 'var(--htw-cyan)');
    hawaiiPoint.setAttribute('stroke', 'white');
    hawaiiPoint.setAttribute('stroke-width', '2');
    
    // Pulsing animation for Hawaii
    const hawaiiPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hawaiiPulse.setAttribute('cx', '90');
    hawaiiPulse.setAttribute('cy', '130');
    hawaiiPulse.setAttribute('r', '8');
    hawaiiPulse.setAttribute('fill', 'none');
    hawaiiPulse.setAttribute('stroke', 'var(--htw-cyan)');
    hawaiiPulse.setAttribute('stroke-width', '2');
    hawaiiPulse.setAttribute('opacity', '0.6');
    
    const pulseAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    pulseAnim.setAttribute('attributeName', 'r');
    pulseAnim.setAttribute('values', '8;20;8');
    pulseAnim.setAttribute('dur', '3s');
    pulseAnim.setAttribute('repeatCount', 'indefinite');
    
    const pulseOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    pulseOpacity.setAttribute('attributeName', 'opacity');
    pulseOpacity.setAttribute('values', '0.6;0;0.6');
    pulseOpacity.setAttribute('dur', '3s');
    pulseOpacity.setAttribute('repeatCount', 'indefinite');
    
    hawaiiPulse.appendChild(pulseAnim);
    hawaiiPulse.appendChild(pulseOpacity);
    
    svg.appendChild(hawaiiPulse);
    svg.appendChild(hawaiiPoint);
    
    // Connection lines and points
    connections.forEach((conn, index) => {
        // Connection line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '90');
        line.setAttribute('y1', '130');
        line.setAttribute('x2', conn.x);
        line.setAttribute('y2', conn.y);
        line.setAttribute('stroke', 'var(--htw-tech-blue)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('opacity', '0.4');
        line.setAttribute('stroke-dasharray', '5,5');
        
        // Animated dash
        const dashAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        dashAnim.setAttribute('attributeName', 'stroke-dashoffset');
        dashAnim.setAttribute('values', '10;0');
        dashAnim.setAttribute('dur', '2s');
        dashAnim.setAttribute('repeatCount', 'indefinite');
        dashAnim.setAttribute('begin', `${conn.delay}s`);
        
        line.appendChild(dashAnim);
        svg.appendChild(line);
        
        // Country point
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', conn.x);
        point.setAttribute('cy', conn.y);
        point.setAttribute('r', Math.max(3, Math.log(conn.participants) * 1.5));
        point.setAttribute('fill', 'var(--htw-tech-blue)');
        point.setAttribute('stroke', 'white');
        point.setAttribute('stroke-width', '1');
        
        // Scale animation
        const scaleAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        scaleAnim.setAttribute('attributeName', 'transform');
        scaleAnim.setAttribute('type', 'scale');
        scaleAnim.setAttribute('values', '0;1;1');
        scaleAnim.setAttribute('dur', '1s');
        scaleAnim.setAttribute('begin', `${conn.delay + 0.5}s`);
        scaleAnim.setAttribute('fill', 'freeze');
        
        point.appendChild(scaleAnim);
        svg.appendChild(point);
        
        // Country label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', conn.x);
        label.setAttribute('y', conn.y - 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', '600');
        label.setAttribute('fill', 'var(--htw-deep-sea)');
        label.textContent = conn.country;
        label.style.opacity = '0';
        
        // Label fade in
        const labelAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        labelAnim.setAttribute('attributeName', 'opacity');
        labelAnim.setAttribute('values', '0;1');
        labelAnim.setAttribute('dur', '0.5s');
        labelAnim.setAttribute('begin', `${conn.delay + 1}s`);
        labelAnim.setAttribute('fill', 'freeze');
        
        label.appendChild(labelAnim);
        svg.appendChild(label);
    });
    
    container.appendChild(svg);
}

// Hawaii Islands Chart - Archipelago with Distribution
function createHawaiiChart() {
    const container = document.getElementById('hawaii-chart');
    if (!container) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 300 200');
    svg.style.background = 'linear-gradient(180deg, var(--htw-soft-blue) 0%, var(--htw-light-cyan) 100%)';
    
    // Hawaiian Islands data
    const islands = [
        { name: 'Oahu', x: 150, y: 100, size: 25, participants: 1850, color: 'var(--htw-tech-blue)' },
        { name: 'Hawaii (Big Island)', x: 220, y: 120, size: 20, participants: 100, color: 'var(--htw-ocean-blue)' },
        { name: 'Maui', x: 180, y: 90, size: 15, participants: 35, color: 'var(--htw-pacific-teal)' },
        { name: 'Kauai', x: 120, y: 85, size: 12, participants: 12, color: 'var(--htw-medium-blue)' },
        { name: 'Molokai', x: 160, y: 85, size: 8, participants: 3, color: 'var(--htw-deep-sea)' },
        { name: 'Lanai', x: 170, y: 95, size: 6, participants: 2, color: 'var(--htw-deep-sea)' }
    ];
    
    // Ocean waves background
    const waves = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    waves.setAttribute('d', 'M0,150 Q75,140 150,150 T300,150 L300,200 L0,200 Z');
    waves.setAttribute('fill', 'rgba(0, 212, 255, 0.1)');
    waves.setAttribute('opacity', '0.5');
    
    const waveAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
    waveAnim.setAttribute('attributeName', 'transform');
    waveAnim.setAttribute('type', 'translate');
    waveAnim.setAttribute('values', '0,0; 10,2; 0,0');
    waveAnim.setAttribute('dur', '4s');
    waveAnim.setAttribute('repeatCount', 'indefinite');
    
    waves.appendChild(waveAnim);
    svg.appendChild(waves);
    
    islands.forEach((island, index) => {
        // Island shape
        const islandGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const islandShape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        islandShape.setAttribute('cx', island.x);
        islandShape.setAttribute('cy', island.y);
        islandShape.setAttribute('rx', island.size);
        islandShape.setAttribute('ry', island.size * 0.8);
        islandShape.setAttribute('fill', island.color);
        islandShape.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
        islandShape.setAttribute('stroke-width', '1');
        
        // Growth animation
        const growAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        growAnim.setAttribute('attributeName', 'transform');
        growAnim.setAttribute('type', 'scale');
        growAnim.setAttribute('values', '0;1.2;1');
        growAnim.setAttribute('dur', '1.5s');
        growAnim.setAttribute('begin', `${index * 0.3}s`);
        growAnim.setAttribute('fill', 'freeze');
        
        islandShape.appendChild(growAnim);
        
        // Participant count visualization
        const participantCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        participantCircle.setAttribute('cx', island.x);
        participantCircle.setAttribute('cy', island.y - island.size - 10);
        participantCircle.setAttribute('r', Math.max(5, Math.log(island.participants) * 2));
        participantCircle.setAttribute('fill', 'var(--htw-cyan)');
        participantCircle.setAttribute('stroke', 'white');
        participantCircle.setAttribute('stroke-width', '2');
        participantCircle.setAttribute('opacity', '0.9');
        
        // Pulse animation for participant indicator
        const pulseAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        pulseAnim.setAttribute('attributeName', 'r');
        pulseAnim.setAttribute('values', `${Math.max(5, Math.log(island.participants) * 2)};${Math.max(8, Math.log(island.participants) * 2.5)};${Math.max(5, Math.log(island.participants) * 2)}`);
        pulseAnim.setAttribute('dur', '2s');
        pulseAnim.setAttribute('repeatCount', 'indefinite');
        pulseAnim.setAttribute('begin', `${index * 0.3 + 1}s`);
        
        participantCircle.appendChild(pulseAnim);
        
        // Island label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', island.x);
        label.setAttribute('y', island.y + island.size + 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '9');
        label.setAttribute('font-weight', '600');
        label.setAttribute('fill', 'var(--htw-deep-sea)');
        label.textContent = island.name;
        
        // Participant count
        const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        count.setAttribute('x', island.x);
        count.setAttribute('y', island.y + island.size + 25);
        count.setAttribute('text-anchor', 'middle');
        count.setAttribute('font-size', '8');
        count.setAttribute('font-weight', '500');
        count.setAttribute('fill', 'var(--htw-medium-blue)');
        count.textContent = `${island.participants}`;
        
        // Fade in animations
        [label, count].forEach((element, i) => {
            element.style.opacity = '0';
            const fadeAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            fadeAnim.setAttribute('attributeName', 'opacity');
            fadeAnim.setAttribute('values', '0;1');
            fadeAnim.setAttribute('dur', '0.5s');
            fadeAnim.setAttribute('begin', `${index * 0.3 + 1.5 + i * 0.2}s`);
            fadeAnim.setAttribute('fill', 'freeze');
            element.appendChild(fadeAnim);
        });
        
        islandGroup.appendChild(islandShape);
        islandGroup.appendChild(participantCircle);
        islandGroup.appendChild(label);
        islandGroup.appendChild(count);
        
        svg.appendChild(islandGroup);
    });
    
    container.appendChild(svg);
}

// Industry Diversity Chart - Circular/Radial Chart
function createIndustryChart() {
    const container = document.getElementById('industry-chart');
    if (!container) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 300 200');
    svg.style.background = 'var(--htw-soft-blue)';
    
    // Industry data (top 8 industries)
    const industries = [
        { name: 'Software & Tech', participants: 380, color: 'var(--htw-tech-blue)', angle: 0 },
        { name: 'Education', participants: 215, color: 'var(--htw-cyan)', angle: 60 },
        { name: 'Consulting', participants: 169, color: 'var(--htw-ocean-blue)', angle: 120 },
        { name: 'Healthcare', participants: 118, color: 'var(--htw-pacific-teal)', angle: 180 },
        { name: 'Finance', participants: 95, color: 'var(--htw-medium-blue)', angle: 240 },
        { name: 'Government', participants: 78, color: 'var(--htw-deep-sea)', angle: 300 },
        { name: 'Media', participants: 65, color: 'var(--htw-light-cyan)', angle: 30 },
        { name: 'Others', participants: 477, color: 'rgba(0, 51, 102, 0.6)', angle: 90 }
    ];
    
    const centerX = 150;
    const centerY = 100;
    const maxRadius = 70;
    const minRadius = 20;
    
    // Background circles
    for (let i = 1; i <= 3; i++) {
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', centerX);
        bgCircle.setAttribute('cy', centerY);
        bgCircle.setAttribute('r', minRadius + (maxRadius - minRadius) * (i / 3));
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', 'rgba(0, 51, 102, 0.1)');
        bgCircle.setAttribute('stroke-width', '1');
        svg.appendChild(bgCircle);
    }
    
    // Center point
    const centerPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerPoint.setAttribute('cx', centerX);
    centerPoint.setAttribute('cy', centerY);
    centerPoint.setAttribute('r', '8');
    centerPoint.setAttribute('fill', 'var(--htw-tech-blue)');
    centerPoint.setAttribute('stroke', 'white');
    centerPoint.setAttribute('stroke-width', '2');
    svg.appendChild(centerPoint);
    
    industries.forEach((industry, index) => {
        // Calculate position
        const radius = minRadius + ((industry.participants / 380) * (maxRadius - minRadius));
        const angle = (index * 45) * (Math.PI / 180); // Distribute evenly
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Industry point
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', x);
        point.setAttribute('cy', y);
        point.setAttribute('r', Math.max(4, Math.log(industry.participants) * 1.8));
        point.setAttribute('fill', industry.color);
        point.setAttribute('stroke', 'white');
        point.setAttribute('stroke-width', '1.5');
        
        // Connection line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', industry.color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.4');
        
        // Animated line drawing
        const lineLength = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        line.setAttribute('stroke-dasharray', `${lineLength}`);
        line.setAttribute('stroke-dashoffset', `${lineLength}`);
        
        const lineAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        lineAnim.setAttribute('attributeName', 'stroke-dashoffset');
        lineAnim.setAttribute('values', `${lineLength};0`);
        lineAnim.setAttribute('dur', '1s');
        lineAnim.setAttribute('begin', `${index * 0.2}s`);
        lineAnim.setAttribute('fill', 'freeze');
        
        line.appendChild(lineAnim);
        
        // Point scale animation
        const scaleAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        scaleAnim.setAttribute('attributeName', 'transform');
        scaleAnim.setAttribute('type', 'scale');
        scaleAnim.setAttribute('values', '0;1.3;1');
        scaleAnim.setAttribute('dur', '0.8s');
        scaleAnim.setAttribute('begin', `${index * 0.2 + 0.5}s`);
        scaleAnim.setAttribute('fill', 'freeze');
        
        point.appendChild(scaleAnim);
        
        // Label (for top 4 industries)
        if (index < 4) {
            const labelX = x + (x > centerX ? 15 : -15);
            const labelY = y - 5;
            
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);
            label.setAttribute('text-anchor', x > centerX ? 'start' : 'end');
            label.setAttribute('font-size', '8');
            label.setAttribute('font-weight', '600');
            label.setAttribute('fill', 'var(--htw-deep-sea)');
            label.textContent = industry.name;
            
            const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            count.setAttribute('x', labelX);
            count.setAttribute('y', labelY + 10);
            count.setAttribute('text-anchor', x > centerX ? 'start' : 'end');
            count.setAttribute('font-size', '7');
            count.setAttribute('font-weight', '500');
            count.setAttribute('fill', 'var(--htw-medium-blue)');
            count.textContent = `${industry.participants}`;
            
            // Fade in labels
            [label, count].forEach((element, i) => {
                element.style.opacity = '0';
                const fadeAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                fadeAnim.setAttribute('attributeName', 'opacity');
                fadeAnim.setAttribute('values', '0;1');
                fadeAnim.setAttribute('dur', '0.5s');
                fadeAnim.setAttribute('begin', `${index * 0.2 + 1.5 + i * 0.1}s`);
                fadeAnim.setAttribute('fill', 'freeze');
                element.appendChild(fadeAnim);
            });
            
            svg.appendChild(label);
            svg.appendChild(count);
        }
        
        svg.appendChild(line);
        svg.appendChild(point);
    });
    
    container.appendChild(svg);
}

// Handle page navigation
function initPageNavigation() {
    // Track clicks on map navigation
    const mapLinks = document.querySelectorAll('a[href="/map.html"]');
    
    mapLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add analytics tracking here if needed
            console.log('Navigating to interactive map');
        });
    });
}

// Error handling
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Graceful degradation - ensure basic functionality works
    if (context === 'animations' && !isCountingUp) {
        // Fallback: show final numbers immediately
        const metrics = document.querySelectorAll('.metric-number[data-target]');
        metrics.forEach(metric => {
            const target = parseInt(metric.dataset.target);
            metric.textContent = target.toLocaleString();
        });
        isCountingUp = true;
    }
}

// Main initialization
function init() {
    try {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        console.log('Initializing HTW 2025 Landing Page...');
        
        // Initialize all components
        initStatBars();
        initScrollAnimations();
        initSmoothScrolling();
        initNavigationEffects();
        initGlobeVisualization();
        initChartVisualizations();
        initPageNavigation();
        
        // Add loading complete class
        document.body.classList.add('loaded');
        
        console.log('HTW 2025 Landing Page initialized successfully');
        
    } catch (error) {
        handleError(error, 'initialization');
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    } else {
        // Resume animations when page becomes visible
        if (document.querySelector('.hero-metrics') && !isCountingUp) {
            setTimeout(initMetricCounters, 500);
        }
    }
});

// Handle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate any size-dependent elements
        console.log('Window resized, recalculating layouts');
    }, 250);
});

// Start initialization
init();

// Export functions for potential external use
window.HTWLanding = {
    initMetricCounters,
    initScrollAnimations,
    version: '1.0.0'
};
