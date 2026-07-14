const fs = require('fs');
let c = fs.readFileSync('scripts/generate-previews.js', 'utf8');
c = c.replace(/\\\$\{/g, '${');
fs.writeFileSync('scripts/generate-previews.js', c, 'utf8');
