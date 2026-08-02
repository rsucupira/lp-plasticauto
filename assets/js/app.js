'use strict';

const CONFIG = {
  // Número encontrado em diretório público local. Confirmar com a Plasticauto antes do lançamento definitivo.
  whatsapp: '5514997564659',
  productsUrl: 'data/products.json',
  pageSize: 12
};

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const unique = values => [...new Set(values)].sort((a,b) => a.localeCompare(b, 'pt-BR'));
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const whatsappUrl = message => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;

function setupGlobalUi(){
  const toggle = document.querySelector('.menu-toggle');
  if(toggle){
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
  }
  document.querySelectorAll('.whatsapp-link').forEach(link => {
    const message = link.dataset.message || 'Olá! Gostaria de informações sobre os produtos Plasticauto.';
    link.href = whatsappUrl(message);
    link.target = '_blank'; link.rel = 'noopener';
  });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function productShapeClass(category){
  const map = {'apara-barro':'','borda-lateral':'shape-borda-lateral','tampa-traseira':'shape-tampa-traseira','scoop':'shape-scoop','forro-teto':'shape-forro-teto','forro-porta':'shape-forro-porta','alargador':'shape-alargador','diversos':'shape-diversos'};
  return map[category] || 'shape-diversos';
}

function productCard(product){
  const warning = product.revisar ? '<span class="product-badge warning">Confirmar aplicação</span>' : `<span class="product-badge">${escapeHtml(product.marca)}</span>`;
  return `<article class="product-card">
    <a href="produto.html?id=${encodeURIComponent(product.id)}" aria-label="Ver ${escapeHtml(product.nome)}">
      <div class="product-visual">${warning}<span class="product-shape ${productShapeClass(product.categoria)}" aria-hidden="true"></span></div>
      <div class="product-body">
        <span class="product-kicker">${escapeHtml(product.categoriaNome)}</span>
        <h3>${escapeHtml(product.nome)}</h3>
        <span class="product-variant">${escapeHtml(product.variacao)}</span>
        <div class="product-specs"><span>Código<strong>${escapeHtml(product.codigo)}</strong></span><span>Aplicação<strong>${escapeHtml(product.periodo)}</strong></span></div>
        <span class="product-link">Ver detalhes <b>→</b></span>
      </div>
    </a>
  </article>`;
}

async function loadProducts(){
  const response = await fetch(CONFIG.productsUrl);
  if(!response.ok) throw new Error('Não foi possível carregar o catálogo.');
  return response.json();
}

async function setupCatalog(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const brand = document.getElementById('brandFilter');
  const model = document.getElementById('modelFilter');
  const year = document.getElementById('yearFilter');
  const search = document.getElementById('searchInput');
  const count = document.getElementById('resultCount');
  const loadMore = document.getElementById('loadMore');
  const empty = document.getElementById('catalogEmpty');
  const filtersBox = document.getElementById('activeFilters');
  let products = [], visible = CONFIG.pageSize, category = 'all';

  try { products = await loadProducts(); }
  catch(error){ grid.innerHTML = `<p>${escapeHtml(error.message)}</p>`; return; }

  unique(products.map(p => p.marca)).forEach(item => brand.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`));
  const currentYear = new Date().getFullYear();
  for(let y=currentYear; y>=1970; y--) year.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);

  function updateModels(){
    const selected = brand.value;
    model.innerHTML = '<option value="">Todos os modelos</option>';
    const models = unique(products.filter(p => !selected || p.marca === selected).map(p => p.modelo));
    models.forEach(item => model.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`));
    model.disabled = false;
  }

  function filtered(){
    const term = normalize(search.value);
    const selectedYear = Number(year.value || 0);
    return products.filter(p => {
      const haystack = normalize([p.nome,p.codigo,p.marca,p.modelo,p.variacao,p.categoriaNome,p.periodo].join(' '));
      return (!brand.value || p.marca === brand.value)
        && (!model.value || p.modelo === model.value)
        && (!selectedYear || (p.anoInicio <= selectedYear && p.anoFim >= selectedYear))
        && (category === 'all' || p.categoria === category || (category === 'forro-porta' && p.categoria === 'forro-teto'))
        && (!term || haystack.includes(term));
    }).sort((a,b) => Number(b.destaque)-Number(a.destaque) || a.nome.localeCompare(b.nome,'pt-BR'));
  }

  function render(){
    const result = filtered();
    const shown = result.slice(0, visible);
    grid.innerHTML = shown.map(productCard).join('');
    count.textContent = `${result.length} ${result.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
    empty.hidden = result.length !== 0;
    grid.hidden = result.length === 0;
    loadMore.hidden = visible >= result.length || result.length === 0;
    const chips = [];
    if(brand.value) chips.push(brand.value); if(model.value) chips.push(model.value); if(year.value) chips.push(year.value);
    if(category !== 'all') chips.push(document.querySelector(`[data-category="${category}"] strong`)?.textContent || category);
    if(search.value.trim()) chips.push(`Busca: “${search.value.trim()}”`);
    filtersBox.innerHTML = chips.map(chip => `<span class="filter-chip">${escapeHtml(chip)}</span>`).join('');
  }

  function reset(){ brand.value=''; model.value=''; year.value=''; search.value=''; category='all'; visible=CONFIG.pageSize; document.querySelectorAll('.category-card').forEach(b => b.classList.toggle('active',b.dataset.category==='all')); updateModels(); render(); }

  brand.addEventListener('change', () => { model.value=''; updateModels(); visible=CONFIG.pageSize; render(); });
  [model,year].forEach(el => el.addEventListener('change', () => { visible=CONFIG.pageSize; render(); }));
  search.addEventListener('input', () => { visible=CONFIG.pageSize; render(); });
  document.getElementById('findButton').addEventListener('click', () => { visible=CONFIG.pageSize; render(); document.getElementById('catalogo').scrollIntoView({behavior:'smooth'}); });
  document.querySelectorAll('.category-card').forEach(button => button.addEventListener('click', () => { category=button.dataset.category; visible=CONFIG.pageSize; document.querySelectorAll('.category-card').forEach(b=>b.classList.remove('active')); button.classList.add('active'); render(); document.getElementById('catalogo').scrollIntoView({behavior:'smooth'}); }));
  document.getElementById('clearFilters').addEventListener('click', reset);
  document.getElementById('emptyReset').addEventListener('click', reset);
  loadMore.addEventListener('click', () => { visible += CONFIG.pageSize; render(); });
  updateModels(); render();
}

function setupResellerForm(){
  const form = document.getElementById('resellerForm'); if(!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(form);
    const message = `Olá! Tenho interesse em revender produtos Plasticauto.\n\nNome: ${data.get('nome')}\nEmpresa: ${data.get('empresa')}\nCidade/Estado: ${data.get('local')}\nWhatsApp: ${data.get('telefone')}\n\nMensagem: ${data.get('mensagem') || 'Gostaria de receber mais informações.'}`;
    window.open(whatsappUrl(message),'_blank','noopener');
  });
}

async function setupProductPage(){
  const main = document.getElementById('productMain'); if(!main) return;
  try{
    const products = await loadProducts(); const id = new URLSearchParams(location.search).get('id'); const product = products.find(p=>p.id===id);
    if(!product){ main.innerHTML='<section class="error-product"><h1>Produto não encontrado</h1><p>Volte ao catálogo e escolha outro item.</p><a class="btn btn-dark" href="index.html#catalogo">Ver catálogo</a></section>'; return; }
    document.title = `${product.nome} | Plasticauto`;
    const message = `Olá! Gostaria de informações sobre o produto ${product.codigo} — ${product.nome}. Meu veículo é ${product.marca} ${product.modelo}, ano _____. Poderiam confirmar a compatibilidade?`;
    const related = products.filter(p=>p.id!==product.id && (p.modelo===product.modelo || p.categoria===product.categoria)).slice(0,4);
    main.innerHTML = `<section class="product-hero"><div class="container"><div class="breadcrumbs"><a href="index.html">Início</a> / <a href="index.html#catalogo">Catálogo</a> / ${escapeHtml(product.codigo)}</div><div class="product-detail-grid"><div class="detail-visual"><span class="detail-code">${escapeHtml(product.codigo)}</span><span class="product-shape ${productShapeClass(product.categoria)}"></span><span class="detail-note">Imagem ilustrativa do MVP. Substituir por fotografia oficial do produto.</span></div><div class="product-info"><span class="product-category-label">${escapeHtml(product.categoriaNome)}</span><h1 class="product-title">${escapeHtml(product.nome)}</h1><p class="product-lead">${escapeHtml(product.variacao)}. Consulte a aplicação antes da compra ou instalação.</p><div class="vehicle-box"><small>Compatibilidade cadastrada</small><strong>${escapeHtml(product.marca)} ${escapeHtml(product.modelo)}</strong><span>${escapeHtml(product.periodo)}</span></div><div class="detail-specs"><div><span>Código Plasticauto</span><strong>${escapeHtml(product.codigo)}</strong></div><div><span>Categoria</span><strong>${escapeHtml(product.categoriaNome)}</strong></div><div><span>Marca</span><strong>${escapeHtml(product.marca)}</strong></div><div><span>Modelo</span><strong>${escapeHtml(product.modelo)}</strong></div><div><span>Variação</span><strong>${escapeHtml(product.variacao)}</strong></div><div><span>Aplicação</span><strong>${escapeHtml(product.periodo)}</strong></div></div><div class="product-actions"><a class="btn btn-primary" href="${whatsappUrl(message)}" target="_blank" rel="noopener">Confirmar pelo WhatsApp <span>→</span></a><a class="btn btn-dark" href="mailto:contato@plasticauto.com.br?subject=${encodeURIComponent('Consulta '+product.codigo)}">Consultar por e-mail</a></div><p class="compatibility-note">A aplicação pode depender de versão, cabine, geração ou configuração do veículo. Confirme os dados antes de concluir o pedido.</p></div></div></div></section>${related.length?`<section class="related-section"><div class="container"><span class="eyebrow dark">Você também pode consultar</span><h2>Produtos relacionados</h2><div class="product-grid">${related.map(productCard).join('')}</div></div></section>`:''}`;
    document.querySelectorAll('.whatsapp-link').forEach(link=>{link.href=whatsappUrl(message);link.target='_blank';link.rel='noopener'});
  }catch(error){ main.innerHTML=`<section class="error-product"><h1>Catálogo indisponível</h1><p>${escapeHtml(error.message)}</p></section>`; }
}

document.addEventListener('DOMContentLoaded', () => { setupGlobalUi(); setupCatalog(); setupResellerForm(); setupProductPage(); });
