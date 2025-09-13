import csvData from '@data/HTW2025Audience.csv';
import * as d3 from 'd3';

export class DataLoader {
    constructor() {
        this.rawData = null;
        this.processedData = null;
        this.industries = new Set();
        this.cities = new Set();
        this.roles = new Set();
    }

    async loadData() {
        try {
            // Parse CSV data using D3
            this.rawData = d3.csvParse(csvData);
            console.log('Raw data loaded:', this.rawData.length, 'records');
            
            // Process and clean the data
            this.processedData = this.processData(this.rawData);
            console.log('Processed data:', this.processedData.length, 'records');
            
            return this.processedData;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
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

    // Get filtered data based on current filter settings
    getFilteredData(filters = {}) {
        if (!this.processedData) return [];

        return this.processedData.filter(dataPoint => {
            // Industry filter
            if (filters.industries && filters.industries.length > 0 && !filters.industries.includes('all')) {
                if (!filters.industries.includes(dataPoint.industryCategory)) {
                    return false;
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
                if (!filters.roles.includes(dataPoint.group)) {
                    return false;
                }
            }

            return true;
        });
    }

    // Get unique values for filter dropdowns
    getFilterOptions() {
        return {
            industries: Array.from(this.industries).sort(),
            locations: Array.from(this.cities).sort(),
            roles: Array.from(this.roles).sort()
        };
    }

    // Get statistics about the data
    getStatistics(data = null) {
        const dataToAnalyze = data || this.processedData;
        if (!dataToAnalyze) return {};

        const stats = {
            total: dataToAnalyze.length,
            byIndustry: {},
            byRole: {},
            byLocation: {},
            byCountry: {}
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

        return stats;
    }
}
