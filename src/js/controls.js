export class Controls {
    constructor(dataLoader, visualization) {
        this.dataLoader = dataLoader;
        this.visualization = visualization;
        this.currentFilters = {
            industries: [],
            locations: [],
            roles: []
        };
        
        this.init();
    }

    init() {
        this.setupFilterControls();
        this.setupViewControls();
        this.setupEventListeners();
        this.updateStatistics();
    }

    setupFilterControls() {
        const filterOptions = this.dataLoader.getFilterOptions();
        
        // Setup industry filter
        const industrySelect = document.getElementById('industry-filter');
        filterOptions.industries.forEach(industry => {
            const option = document.createElement('option');
            option.value = industry;
            option.textContent = industry;
            industrySelect.appendChild(option);
        });

        // Setup location filter
        const locationSelect = document.getElementById('location-filter');
        filterOptions.locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });

        // Setup role filter
        const roleSelect = document.getElementById('role-filter');
        filterOptions.roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleSelect.appendChild(option);
        });
    }

    setupViewControls() {
        // Reset camera button
        const resetCameraBtn = document.getElementById('reset-camera');
        resetCameraBtn.addEventListener('click', () => {
            this.visualization.resetCamera();
        });

        // Auto rotate toggle
        const autoRotateBtn = document.getElementById('auto-rotate');
        let isAutoRotating = false;
        
        autoRotateBtn.addEventListener('click', () => {
            isAutoRotating = !isAutoRotating;
            this.visualization.setAutoRotate(isAutoRotating);
            autoRotateBtn.classList.toggle('active', isAutoRotating);
            autoRotateBtn.textContent = isAutoRotating ? 'Stop Rotation' : 'Auto Rotate';
        });
    }

    setupEventListeners() {
        // Filter change events
        document.getElementById('industry-filter').addEventListener('change', () => {
            this.updateFilters();
        });

        document.getElementById('location-filter').addEventListener('change', () => {
            this.updateFilters();
        });

        document.getElementById('role-filter').addEventListener('change', () => {
            this.updateFilters();
        });

        // Data point selection event
        document.addEventListener('dataPointSelected', (event) => {
            this.handleDataPointSelection(event.detail);
        });

        // Modal controls
        this.setupModalControls();
    }

    setupModalControls() {
        const modal = document.getElementById('detail-modal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            this.hideModal();
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.hideModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    updateFilters() {
        // Get selected values from filter controls
        const industrySelect = document.getElementById('industry-filter');
        const locationSelect = document.getElementById('location-filter');
        const roleSelect = document.getElementById('role-filter');

        this.currentFilters = {
            industries: Array.from(industrySelect.selectedOptions).map(option => option.value),
            locations: Array.from(locationSelect.selectedOptions).map(option => option.value),
            roles: Array.from(roleSelect.selectedOptions).map(option => option.value)
        };

        // Get filtered data
        const filteredData = this.dataLoader.getFilteredData(this.currentFilters);
        
        // Update visualization
        this.visualization.updateData(filteredData);
        
        // Update statistics
        this.updateStatistics(filteredData);
        
        console.log('Filters applied:', this.currentFilters);
        console.log('Filtered data points:', filteredData.length);
    }

    updateStatistics(data = null) {
        const dataToAnalyze = data || this.dataLoader.processedData;
        const stats = this.dataLoader.getStatistics(dataToAnalyze);
        
        // Update counts
        document.getElementById('total-count').textContent = this.dataLoader.processedData?.length || 0;
        document.getElementById('visible-count').textContent = dataToAnalyze?.length || 0;
        
        // Update selected info
        const selectedDataPoint = this.visualization.getSelectedDataPoint();
        const selectedInfo = document.getElementById('selected-info');
        
        if (selectedDataPoint) {
            selectedInfo.textContent = `${selectedDataPoint.role} (${selectedDataPoint.industryCategory})`;
        } else {
            selectedInfo.textContent = 'None';
        }
    }

    handleDataPointSelection(dataPoint) {
        console.log('Data point selected:', dataPoint);
        this.updateStatistics();
        this.showDetailModal(dataPoint);
    }

    showDetailModal(dataPoint) {
        const modal = document.getElementById('detail-modal');
        const modalBody = document.getElementById('modal-body');
        
        // Create detailed information display
        modalBody.innerHTML = `
            <h2>${dataPoint.role}</h2>
            
            <div class="detail-section">
                <h3>Professional Information</h3>
                <p><strong>Industry:</strong> ${dataPoint.industry}</p>
                <p><strong>Category:</strong> ${dataPoint.industryCategory}</p>
                <p><strong>Role Group:</strong> ${dataPoint.group}</p>
            </div>
            
            <div class="detail-section">
                <h3>Location</h3>
                <p><strong>Location:</strong> ${dataPoint.fullLocation}</p>
                <p><strong>City:</strong> ${dataPoint.city}</p>
                <p><strong>State:</strong> ${dataPoint.state || 'N/A'}</p>
                <p><strong>Country:</strong> ${dataPoint.country}</p>
            </div>
            
            <div class="detail-section">
                <h3>Engagement</h3>
                <p><strong>Confirmed:</strong> ${this.formatDate(dataPoint.confirmTime)}</p>
                <p><strong>Last Updated:</strong> ${this.formatDate(dataPoint.lastChanged)}</p>
            </div>
            
            <div class="detail-section">
                <h3>Network Position</h3>
                <p><strong>ID:</strong> ${dataPoint.id}</p>
                <p><strong>Connections:</strong> ${dataPoint.connections?.length || 0}</p>
            </div>
        `;
        
        modal.style.display = 'block';
        modal.classList.add('fade-in');
    }

    hideModal() {
        const modal = document.getElementById('detail-modal');
        modal.classList.add('fade-out');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('fade-in', 'fade-out');
        }, 300);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    // Public methods for external control
    clearFilters() {
        // Reset all filter controls
        document.getElementById('industry-filter').selectedIndex = 0;
        document.getElementById('location-filter').selectedIndex = 0;
        document.getElementById('role-filter').selectedIndex = 0;
        
        this.currentFilters = {
            industries: [],
            locations: [],
            roles: []
        };
        
        // Update visualization with all data
        this.visualization.updateData(this.dataLoader.processedData);
        this.updateStatistics();
    }

    applyPresetFilter(filterType, value) {
        // Apply a specific filter programmatically
        switch (filterType) {
            case 'industry':
                const industrySelect = document.getElementById('industry-filter');
                industrySelect.value = value;
                break;
            case 'location':
                const locationSelect = document.getElementById('location-filter');
                locationSelect.value = value;
                break;
            case 'role':
                const roleSelect = document.getElementById('role-filter');
                roleSelect.value = value;
                break;
        }
        
        this.updateFilters();
    }

    exportCurrentView() {
        // Export current filtered data as JSON
        const filteredData = this.dataLoader.getFilteredData(this.currentFilters);
        const dataToExport = {
            filters: this.currentFilters,
            data: filteredData,
            statistics: this.dataLoader.getStatistics(filteredData),
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `htw-community-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Search functionality
    searchData(query) {
        if (!query || query.length < 2) {
            this.clearFilters();
            return;
        }
        
        const searchQuery = query.toLowerCase();
        const filteredData = this.dataLoader.processedData.filter(dataPoint => {
            return (
                dataPoint.role.toLowerCase().includes(searchQuery) ||
                dataPoint.industry.toLowerCase().includes(searchQuery) ||
                dataPoint.fullLocation.toLowerCase().includes(searchQuery) ||
                dataPoint.group.toLowerCase().includes(searchQuery)
            );
        });
        
        this.visualization.updateData(filteredData);
        this.updateStatistics(filteredData);
        
        console.log(`Search "${query}" found ${filteredData.length} results`);
    }
}
