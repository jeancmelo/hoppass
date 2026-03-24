/* ============================================================
   HopPass — shared.js v3
   Supabase real data client + UI helpers
   ============================================================ */

/* ─── Supabase config ─── */
const SB_URL = 'https://gpmxehaouzfrsryjvwvq.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbXhlaGFvdXpmcnNyeWp2d3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDQ3OTYsImV4cCI6MjA4ODM4MDc5Nn0.AQ5r6EcmfCIAfj4sXxBEBN6axvuB8UDOnYiqm8LqygQ';
const SB_HEADERS = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

/* Core fetch wrapper */
async function sbFetch(table, params = '', opts = {}) {
  try {
    const url = `${SB_URL}/rest/v1/${table}${params}`;
    const res = await fetch(url, { headers: { ...SB_HEADERS, ...opts } });
    if (!res.ok) { console.warn(`sbFetch ${table} → ${res.status}`); return null; }
    return await res.json();
  } catch (e) { console.error('sbFetch error:', e); return null; }
}

/* Convenience helpers */
const db = {
  /* breweries */
  breweries: {
    list: (params='') => sbFetch('breweries', params),
    bySlug: (slug) => sbFetch('breweries', `?slug=eq.${slug}&limit=1`),
    featured: (limit=8) => sbFetch('breweries', `?select=id,slug,name,city,state,logo_url,cover_image_url,identity_tags,has_taproom&limit=${limit}&order=name.asc`),
    byState: (state, limit=50) => sbFetch('breweries', `?state=eq.${state}&select=id,slug,name,city,state,latitude,longitude,logo_url,identity_tags&limit=${limit}&order=name.asc`),
    withCoords: (limit=300) => sbFetch('breweries', `?select=id,slug,name,city,state,latitude,longitude,identity_tags&latitude=not.is.null&longitude=not.is.null&limit=${limit}`),
    search: (q, limit=24) => sbFetch('breweries', `?name=ilike.*${encodeURIComponent(q)}*&select=id,slug,name,city,state,logo_url,identity_tags&limit=${limit}`),
  },
  /* beers */
  beers: {
    list: (params='') => sbFetch('beers', params),
    bySlug: (slug) => sbFetch('beers', `?slug=eq.${slug}&select=*,breweries(id,slug,name,city,state,logo_url)&limit=1`),
    byBrewery: (breweryId, limit=24) => sbFetch('beers', `?brewery_id=eq.${breweryId}&select=id,slug,name,style,category,abv,ibu,avg_rating,checkin_count,logo_url,flavor_tags&limit=${limit}&order=avg_rating.desc.nullslast`),
    topRated: (limit=16) => sbFetch('beers', `?select=id,slug,name,style,category,abv,avg_rating,checkin_count,logo_url,brewery_id&avg_rating=gt.0&limit=${limit}&order=avg_rating.desc`),
    byStyle: (style, limit=24) => sbFetch('beers', `?style=ilike.*${encodeURIComponent(style)}*&select=id,slug,name,style,abv,avg_rating,logo_url,brewery_id&limit=${limit}&order=avg_rating.desc.nullslast`),
    byCategory: (cat, limit=24) => sbFetch('beers', `?category=ilike.*${encodeURIComponent(cat)}*&select=id,slug,name,style,abv,avg_rating,logo_url,brewery_id&limit=${limit}&order=avg_rating.desc.nullslast`),
    search: (q, limit=24) => sbFetch('beers', `?name=ilike.*${encodeURIComponent(q)}*&select=id,slug,name,style,abv,avg_rating,logo_url,brewery_id&limit=${limit}`),
  },
  /* routes */
  routes: {
    featured: (limit=8) => sbFetch('routes', `?is_featured=eq.true&select=id,slug,name,description,city,state,distance_km,duration_days,brewery_count,cover_image_url,dominant_style,best_season,highlights,budget_estimate&limit=${limit}`),
    all: (limit=20) => sbFetch('routes', `?select=id,slug,name,description,city,state,distance_km,duration_days,brewery_count,cover_image_url,dominant_style,best_season,highlights&limit=${limit}&order=is_featured.desc`),
    bySlug: (slug) => sbFetch('routes', `?slug=eq.${slug}&select=*&limit=1`),
    breweries: (routeId) => sbFetch('route_breweries', `?route_id=eq.${routeId}&select=*,breweries(id,slug,name,city,state,latitude,longitude,logo_url,website,instagram_url,has_taproom,opening_hours,identity_tags)&order=order_index.asc`),
    attractions: (routeId) => sbFetch('route_attractions', `?route_id=eq.${routeId}&order=order_index.asc`),
    gastronomy: (routeId) => sbFetch('route_gastronomy', `?route_id=eq.${routeId}&order=order_index.asc`),
    tips: (routeId) => sbFetch('route_tips', `?route_id=eq.${routeId}`),
  },
  /* beer_styles */
  styles: {
    all: (limit=50) => sbFetch('beer_styles', `?select=id,slug,name,family,description,abv_min,abv_max,ibu_min,ibu_max,bitterness_avg,body_avg,glass_type,flavor_profile,beers_count,breweries_count,editorial_note&limit=${limit}&order=beers_count.desc.nullslast`),
    bySlug: (slug) => sbFetch('beer_styles', `?slug=eq.${slug}&limit=1`),
    families: () => sbFetch('beer_styles', `?select=family&family=not.is.null&limit=200`),
  },
};

