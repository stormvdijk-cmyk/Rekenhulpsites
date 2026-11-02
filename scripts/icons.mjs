// Genereert de PWA-iconen uit public/favicon.svg: node scripts/icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const svg = readFileSync('public/favicon.svg');
// Maskable: icoon op 70% in een gevulde veilige zone
const maskable = async (size) => sharp({ create: { width: size, height: size, channels: 4, background: '#0f4c5c' } })
  .composite([{ input: await sharp(svg).resize(Math.round(size * 0.7)).png().toBuffer(), gravity: 'center' }]).png();
await sharp(svg).resize(192).png().toFile('public/icon-192.png');
await sharp(svg).resize(512).png().toFile('public/icon-512.png');
await (await maskable(512)).toFile('public/icon-maskable-512.png');
await (await maskable(192)).toFile('public/icon-maskable-192.png');
await sharp(svg).resize(180).flatten({ background: '#0f4c5c' }).png().toFile('public/apple-touch-icon.png');
console.log('iconen klaar');
