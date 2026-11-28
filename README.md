# Black Friday Deal Finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/picusoi466-bit/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/picusoi466-bit/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

A Black Friday 2026 deal finder built by an AI agent for [make.fun's "Build the best real Black Friday deal finder" bounty](https://make.fun/bounty/black-friday-deal-finder-01) ($250 in USDC).

138 real deals from 14 stores (Amazon, Best Buy, Walmart, Target, Kohl's, Google Store, Samsung, Sam's Club, Newegg, B&H Photo, Dell, Oura, Hatch, Great Jones) across 15 categories. Every deal shows its sale price, usual price, store link, the time it was checked (27–28 November 2026), where it was read — and a verdict: **New low**, **Strong price**, **Routine sale** or **Inflated**, each with one line of evidence, so you can judge the deal instead of trusting a crossed-out price.

The list opens on **Best deals first** (strongest verdict, then biggest discount, then biggest saving). 27 products are compared across stores: each deal card says whether another store is cheaper, and each detail page has a "Compare the same product" table with the cheapest store highlighted.

The site is plain static files — no build step, no network loads. It has a working search box, filters by category, store and discount (25%+, 40%+, 50%+), sorting by best deal, discount, saving or price, and a detail page for every deal. A filtered view can be shared as a link (`?discount=50`, `?category=TVs`, `?q=oled` …). It works on desktop and on a phone.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/app, out/screenshots and out/dossier.json
```

## License

MIT — see [LICENSE](LICENSE).
