const fs = require('fs');
const babel = require('@babel/core');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Visualizer.jsx');
const code = fs.readFileSync(filePath, 'utf8');

console.log('Verifying syntax for:', filePath);

try {
    // Use transform with minimal configuration to check for parsing errors
    babel.transformSync(code, {
        presets: [
            [require.resolve('@babel/preset-react')]
        ],
        filename: filePath,
        configFile: false,
        babelrc: false
    });
    console.log('✅ SYNTAX VALID: The Visualizer.jsx file is correctly structured.');
} catch (err) {
    console.error('❌ SYNTAX ERROR:', err.message);
    process.exit(1);
}
