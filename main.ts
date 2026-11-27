// Black Friday Deal Finder v2 — make.fun entry for black-friday-deal-finder-01.
//
// The site is this directory's app/ folder: plain static files a browser opens
// at app/index.html (ES modules, CSS, no build step), its 80 deals held in its
// own files (app/data.js), each deal checked by the agent on 27 November 2026
// with its sale price, usual price, store link, check time, source and a
// verdict with one line of evidence (the first 30 checked at 12:30 UTC, 50
// more added for v2 at 21:30 UTC). Nothing the site runs, styles or shows
// loads over the network, and each deal links out to its store. The list
// sorts best deals first (verdict strength, then discount, then dollars
// saved), and 17 products are compared across stores: a deal card names the
// cheaper store, and the detail page shows the same product's prices side by
// side with the cheapest highlighted. Search and filters (category, store,
// discount) work from the address bar too, so a filtered view can be shared
// as a link. The program hands it in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json, the summary
// the judge reads (the screenshots, the first load's files and bytes, and
// the source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be
// byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The entry's 80 deals live in app/data.js, its 4 screenshots in screenshots/
// (1-deals.jpg is the cover, 2-deal.jpg a deal detail with the comparison
// table, 3-deal-phone.jpg the phone view, 4-filtered.jpg the 50%-off filter
// applied: 27 of 80 deals, every one 60% off or more).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
