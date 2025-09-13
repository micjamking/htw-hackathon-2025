# HTW Community 3D Visualization

An interactive 3D data visualization of the Hawaii Tech Works (HTW) community built with Three.js and D3.js. This project was created for the HTW 2025 Hackathon to showcase the vibrant tech community in Hawaii through an immersive 3D network visualization.

## 🌟 Features

- **Interactive 3D Visualization**: Explore the HTW community network in an immersive 3D environment with smooth camera controls
- **Dynamic Filtering**: Multi-dimensional filtering by industry, location, and role to focus on specific community segments
- **Real-time Statistics**: Live analytics and member counts with instant updates
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Performance Optimized**: Efficient WebGL rendering with 60fps animations and memory management
- **Data Export**: Export filtered views and statistics for further analysis
- **Accessibility**: Full keyboard navigation and screen reader support
- **Custom Shaders**: GLSL shaders for enhanced visual effects and particle systems

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/micjamking/htw-hackathon-2025.git
cd htw-hackathon-2025
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The optimized build will be generated in the `dist` directory.

### Deployment

The project includes automated GitHub Pages deployment:

```bash
npm run deploy
```

Or use the GitHub Actions workflow for automatic deployment on push to main branch.

## 🏗️ Architecture

### Project Structure

```
htw-hackathon-2025/
├── src/
│   ├── js/
│   │   ├── main.js           # Application entry point and initialization
│   │   ├── dataLoader.js     # CSV data processing, filtering, and validation
│   │   ├── visualization.js  # Three.js 3D scene management and rendering
│   │   ├── controls.js       # UI controls, interactions, and event handling
│   │   └── utils.js          # Utility functions and helper methods
│   ├── css/
│   │   ├── main.css          # Main styles and layout
│   │   └── components.css    # Component-specific styles and animations
│   └── shaders/
│       ├── vertex.glsl       # Custom vertex shader for particle effects
│       └── fragment.glsl     # Custom fragment shader for visual enhancements
├── public/
│   └── index.html           # Main HTML template with UI structure
├── assets/
│   ├── textures/            # Texture files for 3D rendering
│   └── models/              # 3D model files (future expansion)
├── data/
│   └── HTW2025Audience.csv  # HTW community member data
├── .github/workflows/
│   └── deploy.yml           # Automated GitHub Pages deployment
├── dist/                    # Production build output (generated)
└── docs/                    # Project documentation and design guides
```

### Key Components

- **DataLoader**: Processes HTW CSV data, implements smart categorization, and provides advanced filtering capabilities
- **Visualization**: Manages Three.js scene with camera controls, lighting, and interactive 3D objects
- **Controls**: Handles all user interactions including filters, modals, keyboard shortcuts, and touch events
- **Utils**: Comprehensive utility library for performance monitoring, data manipulation, and browser compatibility

### Data Processing Pipeline

1. **CSV Parsing**: Loads and parses HTW2025Audience.csv using D3.js
2. **Data Cleaning**: Validates and sanitizes member information
3. **Smart Categorization**: Auto-categorizes industries and role types
4. **3D Positioning**: Calculates optimal positioning using industry clustering and geographic data
5. **Relationship Mapping**: Creates connections between related community members

## 📊 Data Visualization

The visualization represents HTW community members as interactive 3D points in a virtual space:

### Visual Encoding
- **Position**: Industry-based clustering with geographic considerations
- **Color**: 11-category color coding for different industry types
- **Size**: Dynamic sizing based on role seniority and engagement
- **Connections**: Network lines showing relationships and collaborations
- **Animation**: Subtle floating motion and interaction feedback

