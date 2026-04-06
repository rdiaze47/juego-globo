const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Colores vibrantes para el icono
const COLORS = {
    primary: '#FF6B9D',      // Rosa fuerte
    secondary: '#FF8FAB',     // Rosa claro
    highlight: '#FFB6C1',    // Rosa pastel
    accent: '#FFE66D',       // Amarillo dorado
    dark: '#C44569'          // Rosa oscuro
};

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

const darkRgb = hexToRgb(COLORS.dark);
const accentRgb = hexToRgb(COLORS.accent);

function createPngBuffer(size) {
    const width = size;
    const height = size;
    
    const rawData = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (width / 2) - 2;
    
    // Colores RGB
    const primary = hexToRgb(COLORS.primary);
    const highlight = hexToRgb(COLORS.highlight);
    
    for (let y = 0; y < height; y++) {
        rawData.push(0); // Filter byte
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            
            if (dist <= radius) {
                // Gradiente radial para dar volumen
                const normDist = dist / radius;
                
                // Brillo principal en la parte superior izquierda
                const lightX = centerX - radius * 0.35;
                const lightY = centerY - radius * 0.35;
                const lightDist = Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2);
                const lightFactor = Math.max(0, 1 - lightDist / (radius * 0.6));
                
                // Color base con gradiente
                let r = primary.r * (1 - normDist * 0.3) + highlight.r * normDist * 0.3;
                let g = primary.g * (1 - normDist * 0.3) + highlight.g * normDist * 0.3;
                let b = primary.b * (1 - normDist * 0.3) + highlight.b * normDist * 0.3;
                
                // Añadir brillo (reflejo)
                r = Math.min(255, r + lightFactor * 80);
                g = Math.min(255, g + lightFactor * 80);
                b = Math.min(255, b + lightFactor * 80);
                
                // Reflejo ovalado en la parte superior
                const ellipseX = centerX - radius * 0.3;
                const ellipseY = centerY - radius * 0.35;
                const ellipseRx = radius * 0.25;
                const ellipseRy = radius * 0.15;
                const ellipseDist = Math.sqrt(
                    ((x - ellipseX) / ellipseRx) ** 2 + 
                    ((y - ellipseY) / ellipseRy) ** 2
                );
                if (ellipseDist <= 1) {
                    const alpha = (1 - ellipseDist) * 0.5;
                    r = r * (1 - alpha) + 255 * alpha;
                    g = g * (1 - alpha) + 255 * alpha;
                    b = b * (1 - alpha) + 255 * alpha;
                }
                
                // Estrellitas doradas decorativas
                const sparkle1 = { x: centerX + radius * 0.55, y: centerY - radius * 0.25, r: size * 0.05 };
                const d1 = Math.sqrt((x - sparkle1.x) ** 2 + (y - sparkle1.y) ** 2);
                if (d1 < sparkle1.r) {
                    const alpha = (1 - d1 / sparkle1.r);
                    r = r * (1 - alpha) + accentRgb.r * alpha;
                    g = g * (1 - alpha) + accentRgb.g * alpha;
                    b = b * (1 - alpha) + accentRgb.b * alpha;
                }
                
                // Borde del globo (más oscuro)
                if (dist > radius - 3) {
                    const edgeAlpha = (dist - (radius - 3)) / 3;
                    r = r * (1 - edgeAlpha) + darkRgb.r * edgeAlpha;
                    g = g * (1 - edgeAlpha) + darkRgb.g * edgeAlpha;
                    b = b * (1 - edgeAlpha) + darkRgb.b * edgeAlpha;
                }
                
                rawData.push(Math.min(255, Math.floor(r)));
                rawData.push(Math.min(255, Math.floor(g)));
                rawData.push(Math.min(255, Math.floor(b)));
                rawData.push(255);
            } else {
                // Fondo transparente
                rawData.push(0, 0, 0, 0);
            }
        }
    }
    
    const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
    
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 6;
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;
    
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
    console.log('🎨 Generando iconos animados y lindos...\n');
    
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
    
    console.log('\n✅ Iconos generados correctamente!');
    console.log('   🎈 Globo con gradiente, brillo y estrella dorada');
}

generateIcons();