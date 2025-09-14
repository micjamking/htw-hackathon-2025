import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Visualization {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.dataPoints = new THREE.Group();
        this.connections = new THREE.Group();
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
        // Create reusable geometries for performance - Much smaller for professional look
        this.geometryPool.set('sphere', new THREE.SphereGeometry(0.2, 8, 6));         // Very small individual points
        this.geometryPool.set('cluster', new THREE.SphereGeometry(0.4, 12, 8));       // Small cluster
        this.geometryPool.set('large-cluster', new THREE.SphereGeometry(0.6, 16, 12)); // Medium cluster

        // Create materials for each industry with glow effects
        Object.entries(this.industryColors).forEach(([industry, color]) => {
            // Standard material for individual points with subtle glow
            this.materialPool.set(`point-${industry}`, new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                emissive: color,
                emissiveIntensity: 0.2
            }));

            // Cluster material with enhanced glow effect
            this.materialPool.set(`cluster-${industry}`, new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.95,
                emissive: color,
                emissiveIntensity: 0.3
            }));

            // Hover material with bright glow
            this.materialPool.set(`hover-${industry}`, new THREE.MeshBasicMaterial({
                color: this.brandColors.white,
                transparent: true,
                opacity: 1.0,
                emissive: this.brandColors.primary,
                emissiveIntensity: 0.5
            }));
        });
        
        // Add fallback materials with HTW branding
        this.materialPool.set('point-Other', new THREE.MeshBasicMaterial({ 
            color: this.brandColors.gray,
            transparent: true,
            opacity: 0.8,
            emissive: this.brandColors.gray,
            emissiveIntensity: 0.1
        }));
        this.materialPool.set('cluster-Mixed', new THREE.MeshBasicMaterial({ 
            color: this.brandColors.primary,
            transparent: true,
            opacity: 0.9,
            emissive: this.brandColors.primary,
            emissiveIntensity: 0.2
        }));
    }

    init() {
        console.log('Initializing 3D visualization...');
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Set up space background with starfield
        this.setupSpaceBackground();

        // Create camera with performance-optimized settings
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        // Position camera to view Hawaii region where data points are clustered
        this.camera.position.set(-80, 40, 80); // Angled toward Hawaii coordinates
        this.camera.lookAt(0, 0, 0); // Still looking at globe center

        // Get existing canvas element
        const canvas = document.getElementById('three-canvas');
        if (!canvas) {
            console.error('Canvas element #three-canvas not found');
            return;
        }

        // Create renderer with performance optimizations using existing canvas
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: window.devicePixelRatio <= 1, // Disable antialiasing on high-DPI for performance
            powerPreference: 'high-performance',
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Enable frustum culling for performance
        this.renderer.frustumCulled = true;

        // Create globe with HTW branding
        this.createGlobe();
        
        // Add optimized lighting for space aesthetic
        this.setupLighting();
        
        // Add data point and connection groups to scene
        this.scene.add(this.dataPoints);
        this.scene.add(this.connections);
        
        // Setup controls
        this.setupControls();
        
        // Start render loop
        this.animate();
        
        console.log('3D visualization initialized successfully');
    }

    setupSpaceBackground() {
        // Create deep space gradient background
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Create radial gradient from deep space blue to black
        const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#001122'); // Deep space blue (HTW deep sea)
        gradient.addColorStop(0.7, '#000814'); // Darker blue
        gradient.addColorStop(1, '#000000'); // Black space
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        const backgroundTexture = new THREE.CanvasTexture(canvas);
        this.scene.background = backgroundTexture;

        // Create animated starfield
        this.createStarfield();
        
        // Add nebula-like particle effects
        this.createNebulaEffect();
    }

    createStarfield() {
        // Create multiple layers of stars for depth
        const starLayers = [
            { count: 1500, size: 0.8, color: 0xFFFFFF, distance: 300 },
            { count: 800, size: 1.2, color: 0x00D4FF, distance: 250 }, // HTW cyan stars
            { count: 400, size: 1.5, color: 0xFFFFFF, distance: 200 }
        ];

        starLayers.forEach((layer, index) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(layer.count * 3);
            const colors = new Float32Array(layer.count * 3);
            
            const color = new THREE.Color(layer.color);
            
            for (let i = 0; i < layer.count; i++) {
                const i3 = i * 3;
                
                // Create spherical distribution of stars
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const radius = layer.distance + (Math.random() - 0.5) * 50;
                
                positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
                positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
                positions[i3 + 2] = radius * Math.cos(theta);
                
                // Add some color variation
                const colorVariation = 0.8 + Math.random() * 0.4;
                colors[i3] = color.r * colorVariation;
                colors[i3 + 1] = color.g * colorVariation;
                colors[i3 + 2] = color.b * colorVariation;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const material = new THREE.PointsMaterial({
                size: layer.size,
                vertexColors: true,
                transparent: true,
                opacity: index === 1 ? 0.8 : 0.6, // HTW cyan stars slightly more prominent
                blending: THREE.AdditiveBlending
            });
            
            const stars = new THREE.Points(geometry, material);
            stars.userData = { 
                isStars: true, 
                layer: index,
                rotationSpeed: (index + 1) * 0.0002 // Different rotation speeds for parallax
            };
            this.scene.add(stars);
        });
    }

    createNebulaEffect() {
        // Create subtle nebula-like particle clouds
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaCount = 200;
        const positions = new Float32Array(nebulaCount * 3);
        const colors = new Float32Array(nebulaCount * 3);
        const sizes = new Float32Array(nebulaCount);
        
        for (let i = 0; i < nebulaCount; i++) {
            const i3 = i * 3;
            
            // Create clustered nebula regions
            const clusterX = (Math.random() - 0.5) * 400;
            const clusterY = (Math.random() - 0.5) * 400;
            const clusterZ = (Math.random() - 0.5) * 400;
            
            positions[i3] = clusterX;
            positions[i3 + 1] = clusterY;
            positions[i3 + 2] = clusterZ;
            
            // HTW brand colors for nebula
            const htwCyan = new THREE.Color(this.brandColors.primary);
            const htwBlue = new THREE.Color(this.brandColors.techBlue);
            const color = Math.random() > 0.7 ? htwCyan : htwBlue;
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 8 + 2;
        }
        
        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const nebulaMaterial = new THREE.PointsMaterial({
            size: 5,
            vertexColors: true,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
        nebula.userData = { isNebula: true, rotationSpeed: 0.0001 };
        this.scene.add(nebula);
    }

    createGlobe() {
        // Create Earth with HTW-branded styling - more refined
        const globeGeometry = new THREE.SphereGeometry(50, 64, 64); // Higher resolution
        const globeMaterial = new THREE.MeshPhongMaterial({
            color: this.brandColors.deepSea,
            transparent: true,
            opacity: 0.8,
            wireframe: false,
            shininess: 100,
            specular: new THREE.Color(this.brandColors.primary)
        });
        
        this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
        this.scene.add(this.globe);

        // Add refined wireframe overlay
        const wireframeGeometry = new THREE.SphereGeometry(50.2, 32, 32);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: this.brandColors.primary,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.scene.add(wireframe);

        // Enhanced atmospheric glow
        const atmosphereGeometry = new THREE.SphereGeometry(53, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 1.0 },
                color: { value: new THREE.Color(this.brandColors.primary) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 0.5) * 0.1 + 0.9;
                    gl_FragColor = vec4(color, intensity * 0.3 * pulse);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        atmosphere.userData = { isAtmosphere: true };
        this.scene.add(atmosphere);
    }

    setupLighting() {
        // Ambient light for space atmosphere
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
        this.scene.add(ambientLight);

        // Main directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = false; // Disable shadows for performance
        this.scene.add(directionalLight);

        // HTW brand accent lights
        const cyanLight = new THREE.PointLight(this.brandColors.primary, 0.6, 150);
        cyanLight.position.set(-80, 60, 80);
        this.scene.add(cyanLight);

        const blueLight = new THREE.PointLight(this.brandColors.techBlue, 0.4, 120);
        blueLight.position.set(80, -60, -80);
        this.scene.add(blueLight);

        // Subtle rim lighting for atmosphere
        const rimLight = new THREE.DirectionalLight(this.brandColors.primary, 0.3);
        rimLight.position.set(-50, 0, -100);
        this.scene.add(rimLight);
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

    setupControls() {
        // Setup OrbitControls for interactive camera movement
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // Configure controls for smooth interaction
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        
        // Set limits for better UX
        this.controls.minDistance = 60;  // Prevent zooming too close
        this.controls.maxDistance = 300; // Prevent zooming too far
        this.controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
        
        // Setup event listeners for interaction
        this.setupEventListeners();
        
        // Initialize camera controls (basic mouse tracking)
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.cameraPosition = new THREE.Vector3(0, 0, this.cameraDistance);
    }

    createDataVisualization(data, cameraDistance = 100) {
        console.log(`Creating visualization for ${data.length} data points`);
        
        // Clear existing data points
        this.clearDataPoints();
        
        this.currentData = data;
        this.cameraDistance = cameraDistance;
        
        // Performance optimization: batch create objects
        let processedCount = 0;
        let skippedCount = 0;
        
        data.forEach((dataPoint, index) => {
            if (!dataPoint.coordinates) {
                console.warn(`Data point ${index} missing coordinates:`, dataPoint);
                skippedCount++;
                return;
            }
            
            // Convert lat/lng to 3D coordinates
            const position = this.latLngToVector3(
                dataPoint.coordinates.lat, 
                dataPoint.coordinates.lng, 
                50.5 // Globe radius (50) + minimal offset (0.5) to be exactly on surface
            );

            // Add small random offset for clustered points to prevent overlap
            if (dataPoint.isCluster && dataPoint.memberCount > 1) {
                const offsetRadius = Math.min(dataPoint.memberCount * 0.05, 1); // Max 1 unit spread (reduced)
                position.x += (Math.random() - 0.5) * offsetRadius;
                position.y += (Math.random() - 0.5) * offsetRadius; 
                position.z += (Math.random() - 0.5) * offsetRadius;
            }

            // Log coordinate details for first few points
            if (index < 3) {
                console.log(`Data point ${index}: lat=${dataPoint.coordinates.lat.toFixed(2)}, lng=${dataPoint.coordinates.lng.toFixed(2)}`);
            }

            // Choose geometry and material based on cluster size and distance
            const { geometry, material, scale } = this.getOptimizedRenderingParams(dataPoint, cameraDistance);
            
            // Debug logging for first few points
            if (index < 3) {
                console.log(`Data point ${index}:`, {
                    coordinates: dataPoint.coordinates,
                    position: position,
                    scale: scale,
                    memberCount: dataPoint.memberCount,
                    geometry: geometry ? 'Found' : 'MISSING',
                    material: material ? 'Found' : 'MISSING',
                    geometryRadius: geometry ? geometry.parameters?.radius : 'N/A',
                    materialColor: material ? material.color : 'N/A'
                });
            }
            
            if (!geometry || !material) {
                console.error(`❌ Missing geometry or material for data point ${index}:`, { 
                    geometry: geometry ? 'Found' : 'MISSING', 
                    material: material ? 'Found' : 'MISSING',
                    industry: dataPoint.industryCategory,
                    memberCount: dataPoint.memberCount 
                });
                skippedCount++;
                return;
            }
            
            // DEBUG: Log material details for first few points
            if (index < 3) {
                console.log(`Data point ${index} material:`, {
                    color: material.color,
                    transparent: material.transparent,
                    opacity: material.opacity,
                    visible: material.visible
                });
            }
            
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
                location: dataPoint.fullLocation,
                animationOffset: Math.random() * Math.PI * 2 // For floating animation
            };

            // Add pulsing animation data for clusters
            if (dataPoint.isCluster && dataPoint.memberCount > 1) {
                pointMesh.userData.pulseSpeed = 0.5 + (dataPoint.memberCount * 0.05);
                pointMesh.userData.originalScale = scale;
            } else {
                pointMesh.userData.originalScale = scale;
            }

            // Add to dataPoints group instead of directly to scene
            this.dataPoints.add(pointMesh);
            processedCount++;
        });

        // Batch add to scene for performance - dataPoints group is already in scene
        // objectsToAdd.forEach(obj => this.scene.add(obj));
        
        console.log(`Visualization created: ${processedCount} objects rendered, ${skippedCount} skipped`);
        console.log(`DataPoints group now contains: ${this.dataPoints.children.length} children`);
        console.log(`Scene contains: ${this.scene.children.length} total objects`);
        console.log(`Camera position:`, this.camera.position.x.toFixed(2), this.camera.position.y.toFixed(2), this.camera.position.z.toFixed(2));
        console.log(`Camera looking at:`, this.camera.target ? 'target set' : 'default (0,0,0)');
        console.log(`Globe position:`, this.globe ? this.globe.position : 'Globe not found');
        
        // Now that data points are added to dataPoints group, they should be visible!
        
        // Log final status
        console.log(`✅ Real data visualization complete: ${this.dataPoints.children.length} data points loaded`);
        
        // Debug: log positions of first few data points
        if (this.dataPoints.children.length > 0) {
            this.dataPoints.children.slice(0, 3).forEach((child, index) => {
                console.log(`Data point ${index} final position:`, child.position.x.toFixed(2), child.position.y.toFixed(2), child.position.z.toFixed(2), 
                           'scale:', child.scale.x.toFixed(2), 'visible:', child.visible);
            });
            
            // DEBUG: Check dataPoints group properties
            console.log('🔍 DataPoints group analysis:', {
                children: this.dataPoints.children.length,
                position: `(${this.dataPoints.position.x}, ${this.dataPoints.position.y}, ${this.dataPoints.position.z})`,
                rotation: `(${this.dataPoints.rotation.x.toFixed(2)}, ${this.dataPoints.rotation.y.toFixed(2)}, ${this.dataPoints.rotation.z.toFixed(2)})`,
                scale: `(${this.dataPoints.scale.x}, ${this.dataPoints.scale.y}, ${this.dataPoints.scale.z})`,
                visible: this.dataPoints.visible,
                parent: this.dataPoints.parent ? 'Has parent' : 'NO PARENT!',
                matrixWorld: this.dataPoints.matrixWorldNeedsUpdate
            });
        } else {
            console.error('❌ NO DATA POINTS ADDED TO SCENE!');
        }
        
        this.updatePerformanceStats();
    }

    // Get optimized rendering parameters based on data point and camera distance
    getOptimizedRenderingParams(dataPoint, cameraDistance) {
        const memberCount = dataPoint.memberCount || 1;
        const industry = dataPoint.industryCategory || 'Other';
        
        let geometry, material, scale;
        
        if (memberCount === 1) {
            // Individual point - keep small
            geometry = this.geometryPool.get('sphere');
            material = this.materialPool.get(`point-${industry}`) || 
                      this.materialPool.get('point-Other');
            scale = 1;
        } else if (memberCount <= 5) {
            // Small cluster - slight increase
            geometry = this.geometryPool.get('cluster');
            material = this.materialPool.get(`cluster-${industry}`) || 
                      this.materialPool.get('cluster-Mixed');
            scale = 1 + (memberCount * 0.05); // Much smaller scaling
        } else {
            // Large cluster - moderate increase
            geometry = this.geometryPool.get('large-cluster');
            material = this.materialPool.get(`cluster-${industry}`) || 
                      this.materialPool.get('cluster-Mixed');
            scale = 1.2 + Math.min(memberCount * 0.02, 0.8); // Cap at much smaller size
        }

        // Adjust scale based on camera distance for LOD (more subtle)
        if (cameraDistance > 200) {
            scale *= 1.2; // Smaller increase when far away
        } else if (cameraDistance < 80) {
            scale *= 0.9; // Smaller reduction when close
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
        // Remove all children from the dataPoints group
        const objectsToRemove = [...this.dataPoints.children];
        objectsToRemove.forEach(point => {
            this.dataPoints.remove(point);
            // Dispose geometry and material if they're unique (not pooled)
            if (point.geometry && !this.geometryPool.has(point.geometry)) {
                point.geometry.dispose();
            }
            if (point.material && !this.materialPool.has(point.material)) {
                point.material.dispose();
            }
        });
        
        // Clear the group (should already be empty, but just to be sure)
        this.dataPoints.clear();
        
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
        this.dataPoints.children.forEach(point => {
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
            this.performanceStats.drawCalls = this.dataPoints.children.length;
        }
    }

    // Get current performance metrics
    getPerformanceMetrics() {
        return {
            fps: this.performanceStats.fps,
            drawCalls: this.performanceStats.drawCalls,
            renderedObjects: this.dataPoints.children.length,
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
        try {
            const rect = this.container.getBoundingClientRect();
            this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Check for intersections
            this.raycaster.setFromCamera(this.mousePosition, this.camera);
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
                
                // Show appropriate tooltip based on whether it's a cluster or individual point
                const userData = object.userData;
                const dataPoint = userData.originalData || userData; // Fallback for test data
                
                if (dataPoint && userData.isCluster && userData.memberCount > 1) {
                    this.showTooltip(event, dataPoint);
                } else if (dataPoint) {
                    // For individual points, show detailed tooltip
                    this.showDetailedTooltip(event, dataPoint);
                } else {
                    console.warn('No valid data found for tooltip', userData);
                }
            } else {
                this.hoveredObject = null;
                this.container.style.cursor = 'default';
                this.hideTooltip();
            }
        } catch (error) {
            console.error('Error in onMouseMove:', error);
        }
    }

    onMouseClick(event) {
        if (this.hoveredObject) {
            const userData = this.hoveredObject.userData;
            const dataPoint = userData.originalData || userData; // Fallback for test data
            
            // If clicking on a cluster, expand it to show individual points
            if (userData.isCluster && userData.memberCount > 1) {
                this.expandCluster(this.hoveredObject);
            } else if (dataPoint) {
                // Reset previous selection
                if (this.selectedObject) {
                    this.resetSelection(this.selectedObject);
                }
                
                // Set new selection for individual points
                this.selectedObject = this.hoveredObject;
                this.highlightSelection(this.selectedObject);
                
                // Show detailed tooltip for individual point
                this.showDetailedTooltip(event, dataPoint);
                
                // Dispatch selection event
                const customEvent = new CustomEvent('dataPointSelected', {
                    detail: dataPoint
                });
                document.dispatchEvent(customEvent);
            } else {
                console.warn('No valid data found for click action', userData);
            }
        }
    }

    expandCluster(clusterMesh) {
        const clusterData = clusterMesh.userData.originalData;
        const clusterPosition = clusterMesh.position.clone();
        
        // Remove the cluster mesh
        this.dataPoints.remove(clusterMesh);
        
        // Create individual points around the cluster position
        if (clusterData.members && clusterData.members.length > 1) {
            this.createExpandedClusterPoints(clusterData.members, clusterPosition);
        } else {
            // Fallback: create individual points based on member count
            this.createExpandedPointsFromCount(clusterData, clusterPosition);
        }
        
        // Update camera to focus on expanded area
        this.focusOnClusterArea(clusterPosition);
        
        // Dispatch cluster expansion event for footer stats update
        document.dispatchEvent(new CustomEvent('clusterExpanded', {
            detail: {
                totalMembers: this.dataPoints.children.length,
                activeClusters: this.dataPoints.children.filter(child => 
                    child.userData.isCluster && child.userData.originalData.memberCount > 1
                ).length
            }
        }));
    }
    
    createExpandedClusterPoints(members, centerPosition) {
        const radius = 2; // Spread radius for expanded points
        const angleStep = (Math.PI * 2) / members.length;
        
        members.forEach((member, index) => {
            const angle = angleStep * index;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            
            // Calculate position on sphere surface
            const expandedPosition = centerPosition.clone();
            expandedPosition.x += offsetX;
            expandedPosition.y += offsetY;
            
            // Normalize to sphere surface
            expandedPosition.normalize().multiplyScalar(50.5);
            
            // Create individual point
            const pointMesh = this.createIndividualPoint(member, expandedPosition);
            if (pointMesh) {
                this.dataPoints.add(pointMesh);
                
                // Add entrance animation
                pointMesh.scale.setScalar(0);
                const targetScale = 1;
                const delay = index * 100;
                
                setTimeout(() => {
                    this.animatePointEntrance(pointMesh, targetScale);
                }, delay);
            }
        });
    }
    
    createExpandedPointsFromCount(clusterData, centerPosition) {
        const memberCount = clusterData.memberCount || 1;
        const radius = Math.min(3, memberCount * 0.3); // Adaptive radius
        
        for (let i = 0; i < memberCount; i++) {
            const angle = (Math.PI * 2 * i) / memberCount;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            
            const expandedPosition = centerPosition.clone();
            expandedPosition.x += offsetX;
            expandedPosition.y += offsetY;
            expandedPosition.normalize().multiplyScalar(50.5);
            
            // Create synthetic member data
            const syntheticMember = {
                ...clusterData,
                id: `${clusterData.id}_expanded_${i}`,
                isCluster: false,
                memberCount: 1,
                role: `Member ${i + 1}`,
                coordinates: this.vector3ToLatLng(expandedPosition)
            };
            
            const pointMesh = this.createIndividualPoint(syntheticMember, expandedPosition);
            if (pointMesh) {
                this.dataPoints.add(pointMesh);
                
                // Add entrance animation
                pointMesh.scale.setScalar(0);
                setTimeout(() => {
                    this.animatePointEntrance(pointMesh, 1);
                }, i * 50);
            }
        }
    }
    
    createIndividualPoint(memberData, position) {
        const geometry = this.geometryPool.get('sphere');
        const material = this.materialPool.get(`point-${memberData.industryCategory}`) || 
                        this.materialPool.get('point-Other');
        
        if (!geometry || !material) return null;
        
        const pointMesh = new THREE.Mesh(geometry, material.clone());
        pointMesh.position.copy(position);
        
        pointMesh.userData = {
            originalData: memberData,
            id: memberData.id,
            isCluster: false,
            memberCount: 1,
            industries: [memberData.industryCategory],
            location: memberData.fullLocation,
            animationOffset: Math.random() * Math.PI * 2
        };
        
        return pointMesh;
    }
    
    animatePointEntrance(pointMesh, targetScale) {
        const startTime = Date.now();
        const duration = 500; // 500ms animation
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const scale = easeOut * targetScale;
            
            pointMesh.scale.setScalar(scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    focusOnClusterArea(position) {
        // Smoothly move camera to focus on the expanded cluster area
        const targetPosition = position.clone().normalize().multiplyScalar(80);
        const currentPosition = this.camera.position.clone();
        
        // Animate camera movement
        const startTime = Date.now();
        const duration = 1000;
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeInOut = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            this.camera.position.lerpVectors(currentPosition, targetPosition, easeInOut);
            this.camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    vector3ToLatLng(vector) {
        const normalized = vector.clone().normalize();
        const lat = Math.asin(normalized.y) * 180 / Math.PI;
        const lng = Math.atan2(normalized.z, normalized.x) * 180 / Math.PI;
        return { lat, lng };
    }
    
    resetSelection(mesh) {
        if (mesh && mesh.material) {
            mesh.material.emissiveIntensity = 0.1;
            mesh.scale.setScalar(1);
        }
    }
    
    highlightSelection(mesh) {
        if (mesh && mesh.material) {
            mesh.material.emissiveIntensity = 0.5;
            mesh.scale.setScalar(1.5);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    showTooltip(event, dataPoint) {
        if (!dataPoint) {
            console.warn('No dataPoint provided to showTooltip');
            return;
        }

        let tooltip = document.getElementById('tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'tooltip';
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }
        
        // Handle both individual members and clusters
        if (dataPoint.isCluster && dataPoint.memberCount > 1) {
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <div class="tooltip-title">Cluster</div>
                    <div class="tooltip-badge">${dataPoint.memberCount} members</div>
                </div>
                <div class="tooltip-content">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Industry:</span>
                        <span class="tooltip-value">${dataPoint.industryCategory || 'Mixed'}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Location:</span>
                        <span class="tooltip-value">${dataPoint.fullLocation || 'Multiple locations'}</span>
                    </div>
                    ${dataPoint.industries && dataPoint.industries.length > 1 ? 
                        `<div class="tooltip-row">
                            <span class="tooltip-label">Industries:</span>
                            <span class="tooltip-value">${dataPoint.industries.slice(0, 3).join(', ')}${dataPoint.industries.length > 3 ? '...' : ''}</span>
                        </div>` : 
                        ''}
                </div>
                <div class="tooltip-footer">
                    <small>Click to expand cluster</small>
                </div>
            `;
        } else {
            // Individual member
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <div class="tooltip-title">${dataPoint.role || dataPoint.name || 'HTW Member'}</div>
                </div>
                <div class="tooltip-content">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Industry:</span>
                        <span class="tooltip-value">${dataPoint.industryCategory || 'Not specified'}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Location:</span>
                        <span class="tooltip-value">${dataPoint.fullLocation || dataPoint.location || 'Not specified'}</span>
                    </div>
                    ${dataPoint.group ? 
                        `<div class="tooltip-row">
                            <span class="tooltip-label">Group:</span>
                            <span class="tooltip-value">${dataPoint.group}</span>
                        </div>` : ''}
                    ${dataPoint.company ? 
                        `<div class="tooltip-row">
                            <span class="tooltip-label">Company:</span>
                            <span class="tooltip-value">${dataPoint.company}</span>
                        </div>` : ''}
                </div>
            `;
        }
        
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 15 + 'px';
        tooltip.style.top = event.clientY + 15 + 'px';
        tooltip.classList.add('visible');
    }
    
    showDetailedTooltip(event, dataPoint) {
        // Show a more detailed tooltip for selected individual points
        if (!dataPoint) {
            console.warn('No dataPoint provided to showDetailedTooltip');
            return;
        }
        
        let tooltip = document.getElementById('tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'tooltip';
            tooltip.className = 'tooltip detailed';
            document.body.appendChild(tooltip);
        }
        
        tooltip.className = 'tooltip detailed';
        
        // Regular member data
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-title">${dataPoint.role || dataPoint.name || 'HTW Community Member'}</div>
                <div class="tooltip-status">Selected</div>
            </div>
            <div class="tooltip-content">
                <div class="tooltip-section">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Industry:</span>
                        <span class="tooltip-value">${dataPoint.industryCategory || 'Not specified'}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Location:</span>
                            <span class="tooltip-value">${dataPoint.fullLocation || dataPoint.location || 'Not specified'}</span>
                        </div>
                        ${dataPoint.group ? 
                            `<div class="tooltip-row">
                                <span class="tooltip-label">Group:</span>
                                <span class="tooltip-value">${dataPoint.group}</span>
                            </div>` : ''}
                        ${dataPoint.company ? 
                            `<div class="tooltip-row">
                                <span class="tooltip-label">Company:</span>
                                <span class="tooltip-value">${dataPoint.company}</span>
                            </div>` : ''}
                    </div>
                    ${dataPoint.interests || dataPoint.skills ? 
                        `<div class="tooltip-section">
                            <div class="tooltip-subtitle">Additional Info</div>
                            ${dataPoint.interests ? 
                                `<div class="tooltip-row">
                                    <span class="tooltip-label">Interests:</span>
                                    <span class="tooltip-value">${dataPoint.interests}</span>
                                </div>` : ''}
                            ${dataPoint.skills ? 
                                `<div class="tooltip-row">
                                    <span class="tooltip-label">Skills:</span>
                                    <span class="tooltip-value">${dataPoint.skills}</span>
                                </div>` : ''}
                        </div>` : ''}
                </div>
                <div class="tooltip-footer">
                    <small>Member ID: ${dataPoint.id || 'N/A'}</small>
                </div>
            `;
        
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 15 + 'px';
        tooltip.style.top = event.clientY + 15 + 'px';
        tooltip.classList.add('visible');
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
            tooltip.classList.remove('detailed');
            setTimeout(() => {
                if (!tooltip.classList.contains('visible')) {
                    tooltip.style.display = 'none';
                }
            }, 200); // Match the CSS transition duration
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Update controls for smooth interaction
        if (this.controls) {
            this.controls.update();
        }
        
        // Animate background elements
        this.animateBackgroundElements(time);
        
        // Animate data points with subtle floating motion and pulsing
        this.dataPoints.children.forEach((mesh, index) => {
            if (mesh.userData.originalData) {
                // Subtle floating motion
                const offset = index * 0.1;
                mesh.position.y += Math.sin(time + offset) * 0.008;
                
                // Pulsing animation for clusters
                if (mesh.userData.isCluster && mesh.userData.pulseSpeed) {
                    const pulseScale = 1 + Math.sin(time * mesh.userData.pulseSpeed) * 0.1;
                    mesh.scale.setScalar(mesh.userData.originalScale * pulseScale);
                }
                
                // Gentle rotation for visual interest
                mesh.rotation.y += 0.003;
                mesh.rotation.x += 0.001;
            }
        });
        
        // Animate globe rotation (very slow)
        if (this.globe) {
            this.globe.rotation.y += 0.0005;
        }
        
        // Update atmospheric glow animation
        this.scene.children.forEach(child => {
            if (child.userData.isAtmosphere && child.material.uniforms) {
                child.material.uniforms.time.value = time;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }

    animateBackgroundElements(time) {
        // Animate starfield layers with parallax effect
        this.scene.children.forEach(child => {
            if (child.userData.isStars) {
                const speed = child.userData.rotationSpeed;
                child.rotation.y += speed;
                
                // Add subtle drift to stars
                if (child.userData.layer === 1) { // HTW cyan stars
                    child.rotation.x += speed * 0.5;
                }
            }
            
            // Animate nebula clouds
            if (child.userData.isNebula) {
                child.rotation.y += child.userData.rotationSpeed;
                child.rotation.z += child.userData.rotationSpeed * 0.5;
                
                // Pulsing opacity for nebula
                if (child.material) {
                    child.material.opacity = 0.05 + Math.sin(time * 0.3) * 0.03;
                }
            }
        });
    }

    // Public methods for external control
    updateData(newData) {
        // Clear existing visualization using the performance-optimized method
        this.clearDataPoints();
        
        // Update data and recreate visualization
        this.currentData = newData;
        this.createDataVisualization(newData);
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
        return this.selectedObject ? this.selectedObject.userData.originalData : null;
    }
}
