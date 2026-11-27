// A deal finder: every deal and a page for each, on hash routes. The deals are in data.js, so the site needs no
// network to show them; each deal links out to its store. Filters live in the list view and re-render the grid
// as you type or change a select — no page reload.
//
//   #/            the list, with search, category / store / discount filters and sorting
//   #/deal/<id>   one deal, with its verdict and evidence
//
// window.__shotReady is false while a page renders and true once it is on screen, so a screenshot script knows when
// to capture.

import { CHECKED_AT, deals } from './data.js';
import { deal, list, missing, rows } from './views.js';

const app = document.getElementById('app');

const state = { query: '', category: 'all', store: 'all', discount: 'any', sort: 'discount' };

function renderList() {
  app.innerHTML = list(deals, state);
  const shown = app.querySelector('.deals');
  const rerender = () => {
    shown.innerHTML = rows(deals, state);
  };
  app.querySelector('#q').addEventListener('input', (e) => {
    state.query = e.target.value;
    rerender();
  });
  for (const id of ['category', 'store', 'discount', 'sort']) {
    app.querySelector(`#${id}`).addEventListener('change', (e) => {
      state[id] = e.target.value;
      rerender();
    });
  }
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Black Friday Deal Finder`;
    app.innerHTML = found ? deal(found) : missing();
  } else {
    document.title = 'Black Friday Deal Finder';
    renderList();
  }
  const footerText = document.querySelector('footer .wrap');
  if (footerText) {
    const when = new Date(CHECKED_AT).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
    footerText.textContent = `Prices checked ${when} UTC on 27 November 2026. Prices may change or sell out — always check the store page before you pay.`;
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
