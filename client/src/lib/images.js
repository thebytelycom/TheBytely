export const MAX_IMAGES = 6;
export const MAX_TOTAL_BYTES = 600 * 1024;
const MAX_IMAGE_BYTES = 100 * 1024;
const TARGET_BYTES = 90 * 1024;

export const dataUrlBytes = (url) => Math.floor(((url.length - url.indexOf(',') - 1) * 3) / 4);
export const totalBytes = (images) => images.reduce((sum, i) => sum + dataUrlBytes(i.src), 0);
export const uid = () => Math.random().toString(36).slice(2, 10);

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This photo could not be read. Try a JPG or PNG.')); };
    img.src = url;
  });
}

export async function compressImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Use a JPG, PNG or WebP photo.');
  if (file.size > 15 * 1024 * 1024) throw new Error('This photo is larger than 15 MB. Try a smaller one.');
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let max = 800;
  let quality = 0.8;
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    out = canvas.toDataURL('image/jpeg', quality);
    if (dataUrlBytes(out) <= TARGET_BYTES) break;
    max = Math.round(max * 0.85);
    quality = Math.max(0.5, quality - 0.08);
  }
  if (dataUrlBytes(out) > MAX_IMAGE_BYTES) throw new Error('This photo is too detailed to shrink enough. Try a different one.');
  return out;
}