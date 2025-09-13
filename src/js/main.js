// Main application entry point
import '@/css/main.css';
import '@/css/components.css';

import { DataLoader } from './dataLoader.js';
import { Visualization } from './visualization.js';
import { Controls } from './controls.js';
import { Utils } from './utils.js';

class HTWVisualizationApp {
    constructor() {
        this.dataLoader = null;
        this.visualization = null;
        this.controls = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing HTW Community Visualization...');
            
            // Show loading screen with HTW branding
            Utils.showLoadingScreen();
            Utils.updateLoadingProgress(10);

            // Check for WebGL support
            if (!Utils.supportsWebGL()) {
                throw new Error('WebGL is not supported in this browser. Please use a modern browser with WebGL support.');
            }

            // Initialize data loader with performance optimizations
            console.log('📊 Loading and clustering community data...');
            Utils.updateLoadingProgress(25);
            this.dataLoader = new DataLoader();
            const data = await this.dataLoader.loadData(); // Returns clustered data
            
            if (!data || data.length === 0) {
                throw new Error('No data available to visualize.');
            }

            const stats = this.dataLoader.getStatistics();
            console.log(`✅ Data processed: ${stats.total} members → ${stats.totalClusters} optimized render points (${stats.performance.compressionRatio} compression)`);
            Utils.updateLoadingProgress(50);

            // Initialize visualization
            console.log('Setting up 3D visualization...');
            const container = document.getElementById('visualization-container');
            if (!container) {
                throw new Error('Visualization container element not found');
            }

            this.visualization = new Visualization(container);
            await this.visualization.init();
            
            // Load data into visualization
            console.log('Loading data into visualization...');
            await this.visualization.updateData(data);
            Utils.updateLoadingProgress(75);

            // Initialize controls
            console.log('Setting up controls...');
            this.controls = new Controls(this.dataLoader, this.visualization);
            Utils.updateLoadingProgress(90);

            // Setup additional event listeners
            this.setupGlobalEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            Utils.updateLoadingProgress(100);

            // Hide loading screen after a brief delay
            setTimeout(() => {
                Utils.hideLoadingScreen();
                console.log('HTW Community Visualization ready!');
                
                // Track initialization
                Utils.trackEvent('App', 'Initialized', 'Success', data.length);
                
                // Show welcome notification
                Utils.showNotification('Welcome to HTW Community Visualization! Click and drag to explore the network.', 'info', 8000);
            }, 500);

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    setupGlobalEventListeners() {
        // Setup controls sidebar toggle
        this.setupControlsSidebar();
        
        // Handle window visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('App hidden - pausing animations');
                // Could pause expensive operations here
            } else {
                console.log('App visible - resuming');
            }
        });

        // Handle orientation changes on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.visualization) {
                    this.visualization.onWindowResize();
                }
            }, 100);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', (event) => {
            this.handleUrlStateChange();
        });

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupControlsSidebar() {
        const toggle = document.getElementById('controls-toggle');
        const sidebar = document.getElementById('controls-sidebar');
        
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                const isOpen = sidebar.classList.contains('open');
                
                if (isOpen) {
                    sidebar.classList.remove('open');
                    toggle.classList.remove('open');
                } else {
                    sidebar.classList.add('open');
                    toggle.classList.add('open');
                }
                
                // Update toggle icon
                const icon = toggle.querySelector('svg path');
                if (icon) {
                    if (isOpen) {
                        icon.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
                    } else {
                        icon.setAttribute('d', 'M18 6L6 18M6 6l12 12');
                    }
                }
            });
            
            // Close sidebar when clicking outside (on mobile)
            document.addEventListener('click', (event) => {
                if (window.innerWidth <= 768) {
                    if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
                        sidebar.classList.remove('open');
                        toggle.classList.remove('open');
                        
                        // Reset icon
                        const icon = toggle.querySelector('svg path');
                        if (icon) {
                            icon.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
                        }
                    }
                }
            });
        }
    }

    handleKeyboardShortcuts(event) {
        // Prevent shortcuts when typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'r':
                // Reset camera
                if (this.visualization) {
                    this.visualization.resetCamera();
                    Utils.showNotification('Camera reset', 'info', 2000);
                }
                break;
                
            case 'c':
                // Clear filters
                if (this.controls) {
                    this.controls.clearFilters();
                    Utils.showNotification('Filters cleared', 'info', 2000);
                }
                break;
                
            case 't':
                // Toggle controls sidebar
                const toggle = document.getElementById('controls-toggle');
                if (toggle) {
                    toggle.click();
                }
                break;
                
            case 'e':
                // Export data
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    if (this.controls) {
                        this.controls.exportCurrentView();
                        Utils.showNotification('Data exported', 'success', 3000);
                    }
                }
                break;
                
            case 'escape':
                // Close modals or reset selection
                const modal = document.getElementById('detail-modal');
                if (modal && modal.style.display === 'block') {
                    this.controls.hideModal();
                } else {
                    // Close sidebar if open
                    const sidebar = document.getElementById('controls-sidebar');
                    if (sidebar && sidebar.classList.contains('open')) {
                        const toggleBtn = document.getElementById('controls-toggle');
                        if (toggleBtn) {
                            toggleBtn.click();
                        }
                    }
                }
                break;
                
            case 'f':
                // Toggle fullscreen
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
        }
    }

    handleUrlStateChange() {
        // Handle URL parameter changes for deep linking
        const industryParam = Utils.getUrlParameter('industry');
        const locationParam = Utils.getUrlParameter('location');
        const roleParam = Utils.getUrlParameter('role');

        if (this.controls && (industryParam || locationParam || roleParam)) {
            if (industryParam) this.controls.applyPresetFilter('industry', industryParam);
            if (locationParam) this.controls.applyPresetFilter('location', locationParam);
            if (roleParam) this.controls.applyPresetFilter('role', roleParam);
        }
    }

    setupPerformanceMonitoring() {
        // Monitor FPS
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 0;

        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Update FPS display if it exists
                const fpsDisplay = document.getElementById('fps-counter');
                if (fpsDisplay) {
                    fpsDisplay.textContent = `FPS: ${fps}`;
                }
                
                // Warn if FPS is too low
                if (fps < 30 && fps > 0) {
                    console.warn(`Low FPS detected: ${fps}`);
                    Utils.trackEvent('Performance', 'Low FPS', fps.toString());
                }
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();

        // Monitor memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
                
                console.log(`Memory usage: ${usedMB}MB / ${totalMB}MB`);
                
                // Warn if memory usage is high
                if (usedMB > 100) {
                    console.warn('High memory usage detected');
                    Utils.trackEvent('Performance', 'High Memory', usedMB.toString());
                }
            }, 30000); // Check every 30 seconds
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Hide loading screen
        Utils.hideLoadingScreen();
        
        // Show error message
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>Unable to load HTW Community Visualization</h2>
                <p>${error.message}</p>
                <div class="error-actions">
                    <button onclick="window.location.reload()" class="retry-btn">
                        Retry
                    </button>
                    <button onclick="window.history.back()" class="back-btn">
                        Go Back
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('app').appendChild(errorContainer);
        
        // Track error
        Utils.trackEvent('App', 'Initialization Error', error.message);
    }

    // Public API methods
    getDataLoader() {
        return this.dataLoader;
    }

    getVisualization() {
        return this.visualization;
    }

    getControls() {
        return this.controls;
    }

    isReady() {
        return this.isInitialized;
    }

    // Method to update data dynamically (for future use)
    async updateData(newDataSource) {
        if (!this.isInitialized) {
            throw new Error('Application not initialized');
        }

        try {
            Utils.showLoadingScreen();
            Utils.updateLoadingProgress(25);

            // Load new data
            const newData = await this.dataLoader.loadData(newDataSource);
            Utils.updateLoadingProgress(75);

            // Update visualization
            this.visualization.updateData(newData);
            this.controls.updateStatistics();
            
            Utils.updateLoadingProgress(100);
            Utils.hideLoadingScreen();
            
            Utils.showNotification('Data updated successfully', 'success');
            Utils.trackEvent('App', 'Data Updated', 'Success', newData.length);
            
        } catch (error) {
            console.error('Failed to update data:', error);
            Utils.hideLoadingScreen();
            Utils.showNotification('Failed to update data', 'error');
            Utils.trackEvent('App', 'Data Update Error', error.message);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting HTW Visualization App...');
    
    // Create global app instance
    window.htwApp = new HTWVisualizationApp();
});

// Handle unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    Utils.trackEvent('Error', 'Unhandled', event.error?.message || 'Unknown');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.trackEvent('Error', 'Unhandled Promise', event.reason?.message || 'Unknown');
});

// Export for potential external use
export default HTWVisualizationApp;
