import * as d3 from 'd3';
import csvData from '@data/HTW2025Audience.csv';

export class DataLoader {
    constructor() {
        this.rawData = null;
        this.processedData = null;
        this.clusteredData = null;
        
        // Collections for filter options
        this.industries = new Set();
        this.cities = new Set();
        this.roles = new Set();
        
        // Performance configuration
        this.performanceConfig = {
            maxRenderPoints: 2000,
            adaptiveDetail: true,
            lodDistances: {
                high: 50,
                medium: 150,
                low: 300
            }
        };
        
        this.coordinateCache = new Map();
    }

    async loadData() {
        try {
            console.log('Parsing CSV data...');
            const parsedData = d3.csvParse(csvData);
            this.rawData = parsedData;
            
            console.log('Processing raw data...');
            this.processedData = this.processData(this.rawData);
            
            console.log('Creating clustered data for performance...');
            await this.createClusteredData();
            
            return this.clusteredData;
        } catch (error) {
            console.error('Error loading or processing data:', error);
            throw new Error('Failed to load community data. Please check the data source and format.');
        }
    }

    // Create clustered data for performance optimization
    async createClusteredData() {
        if (!this.processedData) return;

        // Group data by location for clustering
        const locationGroups = new Map();
        
        this.processedData.forEach(point => {
            const locationKey = `${point.city}_${point.state}_${point.country}`;
            if (!locationGroups.has(locationKey)) {
                locationGroups.set(locationKey, []);
            }
            locationGroups.get(locationKey).push(point);
        });

        // Create clustered points
        this.clusteredData = [];
        let clusterId = 0;

        for (const [locationKey, points] of locationGroups) {
            if (points.length === 0) continue;

            const representative = points[0];
            const coordinates = await this.getLocationCoordinates(representative);
            
            if (points.length === 1) {
                // Single point - add directly
                this.clusteredData.push({
                    ...representative,
                    id: `cluster_${clusterId++}`,
                    coordinates,
                    isCluster: false,
                    memberCount: 1,
                    members: [representative],
                    industries: [representative.industryCategory],
                    roles: [representative.group]
                });
            } else {
                // Multiple points - create cluster
                const industries = [...new Set(points.map(p => p.industryCategory))];
                const roles = [...new Set(points.map(p => p.group))];
                
                this.clusteredData.push({
                    id: `cluster_${clusterId++}`,
                    role: `${points.length} members`,
                    city: representative.city,
                    state: representative.state,
                    country: representative.country,
                    industry: industries.length > 1 ? 'Mixed Industries' : industries[0],
                    fullLocation: representative.fullLocation,
                    coordinates,
                    isCluster: true,
                    memberCount: points.length,
                    members: points,
                    industries,
                    roles,
                    industryCategory: industries.length === 1 ? industries[0] : 'Mixed',
                    group: roles.length === 1 ? roles[0] : 'Mixed'
                });
            }
        }

        // Sort clusters by member count for LOD optimization
        this.clusteredData.sort((a, b) => b.memberCount - a.memberCount);
    }

    // Get coordinates for a location (with caching)
    async getLocationCoordinates(dataPoint) {
        const locationKey = `${dataPoint.city}_${dataPoint.state}_${dataPoint.country}`;
        
        if (this.coordinateCache.has(locationKey)) {
            return this.coordinateCache.get(locationKey);
        }

        // Use approximate coordinates based on common locations
        let coordinates = this.getApproximateCoordinates(dataPoint);
        
        // Add some random variation for visual distribution
        coordinates.lat += (Math.random() - 0.5) * 0.1;
        coordinates.lng += (Math.random() - 0.5) * 0.1;
        
        this.coordinateCache.set(locationKey, coordinates);
        return coordinates;
    }