/* ─── Can SVG placeholder ─── */
const STYLE_COLORS = {
  'IPA':['#D4860A','#FBBF24'], 'Sour':['#C0392B','#E74C3C'],
  'Stout':['#2C1810','#4A3728'], 'Porter':['#3D2314','#6B4226'],
  'Weiss':['#B8860B','#F0A020'], 'Lager':['#C8A000','#FFD700'],
  'Pilsner':['#A89000','#D4B800'], 'Farmhouse':['#4A6741','#6B8F5F'],
  'German':['#8B6914','#B8860B'], 'Barleywine':['#6B2D0F','#A0522D'],
  'default':['#7A6550','#9A8570'],
};
function styleColors(style) {
  if (!style) return STYLE_COLORS.default;
  for (const [k,v] of Object.entries(STYLE_COLORS))
    if (style.toLowerCase().includes(k.toLowerCase())) return v;
  return STYLE_COLORS.default;
}
function canSVG(name='?', style='') {
  const [c1,c2] = styleColors(style);
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect x="8" y="6" width="40" height="68" rx="8" fill="url(#g)"/><rect x="14" y="1" width="28" height="8" rx="3" fill="${c1}"/><rect x="14" y="71" width="28" height="8" rx="3" fill="${c1}"/><text x="28" y="40" font-family="Georgia,serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text><rect x="10" y="28" width="36" height="1" fill="rgba(255,255,255,.2)"/><rect x="10" y="52" width="36" height="1" fill="rgba(255,255,255,.2)"/></svg>`)}`;
}
function beerImg(beer) {
  return beer?.logo_url || canSVG(beer?.name, beer?.style || beer?.category);
}
function breweryInitials(name='?') {
  return name.split(' ').filter(w => w.length > 2).map(w=>w[0]).join('').slice(0,2).toUpperCase() || name.slice(0,2).toUpperCase();
}

/* ─── Leaflet marker helpers ─── */
function dotMarker(L, size=12, color='#D4860A') {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid #1A1208;border-radius:50%;box-shadow:0 0 0 ${Math.round(size*.3)}px ${color}44,0 2px 6px rgba(0,0,0,.4)"></div>`,
    className:'', iconSize:[size,size], iconAnchor:[size/2,size/2],
  });
}
function numberedMarker(L, n, color='#D4860A') {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;background:${color};border:2.5px solid #1A1208;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:.65rem;font-weight:700;color:white;box-shadow:0 2px 8px rgba(0,0,0,.4)">${n}</div>`,
    className:'', iconSize:[28,28], iconAnchor:[14,14],
  });
}

