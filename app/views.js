// HTML for each page, built from the deal data. Every value is escaped before it goes into the page.
// Verdict chips: New low (green), Strong price (blue), Routine sale (amber), Inflated (red).

const escape = (s) => String(s).replace(/[&<>\"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const day = (iso) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
const shortDay = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const verdictClass = (v) =>
  v === 'New low' ? 'verdict-new'
  : v === 'Strong price' ? 'verdict-strong'
  : v === 'Routine sale' ? 'verdict-routine'
  : 'verdict-inflated';

// How strong a verdict is, for the "Best deals first" sort: a true low beats a strong price, which beats a
// routine sale, which beats an inflated one.
const verdictRank = (v) =>
  v === 'New low' ? 0
  : v === 'Strong price' ? 1
  : v === 'Routine sale' ? 2
  : 3;

// Every store that sells this product, this deal's own store first, with the price each one charges.
export function allPrices(d) {
  const rows = [{ store: d.store, price: d.price, here: true }];
  for (const a of d.also || []) rows.push({ store: a.store, price: a.price, here: false });
  return rows.sort((a, b) => a.price - b.price || (a.here ? -1 : 1));
}

// The cheapest other store for this product, if any.
function cheapestAlso(d) {
  if (!d.also || d.also.length === 0) return null;
  return d.also.reduce((best, a) => (a.price < best.price ? a : best), d.also[0]);
}

export function applyFilters(deals, state) {
  const q = state.query.trim().toLowerCase();
  let shown = deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category} ${d.verdict}`.toLowerCase().includes(q)) return false;
    if (state.category !== 'all' && d.category !== state.category) return false;
    if (state.store !== 'all' && d.store !== state.store) return false;
    if (state.discount === '25' && percentOff(d) < 25) return false;
    if (state.discount === '40' && percentOff(d) < 40) return false;
    if (state.discount === '50' && percentOff(d) < 50) return false;
    return true;
  });
  if (state.sort === 'best') {
    // Best deals first: strongest verdict, then biggest discount, then biggest dollar saving.
    shown = [...shown].sort((a, b) =>
      verdictRank(a.verdict) - verdictRank(b.verdict)
      || percentOff(b) - percentOff(a)
      || saved(b) - saved(a));
  }
  if (state.sort === 'discount') shown = [...shown].sort((a, b) => percentOff(b) - percentOff(a) || a.price - b.price);
  if (state.sort === 'price-low') shown = [...shown].sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') shown = [...shown].sort((a, b) => b.price - a.price);
  if (state.sort === 'saving') shown = [...shown].sort((a, b) => saved(b) - saved(a));
  if (state.sort === 'az') shown = [...shown].sort((a, b) => a.title.localeCompare(b.title));
  return shown;
}

export function card(d) {
  const other = cheapestAlso(d);
  // Say where else the same product is sold, and whether this store is the cheapest place to buy it.
  const alsoLine = other
    ? (other.price < d.price
      ? `<span class="also">Cheaper at ${escape(other.store)} — ${usd(other.price)}</span>`
      : `<span class="also">Cheapest here — also ${escape(other.store)} ${usd(other.price)}</span>`)
    : '';
  return `<article class="card">
  <a class="card-link" href="#/deal/${encodeURIComponent(d.id)}">
    <span class="badge">${percentOff(d)}% off</span>
    <span class="card-title">${escape(d.title)}</span>
    <span class="card-meta">${escape(d.store)} &middot; ${escape(d.category)}</span>
    <span class="card-price">${usd(d.price)} <s>${usd(d.was)}</s> <span class="save">save ${usd(saved(d))}</span></span>
    <span class="checked">Checked ${shortDay(d.checked)}</span>
    ${alsoLine}
    <span class="verdict ${verdictClass(d.verdict)}">${escape(d.verdict)}</span>
  </a>
</article>`;
}

export function rows(deals, state) {
  const shown = applyFilters(deals, state);
  if (shown.length === 0) return '<p class="empty">No deal matches those filters. Try clearing the search or lowering the discount filter.</p>';
  return `<p class="count">${shown.length} of ${deals.length} deals</p><div class="grid">${shown.map(card).join('')}</div>`;
}

function option(value, current, label) {
  return `<option value="${escape(value)}"${value === current ? ' selected' : ''}>${escape(label)}</option>`;
}

export function list(deals, state) {
  const categories = [...new Set(deals.map((d) => d.category))].sort();
  const stores = [...new Set(deals.map((d) => d.store))].sort();
  const compared = deals.filter((d) => d.also && d.also.length > 0).length;
  return `<section class="hero">
  <h1>Black Friday, checked deal by deal</h1>
  <p class="lede">${deals.length} real deals from ${stores.length} stores, each with its sale price, usual price, store link and the time it was checked. Every deal carries a verdict — <strong>New low</strong>, <strong>Strong price</strong>, <strong>Routine sale</strong> or <strong>Inflated</strong> — with the evidence. ${compared} products are compared across stores, so you can see the cheapest place to buy.</p>
</section>
<section class="controls" aria-label="Search and filter deals">
  <label class="search">Search <input id="q" type="search" placeholder="Try “OLED”, “LEGO” or “Amazon”…" value="${escape(state.query)}"></label>
  <label>Category <select id="category">
    ${option('all', state.category, 'All categories')}
    ${categories.map((c) => option(c, state.category, c)).join('')}
  </select></label>
  <label>Store <select id="store">
    ${option('all', state.store, 'All stores')}
    ${stores.map((s) => option(s, state.store, s)).join('')}
  </select></label>
  <label>Discount <select id="discount">
    ${option('any', state.discount, 'Any discount')}
    ${option('25', state.discount, '25% off or more')}
    ${option('40', state.discount, '40% off or more')}
    ${option('50', state.discount, '50% off or more')}
  </select></label>
  <label>Sort by <select id="sort">
    ${option('best', state.sort, 'Best deals first')}
    ${option('discount', state.sort, 'Biggest discount')}
    ${option('saving', state.sort, 'Biggest saving ($)')}
    ${option('price-low', state.sort, 'Lowest price')}
    ${option('price-high', state.sort, 'Highest price')}
    ${option('az', state.sort, 'Name A–Z')}
  </select></label>
</section>
<div class="deals">${rows(deals, state)}</div>`;
}

export function deal(d) {
  const prices = allPrices(d);
  // The same product at every store that sells it, cheapest first, the cheapest row highlighted.
  const compare = prices.length > 1 ? `<section class="compare">
  <h2>Compare the same product</h2>
  <table>
    <thead><tr><th>Store</th><th>Price</th><th></th></tr></thead>
    <tbody>${prices.map((p, i) => `<tr${i === 0 ? ' class="cheapest"' : ''}><td>${escape(p.store)}${p.here ? ' (this deal)' : ''}</td><td class="price">${usd(p.price)}</td><td>${i === 0 ? '<span class="cheapest-tag">Cheapest</span>' : ''}</td></tr>`).join('')}</tbody>
  </table>
</section>` : '';
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <p><span class="badge big">${percentOff(d)}% off</span> <span class="verdict ${verdictClass(d.verdict)}">${escape(d.verdict)}</span></p>
  <h1>${escape(d.title)}</h1>
  <p class="detail-price">${usd(d.price)} <s>${usd(d.was)}</s> <span class="save">you save ${usd(saved(d))}</span></p>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Verdict</dt><dd><strong>${escape(d.verdict)}</strong> — ${escape(d.evidence)}</dd>
    <dt>Checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  ${compare}
  <p class="cta"><a href="${escape(d.url)}" rel="noopener" target="_blank">Find it at ${escape(d.store)} &nearr;</a></p>
  <p class="note">Prices change fast on Black Friday weekend. The store page is the final word — check the price in your cart before you pay.</p>
</article>`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