    // Get approximate coordinates for major locations
    getApproximateCoordinates(dataPoint) {
        const { city, state, country } = dataPoint;
        
        // Hawaii locations (most common)
        if (state === 'HI' || country === 'USA') {
            if (city && city.toLowerCase().includes('honolulu')) {
                return { lat: 21.3099, lng: -157.8581 };
            }
            if (city && city.toLowerCase().includes('kailua')) {
                return { lat: 21.4022, lng: -157.7394 };
            }
            if (city && city.toLowerCase().includes('kaneohe')) {
                return { lat: 21.4180, lng: -157.8029 };
            }
            if (city && city.toLowerCase().includes('pearl')) {
                return { lat: 21.3891, lng: -157.9750 };
            }
            // Default Hawaii
            return { lat: 21.3099, lng: -157.8581 };
        }

        // US Mainland major cities
        if (country === 'USA') {
            if (state === 'CA') return { lat: 37.7749, lng: -122.4194 }; // San Francisco
            if (state === 'NY') return { lat: 40.7128, lng: -74.0060 };  // New York
            if (state === 'TX') return { lat: 32.7767, lng: -96.7970 };  // Dallas
            if (state === 'WA') return { lat: 47.6062, lng: -122.3321 }; // Seattle
            if (state === 'FL') return { lat: 25.7617, lng: -80.1918 };  // Miami
            if (state === 'IL') return { lat: 41.8781, lng: -87.6298 };  // Chicago
            if (state === 'OR') return { lat: 45.5152, lng: -122.6784 }; // Portland
        }

        // International locations
        if (country === 'Canada') return { lat: 45.4215, lng: -75.6972 }; // Ottawa
        if (country === 'UK' || country === 'United Kingdom') return { lat: 51.5074, lng: -0.1278 }; // London
        if (country === 'Japan') return { lat: 35.6762, lng: 139.6503 }; // Tokyo
        if (country === 'Australia') return { lat: -33.8688, lng: 151.2093 }; // Sydney
        if (country === 'Singapore') return { lat: 1.3521, lng: 103.8198 };
        if (country === 'Germany') return { lat: 52.5200, lng: 13.4050 }; // Berlin
        if (country === 'France') return { lat: 48.8566, lng: 2.3522 }; // Paris

        // Default to Honolulu for unknown locations
        return { lat: 21.3099, lng: -157.8581 };
    }

    processData(data) {
        const processed = [];
        
        data.forEach((row, index) => {
            // Clean and validate data
            const role = this.cleanString(row['Role / Job Title']);
            const city = this.cleanString(row['City']);
            const state = this.cleanString(row['State / Province']);
            const country = this.cleanString(row['Country']);
            const industry = this.cleanString(row['Industry']);
            
            // Skip rows with missing essential data
            if (!role || !industry) {
                return;
            }

            // Create processed data point
            const dataPoint = {
                id: index,
                role: role,
                city: city || 'Unknown',
                state: state || '',
                country: country || 'Unknown',
                industry: industry,
                fullLocation: this.buildLocationString(city, state, country),
                confirmTime: row['CONFIRM_TIME'],
                lastChanged: row['LAST_CHANGED'],
                // Add computed fields for visualization
                position: null, // Will be set during visualization
                connections: [], // Will be computed based on relationships
                group: this.categorizeRole(role), // Simplified role category
                industryCategory: this.categorizeIndustry(industry)
            };

            // Collect unique values for filters
            this.industries.add(dataPoint.industryCategory);
            this.cities.add(dataPoint.fullLocation);
            this.roles.add(dataPoint.group);

            processed.push(dataPoint);
        });

        return processed;
    }

    cleanString(str) {
        if (!str || str === '-' || str.trim() === '') {
            return null;
        }
        return str.trim();
    }

    buildLocationString(city, state, country) {
        const parts = [city, state, country].filter(Boolean);
        return parts.join(', ') || 'Unknown Location';
    }

    categorizeRole(role) {
        const roleLower = role.toLowerCase();
        
        if (roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('programmer')) {
            return 'Engineering';
        }
        if (roleLower.includes('manager') || roleLower.includes('director') || roleLower.includes('lead')) {
            return 'Management';
        }
        if (roleLower.includes('sales') || roleLower.includes('account') || roleLower.includes('business development')) {
            return 'Sales';
        }
        if (roleLower.includes('marketing') || roleLower.includes('growth')) {
            return 'Marketing';
        }
        if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui')) {
            return 'Design';
        }
        if (roleLower.includes('analyst') || roleLower.includes('data')) {
            return 'Analytics';
        }
        if (roleLower.includes('consultant') || roleLower.includes('advisor')) {
            return 'Consulting';
        }
        if (roleLower.includes('founder') || roleLower.includes('ceo') || roleLower.includes('entrepreneur')) {
            return 'Leadership';
        }
        if (roleLower.includes('student') || roleLower.includes('intern')) {
            return 'Student';
        }
        
