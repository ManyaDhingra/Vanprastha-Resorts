// Generates the missing catalog images (room/gallery/experience) via
// pollinations.ai (anonymous, ~1 request / 15s). Consistent luxury-resort
// style so the catalog looks coherent.
// Usage: node scripts/generate-images.mjs
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images");

const STYLE =
  "photorealistic luxury Himalayan resort photography, golden hour, lush pine forest valley, warm light, professional hotel photography, high detail, no people, no text, no watermark";

const JOBS = [
  // Rooms (slug -> title)
  ["rooms/yama.jpg", "Executive room with valley view at a Himalayan resort, king bed, warm wood interior"],
  ["rooms/niyama.jpg", "Executive room with valley view at a Himalayan resort, two single beds, warm wood interior"],
  ["rooms/asana.jpg", "Executive room with mountain view at a Himalayan resort, king bed, linen textiles"],
  ["rooms/pranayama.jpg", "Executive room with valley view at a Himalayan resort, twin beds, wooden floor"],
  ["rooms/pratyahara.jpg", "Executive room with mountain view at a Himalayan resort, cozy bed, warm light"],
  ["rooms/dharna.jpg", "Executive room with valley view at a Himalayan resort, comfortable bed, minimal decor"],
  ["rooms/dhyana.jpg", "Executive room with mountain view at a Himalayan resort, bed with wool blanket"],
  ["rooms/samadhi.jpg", "Executive room with valley view at a Himalayan resort, elegant bed, floor lamp"],
  ["rooms/rigveda.jpg", "Executive room with garden view at a Himalayan resort, twin sharing beds"],
  ["rooms/yajurveda.jpg", "Executive room with garden view at a Himalayan resort, twin beds, green view"],
  ["rooms/samaveda.jpg", "Executive room garden view double bed at a Himalayan resort, extra bed provision"],
  ["rooms/atharvaveda.jpg", "Executive room garden view double bed at a Himalayan resort, rustic wood"],
  ["rooms/ganga.jpg", "Spacious family room at a Himalayan resort, four single beds, large windows"],
  ["rooms/yamuna.jpg", "Executive plus room valley view at Himalayan resort, twin beds, premium decor"],
  ["rooms/saraswati.jpg", "Executive plus room valley view at Himalayan resort, twin beds, soft light"],
  ["rooms/kedarnath.jpg", "Cottage with attic at a Himalayan resort, double bed, garden view"],
  ["rooms/badrinath.jpg", "Cottage with attic at a Himalayan resort, rustic cozy interior, garden view"],
  // Gallery
  ["gallery/1.jpg", "Himalayan resort exterior at dusk, warm lit windows, pine forest"],
  ["gallery/2.jpg", "Yoga pavilion at a Himalayan resort overlooking mountain valley"],
  ["gallery/3.jpg", "Resort garden path with deodar trees at golden hour"],
  ["gallery/4.jpg", "Resort infinity pool terrace with mountain view"],
  ["gallery/5.jpg", "Resort dining hall with warm wooden interior and valley view"],
  ["gallery/6.jpg", "Campfire seating area at a Himalayan resort at night"],
  // Experiences
  ["experience-1.jpg", "Morning yoga session on a wooden deck overlooking Himalayan valley"],
  ["experience-2.jpg", "Guided forest walk in a Himalayan pine forest, misty morning"],
  ["experience-3.jpg", "Traditional meditation hall interior at a Himalayan retreat"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, file) {
  await mkdir(dirname(file), { recursive: true });
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(file, buf);
  return buf.length;
}

let ok = 0;
let failed = 0;
for (let i = 0; i < JOBS.length; i++) {
  const [rel, subject] = JOBS[i];
  const file = path.join(outDir, rel);
  const prompt = encodeURIComponent(`${subject}, ${STYLE}`);
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&nologo=true&seed=${1000 + i}&model=flux`;
  try {
    const size = await download(url, file);
    console.log(`[${i + 1}/${JOBS.length}] OK ${rel} (${(size / 1024).toFixed(0)}KB)`);
    ok++;
  } catch (e) {
    console.error(`[${i + 1}/${JOBS.length}] FAIL ${rel}: ${e.message}`);
    failed++;
  }
  await sleep(16000); // anonymous rate limit
}
console.log(`DONE ok=${ok} failed=${failed}`);