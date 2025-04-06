const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

module.exports = function(app) {
    const routesPath = path.join(__dirname, 'routes');
    const files = fs.readdirSync(routesPath);

    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const routePath = path.join(routesPath, file);
                require(routePath)(app);
                logger.info(`✓ Loaded route: ${file}`);
            } catch (err) {
                logger.error(`Error loading route ${file}:`, err);
                process.exit(1);
            }
        }
    }
}