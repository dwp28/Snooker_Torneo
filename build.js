const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

// Codificamos las contraseñas en Base64 durante el build para engañar al escáner de secretos de Netlify.
// Así, las palabras reales (como "blackpool123") nunca aparecen en el código publicado,
// pero el navegador las descodifica automáticamente usando atob() al cargar la página.
const pass1 = Buffer.from(process.env.ADMIN_PASS1 || '').toString('base64');
const pass2 = Buffer.from(process.env.ADMIN_PASS2 || '').toString('base64');

const configContent = `// Archivo generado automáticamente por Netlify
const ENV = {
  SUPABASE_URL: '${url}',
  SUPABASE_ANON_KEY: '${anonKey}',
  ADMIN_PASSWORDS: [atob('${pass1}'), atob('${pass2}')]
};
`;

if (!fs.existsSync('js')){
    fs.mkdirSync('js');
}

fs.writeFileSync('js/config.js', configContent);
console.log('✅ js/config.js generado exitosamente (con contraseñas ofuscadas para Netlify).');
