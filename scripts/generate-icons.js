import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPng(width, height, getPixel) {
  // width, height: ints
  // getPixel: (x, y) => [r, g, b, a]
  const bytesPerPixel = 4;
  const rowSize = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    const crc = calcCrc(full);
    crcBuf.writeUInt32BE(crc >>> 0, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function calcCrc(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return c ^ 0xffffffff;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT
  const idat = makeChunk('IDAT', deflated);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function generateMadarIcon(size, maskable = false) {
  return createPng(size, size, (x, y) => {
    const cx = size / 2;
    const cy = size / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Default navy blue background #0F2942
    let r = 15, g = 41, b = 66, a = 255;

    // Outer margin
    const radius = size * 0.44;
    const innerRadius = size * 0.32;

    if (dist < radius && dist >= radius - (size * 0.03)) {
      // Golden border ring #F59E0B
      r = 245; g = 158; b = 11;
    } else if (dist < innerRadius) {
      // Dark navy center #0A1929
      r = 10; g = 25; b = 41;
      
      // Center AC Fan / Cross blades
      const angle = Math.atan2(dy, dx);
      const bladeDist = dist / innerRadius;
      if (bladeDist < 0.8 && (Math.abs(dx) < size * 0.03 || Math.abs(dy) < size * 0.03)) {
        // Cyan glow #38BDF8
        r = 56; g = 189; b = 248;
      }
      // Diagonal blades
      if (bladeDist < 0.65 && Math.abs(Math.abs(dx) - Math.abs(dy)) < size * 0.025) {
        r = 245; g = 158; b = 11; // Gold accent
      }
      // Center hub
      if (dist < size * 0.06) {
        r = 245; g = 158; b = 11;
      }
    }

    return [r, g, b, a];
  });
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateMadarIcon(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateMadarIcon(512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateMadarIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateMadarIcon(180));
console.log('Generated all PWA icons successfully in /public');
