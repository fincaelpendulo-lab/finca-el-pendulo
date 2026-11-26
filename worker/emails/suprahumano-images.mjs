// Exports the photos of the Suprahumano thank-you newsletter to public/email/ (≤200 KB each).
// Event photos come from the disk "FINCA EL PENDULO/Suprahumano"; the rest from src/assets/photos.
// Run from the repo root: node worker/emails/suprahumano-images.mjs
import sharp from 'sharp';
import { statSync } from 'node:fs';

const EVENT = '/Volumes/FINCA EL PENDULO/Suprahumano';
const FLYER = 'worker/emails/suprahumano/fotos-flyer';
// name: [source file, width, height]
const PHOTOS = {
  'supra-hero': [`${EVENT}/IMG_6074.JPG`, 1200, 720],       // maypole dance with the palapa behind
  'supra-ceremonia': [`${EVENT}/IMG_5969.JPG`, 600, 450],   // opening ceremony at sunset
  'supra-listones': [`${EVENT}/IMG_6016.JPG`, 600, 450],    // ribbons from below
  'supra-relajacion': [`${EVENT}/IMG_6007.JPG`, 600, 450],  // meditation lying on the grass
  'supra-caballos': [`${EVENT}/IMG_6004.JPG`, 1200, 720],   // group at the horse paddock
  // New Year: the same photos as Carlos's flyers (design canvas "Flyer Año Nuevo"), copied to suprahumano/fotos-flyer.
  'an-fuego': [`${FLYER}/fuego.jpg`, 1200, 720],             // fire dancer at night
  'an-salon': [`${FLYER}/salon.jpg`, 600, 450],              // lounge with palapa roof
  'an-cena-velas': [`${FLYER}/cena-velas.jpg`, 600, 450],    // dinner by candlelight
  'an-circulo-fuego': [`${FLYER}/circulo-fuego.jpg`, 600, 450],
  'an-concierto': [`${FLYER}/concierto.jpg`, 600, 450],
  'hosp-cabana': ['src/assets/photos/cabana-ventanal.jpg', 1200, 600],
  'ret-osho': ['src/assets/photos/grupo-osho-hut-circulo.jpg', 400, 300],
  'ret-agora': ['src/assets/photos/esp-agora-gnosis-1.jpg', 400, 300],
  'ret-cena': ['src/assets/photos/grupo-cena-retiro.jpg', 400, 300],
};
for (const [name, [src, w, h]] of Object.entries(PHOTOS)) {
  const file = `public/email/${name}.jpg`;
  await sharp(src).rotate().resize(w, h, { fit: 'cover' }).jpeg({ quality: 72, mozjpeg: true }).toFile(file);
  const kb = statSync(file).size / 1024;
  console.log(file, Math.round(kb) + ' KB', kb > 200 ? 'TOO BIG' : '');
}
