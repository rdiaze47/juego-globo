const fs = require('fs');
const path = require('path');

// Lee la versión del package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version.replace(/\./g, '_'); // 1.0.0 -> 1_0_0

// Crea la carpeta dist si no existe
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Nombre del APK con versión
const apkName = `unglobo-v${version}.apk`;
const sourcePath = 'android/app/build/outputs/apk/debug/app-debug.apk';
const destPath = path.join('dist', apkName);

// Copia el APK
if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    
    // Obtiene información del archivo
    const stats = fs.statSync(destPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ APK generado exitosamente!`);
    console.log(`   📦 Archivo: ${apkName}`);
    console.log(`   📊 Tamaño: ${sizeMB} MB`);
    console.log(`   📁 Ubicación: dist/`);
} else {
    console.error('❌ Error: No se encontró el APK编译ado');
    console.log('   Ejecuta: npm run build:android');
    process.exit(1);
}