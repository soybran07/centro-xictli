// Genera favicon, ícono de iPhone e imagen para redes a partir del logo.
// Se ejecuta solo antes de `npm run dev` y `npm run build`.
import sharp from 'sharp';

const logo = 'public/img/logo-claro.png';
const blanco = { r: 255, g: 255, b: 255, alpha: 1 };

async function cuadrado(tamano, salida) {
  await sharp(logo)
    .resize(tamano, tamano, { fit: 'contain', background: blanco })
    .flatten({ background: blanco })
    .png()
    .toFile(salida);
}

await cuadrado(48, 'public/favicon.png');
await cuadrado(180, 'public/apple-touch-icon.png');

const centro = await sharp(logo)
  .resize(520, 520, { fit: 'inside' })
  .toBuffer();

await sharp({ create: { width: 1200, height: 630, channels: 4, background: blanco } })
  .composite([{ input: centro, gravity: 'center' }])
  .png()
  .toFile('public/img/og.png');
