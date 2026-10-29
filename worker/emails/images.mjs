// Exports the photos the emails use to public/email/ (≤1200 px, ≤200 KB), served from the site.
// Run from the repo root: node worker/emails/images.mjs
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const OUT = 'public/email';
mkdirSync(OUT, { recursive: true });
// name: [source, width, height]. Hero photos 1200×720, tiles 600×450.
const PHOTOS = {
  retiro: ['esp-terraza-ambu-1', 1200, 720],
  evento: ['cena-candiles', 1200, 720],
  boda: ['terraza-ambu-noche', 1200, 720],
  contacto: ['aerea-agaves-cabanas', 1200, 720],
  voluntariado: ['campo-de-agave', 1200, 720],
  bienvenida: ['esp-lago-1', 1200, 720],
  seguimiento: ['cabana-ventanal', 1200, 720],
  'tile-espacios': ['esp-osho-hut-3', 600, 450],
  'tile-hospedaje': ['hab-agaves-1', 600, 450],
  'tile-eventos': ['esp-lago-2', 600, 450],
};
for (const [name, [src, w, h]] of Object.entries(PHOTOS)) {
  const file = `${OUT}/${name}.jpg`;
  await sharp(`src/assets/photos/${src}.jpg`).resize(w, h, { fit: 'cover' }).jpeg({ quality: 72, mozjpeg: true }).toFile(file);
  const kb = statSync(file).size / 1024;
  console.log(file, Math.round(kb) + ' KB', kb > 200 ? 'TOO BIG' : '');
}
await sharp('src/assets/brand/logo-color-transparente.png').resize({ width: 288 }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo.png`);
await sharp('src/assets/brand/simbolo-blanco.png').resize({ width: 112 }).png({ compressionLevel: 9 }).toFile(`${OUT}/simbolo-blanco.png`);
console.log('logo + símbolo listos');