/* ─── Stars ─── */
function stars(rating) {
  if (!rating) return '<span style="color:var(--paper3)">— sem avaliações</span>';
  const full = Math.floor(rating), half = (rating%1)>=.4;
  let s = '';
  for (let i=0;i<5;i++) s += i<full ? '★' : (i===full&&half ? '½' : '☆');
  return `<span style="color:var(--amber)">${s}</span>`;
}

/* ─── Format numbers ─── */
const fmtN = n => n ? Number(n).toLocaleString('pt-BR') : '0';

/* ─── State map ─── */
const STATE_NAMES = {
  SP:'São Paulo', SC:'Santa Catarina', RS:'Rio Grande do Sul', MG:'Minas Gerais',
  PR:'Paraná', RJ:'Rio de Janeiro', PE:'Pernambuco', DF:'Distrito Federal',
  BA:'Bahia', GO:'Goiás', CE:'Ceará', AM:'Amazonas', PA:'Pará',
};

/* ─── Nav HTML ─── */
function renderNav(activePage='') {
  const pages = [
    {l:'Cervejarias',h:'cervejarias.html'}, {l:'Cervejas',h:'cervejas.html'},
    {l:'Estilos',h:'estilos.html'}, {l:'Roteiros',h:'roteiros.html'},
  ];
  return `<nav class="nav">
    <a href="index.html" class="nav__logo">🍺 Hop<span>Pass</span></a>
    <div class="nav__links">
      ${pages.map(p=>`<a href="${p.h}" class="${activePage===p.h?'active':''}">${p.l}</a>`).join('')}
      <a href="#" class="nav__cta">Entrar</a>
    </div>
  </nav>`;
}

/* ─── Footer HTML ─── */
function renderFooter() {
  return `<footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div style="font-family:var(--ff-display);font-size:1.25rem;font-weight:700;color:var(--paper)">🍺 Hop<span style="color:var(--amber3)">Pass</span></div>
          <p>O Passaporte da Cerveja Artesanal Brasileira. Descobre, regista e partilha cada sorvo da cena craft.</p>
          <div class="footer__stats" style="margin-top:24px">
            <div class="footer__stat"><span id="ftStat1">—</span><span>Cervejarias</span></div>
            <div class="footer__stat"><span id="ftStat2">—</span><span>Cervejas</span></div>
            <div class="footer__stat"><span>11</span><span>Estados</span></div>
          </div>
        </div>
        <div class="footer__col"><h4>Explorar</h4><ul>
          <li><a href="cervejarias.html">Cervejarias</a></li>
          <li><a href="cervejas.html">Cervejas</a></li>
          <li><a href="estilos.html">Estilos</a></li>
          <li><a href="roteiros.html">Roteiros</a></li>
        </ul></div>
        <div class="footer__col"><h4>Projeto</h4><ul>
          <li><a href="#">Sobre</a></li>
          <li><a href="#">Para Cervejarias</a></li>
          <li><a href="#">API</a></li>
        </ul></div>
        <div class="footer__col"><h4>Conta</h4><ul>
          <li><a href="#">Entrar</a></li>
          <li><a href="#">Registar</a></li>
          <li><a href="#">HopPass Pro</a></li>
        </ul></div>
      </div>
      <div class="footer__bottom">
        <p>© 2026 HopPass · hoppass.com.br</p>
        <p>v1.0 · Março 2026</p>
      </div>
    </div>
  </footer>`;
}

/* ─── Loading spinner ─── */
function spinner(msg='A carregar...') {
  return `<div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:48px;color:var(--ink3);font-family:var(--ff-mono);font-size:.8rem">
    <div style="width:20px;height:20px;border:2px solid var(--paper3);border-top-color:var(--amber);border-radius:50%;animation:spin .8s linear infinite"></div>
    ${msg}
  </div>`;
}
const spinCSS = `<style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

/* ─── Init: inject nav + footer ─── */
document.addEventListener('DOMContentLoaded', () => {
  const n = document.getElementById('nav-placeholder');
  if (n) n.outerHTML = renderNav(n.dataset.page || '');
  const f = document.getElementById('footer-placeholder');
  if (f) f.outerHTML = renderFooter();
});
