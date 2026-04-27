const fs = require('fs');

console.log('🔍 Checking Tailwind setup...\n');

// Check files exist
const files = [
  'tailwind.config.js',
  'postcss.config.js',
  'app/globals.css',
  'package.json'
];

files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  
  if (exists && file === 'app/globals.css') {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('@tailwind')) {
      console.log('   Contains @tailwind directives');
    } else {
      console.log('   ❌ Missing @tailwind directives');
    }
  }
  
  if (exists && file === 'tailwind.config.js') {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('app')) {
      console.log('   Includes app directory');
    } else {
      console.log('   ❌ May not include app directory');
    }
  }
});

console.log('\n📦 Checking dependencies...');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = ['tailwindcss', 'postcss', 'autoprefixer'];
deps.forEach(dep => {
  const version = pkg.devDependencies?.[dep] || pkg.dependencies?.[dep];
  console.log(`${version ? '✅' : '❌'} ${dep}: ${version || 'NOT INSTALLED'}`);
});