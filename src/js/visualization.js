import * as THREE from 'three';

export class Visualization {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: container,
            antialias: true,
            alpha: true 
        });
        
        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedObject = null;
        this.hoveredObject = null;
        
        // Data visualization elements
        this.dataPoints = new THREE.Group();
        this.connections = new THREE.Group();
        this.particles = new THREE.Group();
        
        // Colors for different categories
        this.colors = {
            'Technology': 0x00d4ff,
            'AI/ML': 0xff6b9d,
            'Finance': 0x4ecdc4,
            'Education': 0xffc048,
            'Healthcare': 0x95e1d3,
            'Marketing': 0xf38ba8,
            'Media': 0xa8e6cf,
            'Consulting': 0xdda0dd,
            'Cybersecurity': 0xff6b6b,
            'AR/VR': 0x9d65c9,
            'Other': 0x999999
        };
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Setup camera
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);
        
        // Setup scene
        this.setupLighting();
        this.setupBackground();
        this.createDataVisualization();
        
        // Add groups to scene
        this.scene.add(this.dataPoints);
        this.scene.add(this.connections);
        this.scene.add(this.particles);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
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

    createDataVisualization() {
        this.positionDataPoints();
        this.createDataPoints();
        this.createConnections();
    }

    positionDataPoints() {
        // Position data points in 3D space based on their attributes
        // Using a combination of industry clustering and geographic distribution
        
        const industryAngles = {};
        const industries = Object.keys(this.colors);
        industries.forEach((industry, index) => {
            industryAngles[industry] = (index / industries.length) * Math.PI * 2;
        });

        this.data.forEach((dataPoint, index) => {
            const industry = dataPoint.industryCategory;
            const baseAngle = industryAngles[industry] || 0;
            
            // Add some randomness for natural clustering
            const angleVariation = (Math.random() - 0.5) * 0.5;
            const radiusVariation = Math.random() * 20 + 20;
            
            const angle = baseAngle + angleVariation;
            const radius = radiusVariation;
            
            // Position based on industry (main clustering)
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
            const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 10;
            
            // Z position based on role seniority (rough approximation)
            let z = 0;
            if (dataPoint.group === 'Leadership') z = 10;
            else if (dataPoint.group === 'Management') z = 5;
            else if (dataPoint.group === 'Student') z = -10;
            
            z += (Math.random() - 0.5) * 5; // Add variation
            
            dataPoint.position = new THREE.Vector3(x, y, z);
        });
    }

    createDataPoints() {
        this.data.forEach((dataPoint, index) => {
            // Create sphere for each data point
            const geometry = new THREE.SphereGeometry(0.8, 16, 16);
            const color = this.colors[dataPoint.industryCategory] || this.colors['Other'];
            
            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                emissive: color,
                emissiveIntensity: 0.1
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(dataPoint.position);
            
            // Store reference to data
            mesh.userData = {
                dataPoint: dataPoint,
                originalColor: color,
                index: index
            };
            
            // Add subtle animation
            mesh.userData.animationOffset = Math.random() * Math.PI * 2;
            
            this.dataPoints.add(mesh);
        });
    }

    createConnections() {
        // Create connections between related data points
        // For now, connect points in similar industries or roles
        
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.1
        });

        this.data.forEach((dataPoint1, i) => {
            // Only create some connections to avoid overcrowding
            if (Math.random() > 0.1) return;
            
            this.data.forEach((dataPoint2, j) => {
                if (i >= j) return; // Avoid duplicates
                
                // Connect if same industry or related roles
                const sameIndustry = dataPoint1.industryCategory === dataPoint2.industryCategory;
                const relatedRoles = dataPoint1.group === dataPoint2.group;
                const sameLocation = dataPoint1.city === dataPoint2.city && dataPoint1.city !== 'Unknown';
                
                if (sameIndustry || relatedRoles || sameLocation) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        dataPoint1.position,
                        dataPoint2.position
                    ]);
                    
                    const line = new THREE.Line(geometry, connectionMaterial);
                    line.userData = {
                        point1: i,
                        point2: j,
                        type: sameIndustry ? 'industry' : (relatedRoles ? 'role' : 'location')
                    };
                    
                    this.connections.add(line);
                }
            });
        });
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
