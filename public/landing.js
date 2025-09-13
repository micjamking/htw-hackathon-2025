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

// Initialize chart placeholders
function initChartPlaceholders() {
    const charts = [
        {
            id: 'global-chart',
            content: 'Country distribution visualization'
        },
        {
            id: 'hawaii-chart',
            content: 'Hawaiian islands breakdown'
        },
        {
            id: 'industry-chart',
            content: 'Industry diversity chart'
        }
    ];
    
    charts.forEach(chart => {
        const element = document.getElementById(chart.id);
        if (element) {
            element.innerHTML = `
                <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-style: italic;
                    color: var(--htw-medium-blue);
                    font-size: 0.875rem;
                ">
                    ${chart.content}
                </div>
            `;
        }
    });
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
        initChartPlaceholders();
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