### Industry Categories & Colors
- Technology (Cyan Blue: #00d4ff)
- AI/ML (Hot Pink: #ff6b9d)
- Finance (Teal: #4ecdc4)
- Education (Golden Yellow: #ffc048)
- Healthcare (Mint Green: #95e1d3)
- Marketing (Rose: #f38ba8)
- Media (Sage Green: #a8e6cf)
- Consulting (Lavender: #dda0dd)
- Cybersecurity (Coral Red: #ff6b6b)
- AR/VR (Violet: #9d65c9)
- Other (Gray: #999999)

### Interaction Features
- **Hover Effects**: Real-time tooltips with member information
- **Selection**: Click to select and view detailed member profiles
- **Filtering**: Dynamic filtering with smooth transitions
- **Camera Controls**: Orbit, zoom, and pan with momentum
- **Search**: Text-based search across all member data

## 🎮 User Interactions

### Mouse/Touch Controls
- **Orbit**: Click and drag to rotate around the community network
- **Zoom**: Mouse wheel or pinch to zoom in/out for detailed exploration
- **Pan**: Right-click drag or two-finger drag to pan across the visualization
- **Select**: Click on any member point to view detailed information
- **Hover**: Mouse over points for quick info tooltips

### Keyboard Shortcuts
- **R**: Reset camera to default position and zoom
- **C**: Clear all active filters and show full community
- **Ctrl/Cmd + E**: Export current filtered view as JSON
- **Escape**: Close open modals and return to main view
- **Ctrl/Cmd + F**: Toggle fullscreen mode
- **Arrow Keys**: Fine camera movement controls

### Advanced Filtering
- **Industry Filter**: Multi-select dropdown for industry categories
- **Location Filter**: Geographic filtering by city, state, or country
- **Role Filter**: Filter by job roles and seniority levels
- **Search**: Real-time text search across all member data
- **Combined Filters**: Apply multiple filters simultaneously for precise targeting

### Data Export & Analytics
- **Export Options**: JSON, CSV formats with current filter settings
- **Statistics Panel**: Live member counts, distribution analytics
- **Performance Metrics**: FPS counter and memory usage monitoring

## 🛠️ Development

### Technologies Used

- **Three.js v0.157**: 3D graphics rendering and scene management
- **D3.js v7.8**: Data processing, CSV parsing, and utility functions
- **Webpack 5**: Modern module bundling with hot reload and optimization
- **ES6+ JavaScript**: Modern syntax with modules, async/await, and classes
- **CSS3**: Advanced styling with flexbox, grid, and custom properties
- **GLSL**: Custom shaders for enhanced visual effects and performance

### Code Architecture
- **Modular Design**: Clean separation of concerns with ES6 modules
- **Event-Driven**: Custom event system for component communication
- **Performance First**: Optimized rendering loop with requestAnimationFrame
- **Error Handling**: Comprehensive error catching and user feedback
- **Responsive**: Mobile-first design with progressive enhancement

### Browser Support
- Chrome 80+ (Recommended)
- Firefox 75+
- Safari 13+
- Edge 80+
- Requires WebGL support for 3D rendering

### Performance Optimizations
- Efficient 3D object pooling and culling
- Debounced user interactions to prevent lag
- Progressive data loading for large datasets
- Memory usage monitoring and cleanup
- Responsive design patterns for mobile devices

## 📈 Data Source

This visualization uses data from the HTW 2025 community registration, including:
- **400+ Community Members**: Tech professionals across Hawaii
- **Industry Distribution**: 11 major technology sectors
- **Geographic Spread**: Multiple islands and mainland connections
- **Role Diversity**: From students to C-level executives
- **Engagement Metrics**: Registration and participation data

## 🎯 Future Enhancements

- **Real-time Data**: Live API integration for dynamic updates
- **AR/VR Support**: WebXR implementation for immersive experiences
- **Social Features**: Member connections and collaboration tracking
- **Advanced Analytics**: Machine learning insights and predictions
- **Event Integration**: Timeline visualization of community events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ES6+ JavaScript standards
- Use semantic commit messages
- Add JSDoc comments for public APIs
- Test on multiple browsers and devices
- Ensure accessibility compliance (WCAG 2.1)

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hawaii Tech Works Community** for the inspiring data and collaboration
- **Three.js Team** for the excellent 3D graphics library
- **D3.js Community** for powerful data processing capabilities
- **HTW 2025 Hackathon Organizers** for the opportunity to showcase Hawaii's tech talent

## 📞 Support & Contact

For questions, support, or collaboration opportunities:

- **Issues**: [GitHub Issues](https://github.com/micjamking/htw-hackathon-2025/issues)
- **Discussions**: [GitHub Discussions](https://github.com/micjamking/htw-hackathon-2025/discussions)
- **Email**: Connect through the HTW community

---

**Built with ❤️ for the HTW 2025 Hackathon** 🌺🏝️

*Showcasing Hawaii's vibrant tech community through interactive 3D visualization*
