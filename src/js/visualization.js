import * as THREE from 'three';

export class Visualization {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.dataPoints = [];
        this.currentData = [];
        this.isAnimating = false;
        this.mousePosition = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hoveredObject = null;
        this.selectedObject = null;
        this.cameraDistance = 100;

        // HTW Brand colors from design system
        this.brandColors = {
            primary: 0x00D4FF,      // HTW bright cyan
            deepSea: 0x003366,      // Dark navy blue
            techBlue: 0x1E40AF,     // Medium blue
            white: 0xFFFFFF,
            gray: 0x6B7280,
            accent: 0x10B981,       // Success green
            warning: 0xF59E0B,      // Warning amber
            error: 0xEF4444         // Error red
        };

        // Industry color mapping based on HTW design system
        this.industryColors = {
            'Technology': this.brandColors.primary,     // HTW cyan
            'AI/ML': this.brandColors.techBlue,         // Tech blue
            'Finance': this.brandColors.accent,         // Green
            'Education': this.brandColors.warning,      // Amber
            'Healthcare': this.brandColors.error,       // Red
            'Marketing': 0x8B5CF6,                      // Purple
            'Media': 0xEC4899,                          // Pink
            'Consulting': 0x06B6D4,                     // Sky blue
            'Cybersecurity': 0xDC2626,                  // Dark red
            'AR/VR': 0x7C3AED,                          // Violet
            'Mixed': this.brandColors.gray,             // Gray for clusters
            'Other': this.brandColors.gray              // Gray
        };

        // Performance optimization settings
        this.performanceSettings = {
            maxRenderDistance: 500,
            lodEnabled: true,
            frustumCulling: true,
            instancedRendering: false, // Will enable for large datasets
            animationFrameSkip: 0,
            targetFPS: 60
        };

        // Material pools for performance
        this.materialPool = new Map();
        this.geometryPool = new Map();
        
