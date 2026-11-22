// ===== 1. YOUR CONTENT: edit these two lists =====
// Albums (categories). To add one, add a line here and use its id in the photos below.
const categories = [
  { id:'nature', name:'Nature',  about:'Mountains,rivers,sky and flowers.' },
  { id:'animal', name:'Animals', about:'Wildlife and domestic pets.' },
  { id:'city',      name:'City',       about:'Streets, buildings and glowing lights.' },
  { id:'food',      name:'Food',       about:'Meals, drinks and sweet moments.' },
  { id:'culture',   name:'Culture',   about:'Traditions, people and heritage.' },
  { id:'painting', name:'Painting', about:'Colors, brushstrokes and art.' },
  // { id:'flowers', name:'Flowers', about:'Petals and gardens.' },
];

// Photos. "category" must match an album id above. The first photo of an album is its cover.
const photos = [
  { src:'images/nature/nature1.jpg', title:'moonlight Roses',       category:'nature' },
  { src:'images/nature/nature2.jpg', title:'sky over the meadow', category:'nature' },
  { src:'images/nature/nature3.jpg', title:'Autumn river road',           category:'nature' },
  { src:'images/nature/nature4.jpg', title:'pine mountains path',     category:'nature' },
  { src:'images/city/city1.jpg',   title:'golden skyline',      category:'city' },
  { src:'images/city/city2.jpg',   title:'streets sunrise',            category:'city' },
  { src:'images/city/city3.jpg',   title:'city roads',            category:'city' },
  { src:'images/city/city4.jpg',   title:'glass building',            category:'city' },
  { src:'images/food/food1.jpg',   title:'Fresh pasta',            category:'food' },
  { src:'images/food/food2.jpg',   title:'berry dessert',            category:'food' },
  { src:'images/food/food3.jpg',   title:'snacks',            category:'food' },
  { src:'images/food/food4.jpg',   title:'afternoon coffee',            category:'food' },
  { src:'images/animal/animal1.jpg', title:'inocent cat',       category:'animal' },
  {src:'images/animal/animal2.jpg', title:'sweet tigger',       category:'animal' },
  { src:'images/animal/animal3.jpg', title:'cute bunny',       category:'animal' },
  { src:'images/animal/animal4.jpg', title:'little Lamb',       category:'animal' },
  { src:'images/culture/culture1.jpg', title:'Henna Tradition',       category:'culture' },
  {src:'images/culture/culture2.jpg', title:'roasting corn',       category:'culture' },
  { src:'images/culture/culture3.jpg', title:'culture dance',       category:'culture' },
  { src:'images/culture/culture4.jpg', title:'culture festival',       category:'culture' },
  { src:'images/painting/painting1.jpg', title:'coffee art',       category:'painting' },
  {src:'images/painting/painting2.jpg', title:'residential art',       category:'painting' },
  { src:'images/painting/painting3.jpg', title:'portraits',       category:'painting' },
  { src:'images/painting/painting4.jpg', title:'abstract art',       category:'painting' },

];

// ===== 2. Setup =====
const $ = id => document.getElementById(id);
const albums = $('albums'), grid = $('grid'), chips = $('chips'), head = $('viewHead');
const empty = $('empty'), search = $('search');
const lightbox = $('lightbox'), lbImg = $('lightbox-img'), capTitle = $('cap-title'), capCount = $('cap-count');
const used = categories.filter(c => photos.some(p => p.category === c.id)); // skip albums with no photos
const catName = id => (categories.find(c => c.id === id) || {}).name || id;
let activeCat = 'all', visible = [], current = 0;

