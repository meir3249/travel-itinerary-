const fs = require('fs');
const files = ['js/config.js', 'js/api.js', 'js/map.js', 'js/ui.js', 'js/app.js', 'sw.js'];

files.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    // Simple check using Function body after stripping ES module keywords for eval check
    const stripped = code
      .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default/g, '')
      .replace(/export\s+/g, '');
    new Function(stripped);
    console.log(`✓ Syntax valid: ${file}`);
  } catch (err) {
    console.error(`❌ Syntax error in ${file}:`, err.message);
    process.exit(1);
  }
});

console.log('All JavaScript files passed syntax verification!');