        // Performance monitoring
        this.performanceStats = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60,
            drawCalls: 0
        };

        this.initializeMaterialPool();
    }

    // Initialize material and geometry pools for performance
    initializeMaterialPool() {
        // Create shared geometries
        this.geometryPool.set('sphere', new THREE.SphereGeometry(0.5, 8, 6));
        this.geometryPool.set('cluster', new THREE.SphereGeometry(1, 12, 8));
        this.geometryPool.set('large-cluster', new THREE.SphereGeometry(1.5, 16, 12));

        // Create materials for each industry
        Object.entries(this.industryColors).forEach(([industry, color]) => {
            // Standard material for individual points
            this.materialPool.set(`point-${industry}`, new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            }));

            // Cluster material with glow effect
            this.materialPool.set(`cluster-${industry}`, new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9
            }));

            // Hover material
            this.materialPool.set(`hover-${industry}`, new THREE.MeshBasicMaterial({
                color: this.brandColors.white,
                transparent: true,
                opacity: 1.0
            }));
        });
    }

    init() {
        console.log('Initializing 3D visualization...');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.brandColors.deepSea);

        // Create camera with performance-optimized settings
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 0, this.cameraDistance);

        // Create renderer with performance optimizations
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: window.devicePixelRatio <= 1, // Disable antialiasing on high-DPI for performance
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Enable frustum culling for performance
        this.renderer.frustumCulled = true;
        
        this.container.appendChild(this.renderer.domElement);

        // Create globe with HTW branding
        this.createGlobe();
        
        // Add optimized lighting
        this.setupLighting();
        
        // Setup controls
        this.setupControls();
        
        // Start render loop
        this.animate();
        
        console.log('3D visualization initialized successfully');
    }

    createGlobe() {
        // Create Earth with HTW-branded styling
        const globeGeometry = new THREE.SphereGeometry(50, 32, 32);
        const globeMaterial = new THREE.MeshPhongMaterial({
            color: this.brandColors.techBlue,
            transparent: true,
            opacity: 0.7,
            wireframe: false
        });
        
        this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
        this.scene.add(this.globe);

        // Add wireframe overlay for tech aesthetic
        const wireframeGeometry = new THREE.SphereGeometry(50.1, 16, 16);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: this.brandColors.primary,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.scene.add(wireframe);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(52, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 1.0 },
                color: { value: new THREE.Color(this.brandColors.primary) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(color, intensity * 0.5);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glow);
    }

    setupLighting() {
        // Ambient light for overall scene brightness
        const ambientLight = new THREE.AmbientLight(this.brandColors.white, 0.4);
        this.scene.add(ambientLight);

        // Directional light with HTW brand color
        const directionalLight = new THREE.DirectionalLight(this.brandColors.primary, 0.6);
        directionalLight.position.set(100, 100, 50);
        this.scene.add(directionalLight);

        // Point light for dynamic highlights
        const pointLight = new THREE.PointLight(this.brandColors.white, 0.8, 200);
        pointLight.position.set(0, 50, 100);
        this.scene.add(pointLight);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 100);
        pointLight1.position.set(-50, -50, 50);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff6b9d, 0.5, 100);
        pointLight2.position.set(50, 50, -50);
        this.scene.add(pointLight2);
    }

    setupBackground() {
        // Create starfield background
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const starsPositions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
            starsPositions[i] = (Math.random() - 0.5) * 400;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    createDataVisualization(data, cameraDistance = 100) {
        console.log(`Creating visualization for ${data.length} data points (camera distance: ${cameraDistance})`);
        
        // Clear existing data points
        this.clearDataPoints();
        
        this.currentData = data;
        this.cameraDistance = cameraDistance;
        
        // Performance optimization: batch create objects
        const objectsToAdd = [];
        let processedCount = 0;
        
        data.forEach((dataPoint, index) => {
            if (!dataPoint.coordinates) return;
            
            // Convert lat/lng to 3D coordinates
            const position = this.latLngToVector3(
                dataPoint.coordinates.lat, 
                dataPoint.coordinates.lng, 
                52 // Globe radius + small offset
            );

            // Choose geometry and material based on cluster size and distance
            const { geometry, material, scale } = this.getOptimizedRenderingParams(dataPoint, cameraDistance);
            
            // Create mesh with optimized parameters
            const pointMesh = new THREE.Mesh(geometry, material);
            pointMesh.position.copy(position);
            pointMesh.scale.setScalar(scale);
            
            // Store data for interaction
            pointMesh.userData = {
                originalData: dataPoint,
                id: dataPoint.id,
                isCluster: dataPoint.isCluster,
                memberCount: dataPoint.memberCount || 1,
                industries: dataPoint.industries || [dataPoint.industryCategory],
                location: dataPoint.fullLocation
            };

            // Add pulsing animation for clusters
            if (dataPoint.isCluster && dataPoint.memberCount > 1) {
                pointMesh.userData.pulseSpeed = 0.02 + (dataPoint.memberCount * 0.001);
                pointMesh.userData.originalScale = scale;
            }

            objectsToAdd.push(pointMesh);
            this.dataPoints.push(pointMesh);
            processedCount++;
        });

        // Batch add to scene for performance
        objectsToAdd.forEach(obj => this.scene.add(obj));
        
        console.log(`Visualization created: ${processedCount} objects rendered`);
        this.updatePerformanceStats();
    }

    // Get optimized rendering parameters based on data point and camera distance
    getOptimizedRenderingParams(dataPoint, cameraDistance) {
        const memberCount = dataPoint.memberCount || 1;
        const industry = dataPoint.industryCategory || 'Other';
        
        let geometry, material, scale;
        
        if (memberCount === 1) {
            // Individual point
            geometry = this.geometryPool.get('sphere');
            material = this.materialPool.get(`point-${industry}`) || 
                      this.materialPool.get('point-Other');
            scale = 1;
        } else if (memberCount <= 5) {
            // Small cluster
            geometry = this.geometryPool.get('cluster');
            material = this.materialPool.get(`cluster-${industry}`) || 
                      this.materialPool.get('cluster-Mixed');
            scale = 1.2 + (memberCount * 0.1);
        } else {
            // Large cluster
            geometry = this.geometryPool.get('large-cluster');
            material = this.materialPool.get(`cluster-${industry}`) || 
                      this.materialPool.get('cluster-Mixed');
            scale = 1.5 + Math.min(memberCount * 0.05, 2); // Cap at reasonable size
        }

        // Adjust scale based on camera distance for LOD
        if (cameraDistance > 200) {
            scale *= 1.5; // Make points larger when far away
        } else if (cameraDistance < 80) {
            scale *= 0.8; // Make points smaller when close
        }

        return { geometry, material, scale };
    }

    // Convert latitude/longitude to 3D vector position on sphere
    latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));

        return new THREE.Vector3(x, y, z);
    }

    // Clear existing data points with performance optimization
    clearDataPoints() {
        // Batch removal for performance
        const objectsToRemove = [...this.dataPoints];
        objectsToRemove.forEach(point => {
            this.scene.remove(point);
            // Dispose geometry and material if they're unique (not pooled)
            if (point.geometry && !this.geometryPool.has(point.geometry)) {
                point.geometry.dispose();
            }
            if (point.material && !this.materialPool.has(point.material)) {
                point.material.dispose();
            }
        });
        
        this.dataPoints = [];
        
        // Force garbage collection hint
        if (window.gc) {
            window.gc();
        }
    }

    // Update visualization with new data (optimized for frequent updates)
    updateVisualization(newData, cameraDistance) {
        // Only recreate if data has significantly changed
        if (this.shouldRecreateVisualization(newData, cameraDistance)) {
            this.createDataVisualization(newData, cameraDistance);
        } else {
            // Just update existing objects' visibility/scale
            this.updateExistingVisualization(newData, cameraDistance);
        }
    }

    // Check if we need to recreate the entire visualization
    shouldRecreateVisualization(newData, cameraDistance) {
        const dataSizeChanged = Math.abs(this.currentData.length - newData.length) > 10;
        const cameraDistanceChanged = Math.abs(this.cameraDistance - cameraDistance) > 20;
        const dataContentChanged = this.currentData.length === 0 || 
            (newData.length > 0 && this.currentData[0]?.id !== newData[0]?.id);
        
        return dataSizeChanged || cameraDistanceChanged || dataContentChanged;
    }

    // Update existing visualization without recreating (performance optimization)
    updateExistingVisualization(newData, cameraDistance) {
        const newDataIds = new Set(newData.map(d => d.id));
        
        // Hide points not in new data
        this.dataPoints.forEach(point => {
            const shouldShow = newDataIds.has(point.userData.id);
            point.visible = shouldShow;
            
            if (shouldShow) {
                // Update scale based on new camera distance
                const { scale } = this.getOptimizedRenderingParams(point.userData.originalData, cameraDistance);
                point.scale.setScalar(scale);
            }
        });
        
        this.cameraDistance = cameraDistance;
    }

    // Performance monitoring
    updatePerformanceStats() {
        this.performanceStats.frameCount++;
        const now = performance.now();
        const deltaTime = now - this.performanceStats.lastTime;
        
        if (deltaTime >= 1000) { // Update every second
            this.performanceStats.fps = Math.round(this.performanceStats.frameCount / (deltaTime / 1000));
            this.performanceStats.frameCount = 0;
            this.performanceStats.lastTime = now;
            this.performanceStats.drawCalls = this.dataPoints.length;
        }
    }

    // Get current performance metrics
    getPerformanceMetrics() {
        return {
            fps: this.performanceStats.fps,
            drawCalls: this.performanceStats.drawCalls,
            renderedObjects: this.dataPoints.length,
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
        };
    }

    setupEventListeners() {
        // Mouse events
        this.container.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.container.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Check for intersections
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.dataPoints.children);
        
        // Reset previous hover
        if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
            this.hoveredObject.material.emissiveIntensity = 0.1;
            this.hoveredObject.scale.set(1, 1, 1);
        }
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object !== this.selectedObject) {
                object.material.emissiveIntensity = 0.3;
                object.scale.set(1.2, 1.2, 1.2);
            }
            this.hoveredObject = object;
            this.container.style.cursor = 'pointer';
            
            // Show tooltip
            this.showTooltip(event, object.userData.dataPoint);
        } else {
            this.hoveredObject = null;
            this.container.style.cursor = 'default';
            this.hideTooltip();
        }
    }

    onMouseClick(event) {
        if (this.hoveredObject) {
            // Reset previous selection
            if (this.selectedObject) {
                this.selectedObject.material.emissiveIntensity = 0.1;
                this.selectedObject.scale.set(1, 1, 1);
            }
            
            // Set new selection
            this.selectedObject = this.hoveredObject;
            this.selectedObject.material.emissiveIntensity = 0.5;
            this.selectedObject.scale.set(1.5, 1.5, 1.5);
            
            // Dispatch selection event
            const customEvent = new CustomEvent('dataPointSelected', {
                detail: this.selectedObject.userData.dataPoint
            });
            document.dispatchEvent(customEvent);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    showTooltip(event, dataPoint) {
        let tooltip = document.getElementById('tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'tooltip';
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <strong>${dataPoint.role}</strong><br>
            Industry: ${dataPoint.industryCategory}<br>
            Location: ${dataPoint.fullLocation}<br>
            Group: ${dataPoint.group}
        `;
        
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY + 10 + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate data points with subtle floating motion
        const time = Date.now() * 0.001;
        this.dataPoints.children.forEach((mesh, index) => {
            const offset = mesh.userData.animationOffset;
            mesh.position.y += Math.sin(time + offset) * 0.01;
            mesh.rotation.y += 0.005;
        });
        
        // Rotate the entire visualization slowly
        this.dataPoints.rotation.y += 0.001;
        this.connections.rotation.y += 0.001;
        
        this.renderer.render(this.scene, this.camera);
    }

    // Public methods for external control
    updateData(newData) {
        // Clear existing visualization
        this.dataPoints.clear();
        this.connections.clear();
        
        // Update data and recreate visualization
        this.data = newData;
        this.createDataVisualization();
    }

    resetCamera() {
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    focusOnPoint(dataPoint) {
        if (dataPoint && dataPoint.position) {
            const targetPosition = dataPoint.position.clone();
            targetPosition.z += 20;
            
            // Smooth camera transition (simplified)
            this.camera.position.copy(targetPosition);
            this.camera.lookAt(dataPoint.position);
        }
    }

    getSelectedDataPoint() {
        return this.selectedObject ? this.selectedObject.userData.dataPoint : null;
    }
}