// Builds one card (used for both albums and photos) with the 3D tilt effect
function makeCard(src, title, sub, i, extra) {
  const card = document.createElement('div');
  card.className = 'card ' + (extra || '');
  card.style.animationDelay = (i * 0.06) + 's';
  card.tabIndex = 0;
  card.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">
    <div class="glare"></div>
    <div class="info"><h3>${title}</h3><span>${sub}</span></div>`;
  card.querySelector('img').onerror = () => card.classList.add('fallback'); // gradient if image is missing
  card.addEventListener('keydown', e => { if (e.key === 'Enter') card.click(); });
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.transform = `rotateY(${(x - .5) * 18}deg) rotateX(${(.5 - y) * 18}deg) translateZ(20px)`;
    card.style.setProperty('--gx', x * 100 + '%');
    card.style.setProperty('--gy', y * 100 + '%');
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
  return card;
}

// Category buttons: "All albums" + one per album
function makeChip(id, label) {
  const b = document.createElement('button');
  b.className = 'filter-btn';
  b.textContent = label;
  b.dataset.cat = id;
  b.onclick = () => setCategory(id);
  chips.appendChild(b);
}
makeChip('all', 'All albums');
used.forEach(c => makeChip(c.id, c.name));

// Album cards (home page)
used.forEach((c, i) => {
  const list = photos.filter(p => p.category === c.id);
  const card = makeCard(c.cover || list[0].src, c.name, list.length + (list.length === 1 ? ' photo' : ' photos'), i, 'album');
  card.addEventListener('click', () => setCategory(c.id));
  albums.appendChild(card);
});

// Photo cards (inside an album)
photos.forEach((p, i) => {
  const card = makeCard(p.src, p.title, catName(p.category), i);
  card.addEventListener('click', () => openLightbox(visible.indexOf(p)));
  grid.appendChild(card);
  p.el = card;
});

// ===== 3. Show albums or photos (filter + search work together) =====
function render() {
  const q = search.value.trim().toLowerCase();
  const showAlbums = activeCat === 'all' && !q;
  albums.hidden = !showAlbums;
  grid.hidden = showAlbums;

  const cat = used.find(c => c.id === activeCat);
  head.hidden = !cat;
  if (cat) { $('viewTitle').textContent = cat.name; $('viewDesc').textContent = cat.about; }

  visible = photos.filter(p =>
    (activeCat === 'all' || p.category === activeCat) &&
    (!q || p.title.toLowerCase().includes(q) || catName(p.category).toLowerCase().includes(q))
  );
  photos.forEach(p => p.el.classList.toggle('hide', !visible.includes(p)));
  empty.hidden = showAlbums || visible.length > 0;
  chips.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === activeCat));
}
function setCategory(id) {
  activeCat = id;
  render();
  $('gallery').scrollIntoView({ behavior: 'smooth' });
}
$('back').onclick = () => setCategory('all');
search.addEventListener('input', render);
render();

// ===== 4. Lightbox =====
function show(index, animate) {
  current = (index + visible.length) % visible.length;
  const p = visible[current];
  const apply = () => {
    lbImg.src = p.src; lbImg.alt = p.title;
    capTitle.textContent = p.title;
    capCount.textContent = `${current + 1} / ${visible.length}`;
    lbImg.classList.remove('swap');
  };
  if (animate) { lbImg.classList.add('swap'); setTimeout(apply, 220); } else apply();
}
function openLightbox(i) { show(i, false); lightbox.classList.add('active'); lightbox.setAttribute('aria-hidden', 'false'); }
function closeLightbox() { lightbox.classList.remove('active'); lightbox.setAttribute('aria-hidden', 'true'); }

$('next').onclick = () => show(current + 1, true);
$('prev').onclick = () => show(current - 1, true);
$('close').onclick = closeLightbox;
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'ArrowRight') show(current + 1, true);
  if (e.key === 'ArrowLeft') show(current - 1, true);
  if (e.key === 'Escape') closeLightbox();
});

let startX = 0; // swipe on phones
lightbox.addEventListener('touchstart', e => startX = e.touches[0].clientX);
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), true);
});

// ===== 5. 3D camera in the header tilts toward the mouse =====
const scene = $('scene'), camera = $('camera');
scene.addEventListener('mousemove', e => {
  const r = scene.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  camera.style.transform = `rotateY(${x * 35}deg) rotateX(${-y * 25}deg)`;
});
scene.addEventListener('mouseleave', () => camera.style.transform = '');