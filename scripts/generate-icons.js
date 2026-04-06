const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Colores del juego
const PRIMARY_COLOR = '#FF6B9D';

function createPngBuffer(size) {
    const width = size;
    const height = size;
    
    // Crear datos de píxeles
    const rawData = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (width / 2) - 2;
    
    // Convertir color hex a RGB
    const r = parseInt(PRIMARY_COLOR.slice(1, 3), 16);
    const g = parseInt(PRIMARY_COLOR.slice(3, 5), 16);
    const b = parseInt(PRIMARY_COLOR.slice(5, 7), 16);
    
    for (let y = 0; y < height; y++) {
        rawData.push(0); // Filter byte
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (dist <= radius) {
                const factor = Math.max(0.5, 1 - (dist / radius) * 0.5);
                rawData.push(Math.floor(r * factor));
                rawData.push(Math.floor(g * factor));
                rawData.push(Math.floor(b * factor));
                rawData.push(255);
            } else {
                rawData.push(0, 0, 0, 0);
            }
        }
    }
    
    const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
    
    // Construir PNG
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // IHDR
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;  // bit depth
    ihdrData[9] = 6;  // color type RGBA
    ihdrData[10] = 0; // compression
    ihdrData[11] = 0; // filter
    ihdrData[12] = 0; // interlace
    
    const ihdr = createChunk('IHDR', ihdrData);
    const idat = createChunk('IDAT', compressed);
    const iend = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData) >>> 0, 0);
    
    return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
    let crc = 0xffffffff;
    const table = [];
    
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c;
    }
    
    for (let i = 0; i < buffer.length; i++) {
        crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
    }
    
    return crc ^ 0xffffffff;
}

function generateIcons() {
    console.log('🎨 Generando iconos para Android...\n');
    
    const resDir = path.join('android', 'app', 'src', 'main', 'res');
    
    const densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    };
    
    for (const [folder, size] of Object.entries(densities)) {
        const dir = path.join(resDir, folder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const png = createPngBuffer(size);
        fs.writeFileSync(path.join(dir, 'ic_launcher.png'), png);
        console.log(`   ✅ ${folder}/ic_launcher.png (${size}x${size})`);
    }
    
    // Crear drawable para foreground
    const drawableDir = path.join(resDir, 'drawable');
    if (!fs.existsSync(drawableDir)) {
        fs.mkdirSync(drawableDir, { recursive: true });
    }
    
    // Icono foreground más grande (108x108 para adaptive icon)
    const fgPng = createPngBuffer(108);
    fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.png'), fgPng);
    console.log(`   ✅ drawable/ic_launcher_foreground.png`);
    
    // Adaptive icon para Android 8+
    const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
    if (!fs.existsSync(anydpiDir)) {
        fs.mkdirSync(anydpiDir, { recursive: true });
    }
    
    const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground.png"/>
</adaptive-icon>`;
    
    fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
    console.log(`   ✅ mipmap-anydpi-v26/ic_launcher.xml`);
    
    // Colores
    const valuesDir = path.join(resDir, 'values');
    if (!fs.existsSync(valuesDir)) {
        fs.mkdirSync(valuesDir, { recursive: true });
    }
    
    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1a1a2e</color>
</resources>`;
    
    fs.writeFileSync(path.join(valuesDir, 'colors.xml'), colorsXml);
    console.log(`   ✅ values/colors.xml`);
    
    console.log('\n✅ Iconos generados correctamente!');
}

generateIcons();