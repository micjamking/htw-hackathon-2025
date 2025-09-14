# HTW 2025 Ohana Network - Production Deployment Guide

## 🚀 Quick Deployment

### Option 1: GitHub Pages (Automated)
```bash
npm run deploy
```

### Option 2: Manual Deployment
```bash
npm run build
# Copy contents of dist/ to your web server
```

## 📋 Pre-Deployment Checklist

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Verify assets**
   ```bash
   npm run verify
   ```

3. **Test locally**
   ```bash
   npx serve dist
   ```

## 🗂️ Production Asset Structure

```
dist/
├── index.html              # Landing page
├── map.html                # Main visualization page
├── main.[hash].js          # Main application bundle (870KB)
├── landing.[hash].js       # Landing page bundle (37KB)
├── assets/
│   └── textures/          # Earth texture files (fallbacks)
│       ├── earth_blue_marble.jpg (329KB)
│       ├── earth_color.jpg (93KB)
│       └── earth_map.jpg (501KB)
└── data/
    └── HTW2025Audience.csv # Community data (252KB)
```

## 🌐 Asset Loading Strategy

### Textures (Earth Globe)
1. **Primary**: CDN sources (GitHub/JSDelivr)
2. **Fallback**: Local assets in `./assets/textures/`
3. **Final Fallback**: Solid color material

### Data (Community Members)
- **Bundled**: CSV data is webpack-bundled into JS
- **Fallback**: Demo data with Hawaii clusters

## ⚡ Performance Optimizations

### Bundle Sizes
- **Main bundle**: 870KB (includes Three.js, D3, and app code)
- **Landing bundle**: 37KB
- **Total assets**: ~2MB including textures

### Recommendations
1. **Enable GZIP compression** on your server
2. **Use CDN** for faster global delivery
3. **Monitor Core Web Vitals** for user experience

### Server Configuration Examples

#### Apache (.htaccess)
```apache
# Enable GZIP compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

#### Nginx
```nginx
# Enable GZIP
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Set cache headers
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔧 Environment-Specific Configurations

### Production Environment Variables
```bash
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
```

### Feature Flags (if needed)
```javascript
// In src/js/config.js
export const config = {
    isDevelopment: process.env.NODE_ENV === 'development',
    useLocalAssets: process.env.USE_LOCAL_ASSETS === 'true',
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.your-domain.com'
};
```

## 🌍 CDN Deployment

### Option 1: Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Option 2: Vercel
1. Import project from GitHub
2. Framework preset: Other
3. Build command: `npm run build`
4. Output directory: `dist`

### Option 3: AWS S3 + CloudFront
```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Assets not loading**
   - Check browser console for 404 errors
   - Verify asset paths in network tab
   - Ensure server serves static files correctly

2. **Large bundle size**
   - Monitor bundle analyzer: `npm install --save-dev webpack-bundle-analyzer`
   - Consider code splitting for better performance

3. **CSP (Content Security Policy) issues**
   - Whitelist CDN domains for textures
   - Allow unsafe-eval if using Three.js shaders

### Debug Mode
```javascript
// Add to main.js for debugging
if (process.env.NODE_ENV === 'development') {
    window.htwDebug = {
        visualization: window.htwApp?.getVisualization(),
        dataLoader: window.htwApp?.getDataLoader()
    };
}
```

## 📊 Monitoring

### Essential Metrics
- **Load Time**: Target < 3 seconds
- **Bundle Parse Time**: Monitor main.js execution
- **Asset Load Success**: Track texture/data loading
- **User Interactions**: Cluster expansions, camera movements

### Analytics Integration
```javascript
// Add to main.js
if (typeof gtag !== 'undefined') {
    gtag('event', 'app_loaded', {
        event_category: 'engagement',
        app_version: '1.0.0'
    });
}
```

## 🔄 Continuous Deployment

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run verify
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🌺 Success Criteria

Your HTW 2025 Ohana Network is ready for production when:
- ✅ Build completes without errors
- ✅ Asset verification passes
- ✅ All textures load (CDN or fallback)
- ✅ Community data displays correctly
- ✅ Hawaii-centered view is default
- ✅ Cluster interactions work smoothly
- ✅ Performance is acceptable on target devices

---

For additional support, check the project README or create an issue in the repository.