        return 'Other';
    }

    categorizeIndustry(industry) {
        if (!industry) return 'Other';
        
        const industryLower = industry.toLowerCase();
        
        if (industryLower.includes('software') || industryLower.includes('technology') || industryLower.includes('saas')) {
            return 'Technology';
        }
        if (industryLower.includes('ai') || industryLower.includes('machine learning') || industryLower.includes('ml')) {
            return 'AI/ML';
        }
        if (industryLower.includes('fintech') || industryLower.includes('financial')) {
            return 'Finance';
        }
        if (industryLower.includes('education') || industryLower.includes('edtech')) {
            return 'Education';
        }
        if (industryLower.includes('health') || industryLower.includes('medical') || industryLower.includes('biotech')) {
            return 'Healthcare';
        }
        if (industryLower.includes('marketing') || industryLower.includes('adtech')) {
            return 'Marketing';
        }
        if (industryLower.includes('media') || industryLower.includes('communications')) {
            return 'Media';
        }
        if (industryLower.includes('consulting') || industryLower.includes('professional services')) {
            return 'Consulting';
        }
        if (industryLower.includes('cybersecurity') || industryLower.includes('security')) {
            return 'Cybersecurity';
        }
        if (industryLower.includes('ar') || industryLower.includes('vr') || industryLower.includes('metaverse')) {
            return 'AR/VR';
        }
        
        return 'Other';
    }

    // Get filtered data based on current filter settings with LOD optimization
    getFilteredData(filters = {}, cameraDistance = 100) {
        if (!this.clusteredData) return [];

        let filtered = this.clusteredData.filter(dataPoint => {
            // Industry filter
            if (filters.industries && filters.industries.length > 0 && !filters.industries.includes('all')) {
                if (dataPoint.isCluster) {
                    // For clusters, check if any industry matches
                    return dataPoint.industries.some(industry => filters.industries.includes(industry));
                } else {
                    return filters.industries.includes(dataPoint.industryCategory);
                }
            }

            // Location filter
            if (filters.locations && filters.locations.length > 0 && !filters.locations.includes('all')) {
                if (!filters.locations.includes(dataPoint.fullLocation)) {
                    return false;
                }
            }

            // Role filter
            if (filters.roles && filters.roles.length > 0 && !filters.roles.includes('all')) {
                if (dataPoint.isCluster) {
                    // For clusters, check if any role matches
                    return dataPoint.roles.some(role => filters.roles.includes(role));
                } else {
                    return filters.roles.includes(dataPoint.group);
                }
            }

            return true;
        });

        // Apply Level of Detail (LOD) based on camera distance
        if (this.performanceConfig.adaptiveDetail) {
            filtered = this.applyLevelOfDetail(filtered, cameraDistance);
        }

        // Limit total render points for performance
        if (filtered.length > this.performanceConfig.maxRenderPoints) {
            // Sort by member count (importance) and take top N
            filtered = filtered
                .sort((a, b) => b.memberCount - a.memberCount)
                .slice(0, this.performanceConfig.maxRenderPoints);
        }

        return filtered;
    }

    // Apply Level of Detail optimization based on camera distance
    applyLevelOfDetail(data, cameraDistance) {
        const { lodDistances } = this.performanceConfig;
        
        if (cameraDistance <= lodDistances.high) {
            // Close view - show all points
            return data;
        } else if (cameraDistance <= lodDistances.medium) {
            // Medium view - show clusters with 2+ members
            return data.filter(point => point.memberCount >= 2);
        } else {
            // Far view - show only large clusters (5+ members)
            return data.filter(point => point.memberCount >= 5);
        }
    }

    // Get render-optimized data for specific regions
    getRegionData(region = 'global', cameraDistance = 100) {
        if (!this.clusteredData) return [];

        let regionData = this.clusteredData;

        if (region === 'hawaii') {
            regionData = this.clusteredData.filter(point => 
                point.state === 'HI' || point.country === 'USA' && point.city && 
                point.city.toLowerCase().includes('honolulu')
            );
        } else if (region === 'mainland') {
            regionData = this.clusteredData.filter(point => 
                point.country === 'USA' && point.state !== 'HI'
            );
        } else if (region === 'international') {
            regionData = this.clusteredData.filter(point => 
                point.country !== 'USA'
            );
        }

        return this.applyLevelOfDetail(regionData, cameraDistance);
    }

    // Get unique values for filter dropdowns
    getFilterOptions() {
        return {
            industries: Array.from(this.industries).sort(),
            locations: Array.from(this.cities).sort(),
            roles: Array.from(this.roles).sort()
        };
    }

    // Get statistics about the data (using original processed data for accuracy)
    getStatistics(data = null) {
        const dataToAnalyze = data || this.processedData;
        if (!dataToAnalyze) return {};

        const stats = {
            total: dataToAnalyze.length,
            totalClusters: this.clusteredData ? this.clusteredData.length : 0,
            byIndustry: {},
            byRole: {},
            byLocation: {},
            byCountry: {},
            topCountries: [],
            topIndustries: [],
            topRoles: [],
            performance: {
                renderPoints: this.clusteredData ? this.clusteredData.length : 0,
                originalPoints: dataToAnalyze.length,
                compressionRatio: this.clusteredData ? 
                    ((dataToAnalyze.length - this.clusteredData.length) / dataToAnalyze.length * 100).toFixed(1) + '%' 
                    : '0%'
            }
        };

        dataToAnalyze.forEach(point => {
            // Count by industry
            stats.byIndustry[point.industryCategory] = (stats.byIndustry[point.industryCategory] || 0) + 1;
            
            // Count by role
            stats.byRole[point.group] = (stats.byRole[point.group] || 0) + 1;
            
            // Count by location
            stats.byLocation[point.fullLocation] = (stats.byLocation[point.fullLocation] || 0) + 1;
            
            // Count by country
            stats.byCountry[point.country] = (stats.byCountry[point.country] || 0) + 1;
        });

        // Create sorted top lists for dashboard display
        stats.topCountries = Object.entries(stats.byCountry)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([country, count]) => ({ country, count }));

        stats.topIndustries = Object.entries(stats.byIndustry)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([industry, count]) => ({ industry, count }));

        stats.topRoles = Object.entries(stats.byRole)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([role, count]) => ({ role, count }));

        return stats;
    }

    // Get real-time performance metrics
    getPerformanceMetrics() {
        return {
            originalDataPoints: this.processedData ? this.processedData.length : 0,
            clusteredPoints: this.clusteredData ? this.clusteredData.length : 0,
            compressionRatio: this.processedData && this.clusteredData ? 
                ((this.processedData.length - this.clusteredData.length) / this.processedData.length * 100).toFixed(1) + '%' 
                : '0%',
            memoryUsage: this.coordinateCache.size,
            maxRenderPoints: this.performanceConfig.maxRenderPoints,
            adaptiveDetail: this.performanceConfig.adaptiveDetail
        };
    }

    // Get expanded cluster details for tooltip/modal display
    getClusterDetails(clusterId) {
        if (!this.clusteredData) return null;
        
        const cluster = this.clusteredData.find(c => c.id === clusterId);
        if (!cluster) return null;

        if (!cluster.isCluster) {
            return {
                isCluster: false,
                member: cluster.members[0],
                details: cluster
            };
        }

        // For clusters, provide summary and member breakdown
        const membersByIndustry = {};
        const membersByRole = {};
        
        cluster.members.forEach(member => {
            membersByIndustry[member.industryCategory] = (membersByIndustry[member.industryCategory] || 0) + 1;
            membersByRole[member.group] = (membersByRole[member.group] || 0) + 1;
        });

        return {
            isCluster: true,
            memberCount: cluster.memberCount,
            location: cluster.fullLocation,
            industries: cluster.industries,
            roles: cluster.roles,
            breakdown: {
                byIndustry: membersByIndustry,
                byRole: membersByRole
            },
            topMembers: cluster.members.slice(0, 5), // Show first 5 members
            coordinates: cluster.coordinates
        };
    }
}
