/* =====================================================
   AD7 IMÓVEIS — o site (entrega 1): início, busca, imóvel, área do cliente,
   negocie, financie, sobre, contato, favoritos, entrar e o painel de pedidos.
   Um app só: a gestão (entrega 2) entra como rotas de painel neste mesmo arquivo.
   ===================================================== */
'use strict';

const APP_VERSAO = '0.1.0';
const FAV_KEY = 'ad7_fav_v1', COOKIE_KEY = 'ad7_cookies_v1';
const C = APP_CONFIG;
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wa = (texto, num) => 'https://wa.me/' + (num || C.whatsapp) + (texto ? '?text=' + encodeURIComponent(texto) : '');
const fone = n => { const d = String(n).replace(/\D/g, '').replace(/^55/, ''); return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7); };

/* ---------- rota ---------- */
function rota() {
  const h = location.hash.replace(/^#\/?/, '');
  const [caminho, qs] = h.split('?');
  const partes = caminho.split('/').filter(Boolean);
  const query = {};
  if (qs) for (const par of qs.split('&')) { const [k, v] = par.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' ')); }
  return { nome: partes[0] || 'inicio', param: partes[1] || '', sub: partes[2] || '', query, caminho };
}
function qs(obj) { const p = Object.entries(obj).filter(([, v]) => v !== '' && v != null && v !== false).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)); return p.length ? '?' + p.join('&') : ''; }
function navegar(h) { location.hash = h; }

/* ---------- favoritos / cookies ---------- */
function favs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; } }
function favToggle(ref) { const l = favs(); const i = l.indexOf(ref); if (i >= 0) l.splice(i, 1); else l.push(ref); try { localStorage.setItem(FAV_KEY, JSON.stringify(l)); } catch (e) {} return i < 0; }
function cookiesDecidido() { try { return !!localStorage.getItem(COOKIE_KEY); } catch (e) { return true; } }

/* ---------- pedaços ---------- */
const ICO = {
  cama: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>',
  banho: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12V6a2 2 0 0 1 4 0M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2z"/></svg>',
  carro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l-1.5-5H6.5L5 17zM7 17v2M17 17v2M8 12l1-3h6l1 3"/></svg>',
  area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3zM3 9h6M9 3v6"/></svg>',
  casa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/></svg>',
  pessoa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
  coracao: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  coracaoCheio: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
};

function selo(im) {
  const s = (im.selo || '').trim();
  if (!s) return '';
  const t = s.length > 3 && s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s;
  return '<span class="chip chip-g">' + esc(t) + '</span>';
}
function metaImovel(im, completo) {
  const p = [];
  if (im.dorm) p.push(ICO.cama + im.dorm + ' dorm' + (im.suites ? ' (' + im.suites + ' suíte' + (im.suites > 1 ? 's' : '') + ')' : ''));
  if (completo && im.banheiros) p.push(ICO.banho + im.banheiros + ' ban');
  if (im.vagas) p.push(ICO.carro + im.vagas + ' vaga' + (im.vagas > 1 ? 's' : ''));
  if (im.areaConstruida) p.push(ICO.area + fmtArea(im.areaConstruida));
  else if (im.areaTotal) p.push(ICO.area + fmtArea(im.areaTotal) + ' terreno');
  if (im.transacao === 'temporada' && im.maxPessoas) p.push(ICO.pessoa + 'até ' + im.maxPessoas);
  return '<div class="meta">' + p.map(x => '<span>' + x + '</span>').join('') + '</div>';
}
function cardImovel(im) {
  const f = favs().includes(im.ref);
  const chip = im.transacao === 'temporada' ? 'chip-t' : 'chip-w';
  return '<a class="card" href="#/imovel/' + esc(im.ref) + '">'
    + '<div class="foto"><img src="' + esc(im.capa) + '" alt="" loading="lazy"><div class="chips"><span class="chip ' + chip + '">' + TRANS[im.transacao] + '</span>' + selo(im) + '</div></div>'
    + '<button type="button" class="fav' + (f ? ' on' : '') + '" data-act="fav" data-ref="' + esc(im.ref) + '" aria-label="' + (f ? 'Tirar dos favoritos' : 'Salvar nos favoritos') + '" aria-pressed="' + f + '">' + (f ? ICO.coracaoCheio : ICO.coracao) + '</button>'
    + '<div class="corpo"><div class="preco">' + (im.transacao === 'temporada' && im.preco ? '<small>a partir de </small>' : '') + esc(rotuloPreco(im)) + '</div>'
    + '<div class="titulo">' + esc(im.titulo) + '</div><div class="local">' + esc(im.bairro) + ' · ' + esc(im.cidade) + '</div>'
    + metaImovel(im) + '<div class="ref"><span>REF. ' + esc(im.ref) + '</span><span style="color:var(--teal)">VER →</span></div></div></a>';
}
function grade(lista, cls) { return lista.length ? '<div class="grid ' + (cls || '') + '">' + lista.map(cardImovel).join('') + '</div>' : '<div class="vazio">Nenhum imóvel aqui por enquanto.</div>'; }
function opts(lista, atual, vazio) { return '<option value="">' + esc(vazio) + '</option>' + lista.map(v => '<option value="' + esc(v) + '"' + (v === atual ? ' selected' : '') + '>' + esc(v) + '</option>').join(''); }

/* ---------- INÍCIO ---------- */
function vInicio() {
  const o = opcoes({});
  const temporada = destaques({ neg: 'temporada' }, 3), casas = destaques({ neg: 'venda', tipo: 'Casa' }, 4);
  const outros = filtrar({ neg: 'venda' }).filter(im => im.tipo !== 'Casa').slice(0, 4);
  const r = resumoCatalogo();
  return '<section class="hero" style="background-image:url(arte/capa.jpg)" aria-label="Busca de imóveis"><div>'
    + '<h1>A sua imobiliária no litoral do Paraná</h1>'
    + '<p>Compra, venda, aluguel e temporada em Pontal do Paraná, com a assessoria da AD7 do primeiro contato à entrega das chaves.</p>'
    + '<form class="busca" data-form="busca" aria-label="Buscar imóvel">'
    + '<label class="oculto" for="b-neg">Negócio</label><select id="b-neg" name="neg"><option value="">Alugar ou comprar?</option><option value="venda">Quero comprar</option><option value="aluguel">Quero alugar</option><option value="temporada">Temporada</option></select>'
    + '<label class="oculto" for="b-tipo">Tipo</label><select id="b-tipo" name="tipo">' + opts(o.tipos, '', 'Qual tipo?') + '</select>'
    + '<label class="oculto" for="b-cidade">Cidade</label><select id="b-cidade" name="cidade">' + opts(o.cidades, '', 'Qual cidade?') + '</select>'
    + '<label class="oculto" for="b-bairro">Bairro</label><select id="b-bairro" name="bairro">' + opts(o.bairros, '', 'Qual bairro?') + '</select>'
    + '<button type="submit" class="btn btn-gold">BUSCAR</button></form>'
    + '<div class="links"><a href="#/imoveis?foco=ref">Busca por referência</a><a href="#/imoveis?neg=temporada">Temporada: ver datas disponíveis</a><a href="#/imoveis">Ver todos os ' + r.total + ' imóveis</a></div>'
    + '</div></section>'
    + '<section class="sec"><div class="wrap"><div class="sec-cab"><div><h2>Temporada no Pontal do Sul</h2><p class="sub">Casas e apartamentos mobiliados a passos da praia. Reserve o fim de ano antes que acabe.</p></div></div>' + grade(temporada, 'grid-3')
    + '<div class="centro"><a class="btn btn-line" href="#/imoveis?neg=temporada">VEJA MAIS IMÓVEIS DE TEMPORADA</a></div></div></section>'
    + '<section class="sec"><div class="wrap"><h2>Casas à venda em Pontal do Paraná</h2><p class="sub">Da casa de praia simples ao sobrado em condomínio: imóveis com a documentação conferida pela AD7 antes de anunciar.</p>' + grade(casas)
    + '<div class="centro"><a class="btn btn-line" href="#/imoveis?neg=venda&tipo=Casa">VEJA MAIS CASAS</a></div></div></section>'
    + '<section class="sec"><div class="wrap"><h2>Apartamentos, sobrados e terrenos</h2><p class="sub">No Centro de Pontal, frente ao mar ou em Curitiba: prontos para morar, lançamentos e lotes para construir.</p>' + grade(outros)
    + '<div class="centro"><a class="btn btn-line" href="#/imoveis?neg=venda">VEJA TODOS À VENDA</a></div></div></section>'
    + '<section class="sec faixa"><div class="wrap"><h2>Imóveis pelo seu estilo de vida</h2><p class="sub">Comece pelo jeito que você quer viver no litoral, não pelo tipo de imóvel.</p><div class="lifest">'
    + '<a href="#/imoveis?mar=1">Frente ao mar</a><a href="#/imoveis?dorm=3&neg=venda">Casa de família</a><a href="#/imoveis?neg=temporada">Para investir e alugar</a><a href="#/imoveis?piscina=1">Com piscina</a><a href="#/imoveis?mobiliado=1">Mobiliados</a><a href="#/imoveis?perfil=Comercial">Comercial</a><a href="#/imoveis?tipo=Terreno">Pronto para construir</a><a href="#/imoveis?tipo=Sobrado">Sobrados</a>'
    + '</div></div></section>'
    + '<section class="sec"><div class="wrap grid grid-2">'
    + '<div class="bloco navy" id="negocie"><span class="rotulo gold">Para proprietários</span><h2>Negocie seu imóvel com a AD7</h2><p>Venda, aluguel ou temporada: avaliamos, fotografamos, anunciamos nos portais e cuidamos do contrato. Você acompanha tudo pela Área do Cliente.</p><div class="acoes"><a class="btn btn-gold" href="#/negocie">Quero anunciar</a><a class="btn btn-ghost" href="#/cliente">Já sou proprietário</a></div></div>'
    + '<div class="bloco soft" id="financie"><span class="rotulo teal">Para compradores</span><h2>Financie seu imóvel</h2><p>Simule no banco que preferir e traga a aprovação: a AD7 acompanha a documentação até a assinatura.</p><div class="acoes"><a class="btn btn-navy" href="#/financie">Simular nos bancos</a></div></div>'
    + '</div></section>'
    + '<section class="sec" id="sobre"><div class="wrap sobre"><img src="arte/sobre.jpg" alt="Sobrado anunciado pela AD7 em Pontal do Sul" loading="lazy"><div><h2 style="margin:0 0 16px;font-size:30px;font-weight:700">AD7, a sua imobiliária em Pontal do Paraná</h2>'
    + '<p>Somos especializados na compra, venda e aluguel de imóveis, com toda a assessoria necessária para uma transação segura e tranquila: acompanhamento jurídico e operacional de qualidade, do primeiro contato à entrega das chaves.</p>'
    + '<p>Reconhecidos pela ética profissional e pela transparência, oferecemos um atendimento personalizado que resulta em segurança e satisfação em todos os negócios realizados.</p>'
    + '<a class="btn btn-navy" href="#/sobre">CONHEÇA A AD7</a></div></div></section>'
    + '<section class="sec" style="padding-bottom:72px"><div class="wrap"><h2>Área do Cliente</h2><p class="sub">Proprietários e inquilinos resolvem o dia a dia sem ligar: extrato, boleto, chamado de manutenção e aviso de desocupação.</p><div class="grid grid-2">'
    + '<a class="card card-linha" href="#/cliente"><span class="ico">' + ICO.casa + '</span><span><b>Sou proprietário</b><span>Extrato de contas, repasses, informe de rendimentos, vistorias.</span></span></a>'
    + '<a class="card card-linha" href="#/cliente"><span class="ico">' + ICO.pessoa + '</span><span><b>Sou inquilino</b><span>2ª via do boleto, contrato, chamado de manutenção, aviso de desocupação.</span></span></a>'
    + '</div></div></section>';
}

/* ---------- BUSCA ---------- */
function vBusca(q) {
  const f = { neg: q.neg || '', tipo: q.tipo || '', cidade: q.cidade || '', bairro: q.bairro || '', q: q.q || '', min: q.min || '', max: q.max || '', dorm: q.dorm || '', vagas: q.vagas || '', mar: q.mar || '', piscina: q.piscina || '', mobiliado: q.mobiliado || '', perfil: q.perfil || '', ordem: q.ordem || 'recentes' };
  const o = opcoes(f), lista = filtrar(f);
  const titulo = (f.tipo ? f.tipo + (lista.length === 1 ? '' : 's') : 'Imóveis') + (f.neg ? ' ' + TRANS_VERBO[f.neg] : '') + (f.bairro ? ' em ' + f.bairro : f.cidade ? ' em ' + f.cidade : '');
  const marca = (nome, rot, on) => '<label class="marca"><input type="checkbox" name="' + nome + '"' + (on ? ' checked' : '') + '> ' + rot + '</label>';
  return '<div class="wrap lista">'
    + '<form class="filtros' + (q.abrir ? '' : ' fechado') + '" id="filtros" data-form="filtros"><h3>Filtrar</h3>'
    + '<label>Buscar <input type="search" name="q" value="' + esc(f.q) + '" placeholder="Referência, bairro, palavra…"' + (q.foco === 'ref' ? ' autofocus' : '') + '></label>'
    + '<label>Negócio <select name="neg"><option value="">Todos</option><option value="venda"' + (f.neg === 'venda' ? ' selected' : '') + '>Comprar</option><option value="aluguel"' + (f.neg === 'aluguel' ? ' selected' : '') + '>Alugar</option><option value="temporada"' + (f.neg === 'temporada' ? ' selected' : '') + '>Temporada</option></select></label>'
    + '<label>Tipo <select name="tipo">' + opts(o.tipos, f.tipo, 'Todos') + '</select></label>'
    + '<label>Cidade <select name="cidade">' + opts(o.cidades, f.cidade, 'Todas') + '</select></label>'
    + '<label>Bairro <select name="bairro">' + opts(o.bairros, f.bairro, 'Todos') + '</select></label>'
    + '<div class="duas" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label>Preço mín. <input type="number" name="min" inputmode="numeric" value="' + esc(f.min) + '" placeholder="R$"></label><label>Preço máx. <input type="number" name="max" inputmode="numeric" value="' + esc(f.max) + '" placeholder="R$"></label></div>'
    + '<div class="duas" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label>Dormitórios <select name="dorm">' + ['', '1', '2', '3', '4'].map(v => '<option value="' + v + '"' + (f.dorm === v ? ' selected' : '') + '>' + (v ? v + '+' : 'Qualquer') + '</option>').join('') + '</select></label><label>Vagas <select name="vagas">' + ['', '1', '2', '3'].map(v => '<option value="' + v + '"' + (f.vagas === v ? ' selected' : '') + '>' + (v ? v + '+' : 'Qualquer') + '</option>').join('') + '</select></label></div>'
    + marca('mar', 'Próximo ao mar', f.mar) + marca('piscina', 'Com piscina', f.piscina) + marca('mobiliado', 'Mobiliado', f.mobiliado)
    + '<button type="submit" class="btn btn-navy">Aplicar</button><a href="#/imoveis" class="btn btn-line btn-p">Limpar filtros</a></form>'
    + '<div class="resultados"><div class="cab"><h1>' + esc(titulo) + ' <small>· ' + lista.length + ' ' + (lista.length === 1 ? 'imóvel' : 'imóveis') + '</small></h1>'
    + '<div style="display:flex;gap:8px;align-items:center"><button type="button" class="btn btn-line btn-p abrir-filtros" data-act="filtros">Filtros</button><label class="oculto" for="ordem">Ordenar</label><select id="ordem" data-act="ordem"><option value="recentes"' + (f.ordem === 'recentes' ? ' selected' : '') + '>Mais recentes</option><option value="menor"' + (f.ordem === 'menor' ? ' selected' : '') + '>Menor preço</option><option value="maior"' + (f.ordem === 'maior' ? ' selected' : '') + '>Maior preço</option></select></div></div>'
    + grade(lista) + '</div></div>';
}

/* ---------- IMÓVEL ---------- */
let LB = { fotos: [], i: 0 };
function calendario(im) {
  const hoje = new Date(); const meses = [];
  const reservados = new Set();
  for (const r of im.reservas || []) {
    const ini = new Date(r.start_date || r.start || r.date || r.checkin || ''), fim = new Date(r.end_date || r.end || r.date || r.checkout || '');
    if (isNaN(ini)) continue;
    for (let d = new Date(ini); d <= (isNaN(fim) ? ini : fim); d.setDate(d.getDate() + 1)) reservados.add(d.toISOString().slice(0, 10));
  }
  for (let m = 0; m < 2; m++) {
    const d0 = new Date(hoje.getFullYear(), hoje.getMonth() + m, 1);
    const nome = d0.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const dias = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate();
    let h = '<div><div style="font-weight:700;margin-bottom:8px;text-transform:capitalize">' + esc(nome) + '</div><div class="cal" role="grid">' + ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => '<span class="cabd">' + x + '</span>').join('');
    for (let i = 0; i < d0.getDay(); i++) h += '<span></span>';
    for (let d = 1; d <= dias; d++) { const iso = new Date(d0.getFullYear(), d0.getMonth(), d).toISOString().slice(0, 10); h += '<span class="dia' + (reservados.has(iso) ? ' res' : '') + '">' + d + '</span>'; }
    meses.push(h + '</div></div>');
  }
  return '<section><div class="sec-cab" style="margin-bottom:14px"><h2 style="margin:0">Datas disponíveis</h2><div class="legenda"><span><i style="background:var(--teal-claro)"></i>Livre</span><span><i style="background:var(--linha)"></i>Reservado</span></div></div><div class="cal-meses">' + meses.join('') + '</div><p class="nota" style="color:var(--suave);font-size:13px;margin:10px 0 0">A reserva é confirmada pela AD7 no WhatsApp. Fim de ano e feriados: consulte o valor.</p></section>';
}
function vImovel(ref) {
  const im = porRef(ref);
  if (!im) return '<div class="wrap pagina"><h1>Imóvel não encontrado</h1><p class="intro">A referência ' + esc(ref) + ' não está no site. <a href="#/imoveis">Ver todos os imóveis</a></p></div>';
  LB = { fotos: im.fotos, i: 0 };
  const fav = favs().includes(im.ref);
  const chip = im.transacao === 'temporada' ? 'chip-t' : 'chip-w';
  const resumo = [];
  if (im.dorm) resumo.push(['Dormitórios', im.dorm + (im.suites ? ' (' + im.suites + ' suíte' + (im.suites > 1 ? 's' : '') + ')' : '')]);
  if (im.banheiros) resumo.push(['Banheiros', im.banheiros]);
  if (im.vagas) resumo.push(['Garagens', im.vagas]);
  if (im.areaPrincipal && im.areaPrincipal.valor) resumo.push([im.areaPrincipal.nome, fmtArea(im.areaPrincipal.valor)]);
  if (im.areaTotal && im.areaConstruida) resumo.push(['Terreno', fmtArea(im.areaTotal)]);
  if (im.transacao === 'temporada' && im.maxPessoas) resumo.push(['Hóspedes', 'até ' + im.maxPessoas]);
  const lista = (t, l) => l && l.length ? '<section><h2>' + t + '</h2><ul class="pontos">' + l.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>' : '';
  const ficha = [['Perfil', im.perfil + (im.transacao === 'temporada' ? ' · temporada' : '')], ['Situação', [im.situacao, im.mobiliado].filter(Boolean).join(', ')], ['Próximo ao mar', im.proximoMar >= 3 ? 'Sim' : im.proximoMar === 2 ? 'Médio' : 'Não informado'], ['Escriturado', im.escriturado ? 'Sim' : 'Não informado'], ['Averbado', im.averbado ? 'Sim' : 'Não informado'], ['Aceita financiamento', im.financiavel ? 'Sim' : 'Consulte'], ['Aceita permuta', im.aceitaPermuta ? 'Sim' : 'Não'], ['Condomínio', im.condominio ? fmtPreco(im.condominio) + '/mês' : '—'], ['IPTU', im.iptu ? fmtPreco(im.iptu) + '/ano' : '—']];
  const endereco = im.endereco.mostrarExato && im.endereco.rua ? im.endereco.rua + (im.endereco.numero ? ', ' + im.endereco.numero : '') + ' · ' : (im.endereco.rua ? im.endereco.rua + ' · ' : '');
  const msgWa = 'Olá! Tenho interesse no imóvel Ref. ' + im.ref + ' (' + im.titulo + '). Pode me passar mais informações?';
  const mapa = im.lat && im.lng && im.mostrarMapa ? '<div class="mapa"><b>' + esc(endereco + im.bairro + ' · ' + im.cidade) + '</b><span style="font-size:13px;color:var(--suave)">' + (im.endereco.mostrarExato ? 'Endereço exato no mapa.' : 'A localização exata é informada na visita.') + '</span><a class="btn btn-line btn-p" target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + esc(im.lat) + ',' + esc(im.lng) + '">Abrir no Google Maps</a></div>' : '';
  return '<div class="wrap imovel">'
    + '<nav class="caminho" aria-label="Caminho"><a href="#/">Início</a> › <a href="#/imoveis?neg=' + im.transacao + '">' + TRANS[im.transacao] + '</a> › <a href="#/imoveis?cidade=' + encodeURIComponent(im.cidade) + '&bairro=' + encodeURIComponent(im.bairro) + '">' + esc(im.bairro) + '</a> › Ref. ' + esc(im.ref) + '</nav>'
    + '<div class="im-cab"><div><div style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip ' + chip + '" style="background:var(--soft)">' + TRANS[im.transacao] + '</span>' + selo(im) + '<span class="chip chip-s">Ref. ' + esc(im.ref) + '</span></div>'
    + '<h1>' + esc(im.titulo) + '</h1><div class="local">' + esc(endereco + im.bairro + ' · ' + im.cidade + '/' + im.uf) + '</div></div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px"><a class="btn btn-line btn-p" target="_blank" rel="noopener" href="' + wa('Olha este imóvel da AD7: ' + im.titulo + ' (Ref. ' + im.ref + ') ' + location.href, '') + '">Compartilhar</a>'
    + '<button type="button" class="btn btn-line btn-p" data-act="fav" data-ref="' + esc(im.ref) + '" aria-pressed="' + fav + '">' + (fav ? '♥ Salvo' : '♡ Salvar') + '</button><button type="button" class="btn btn-line btn-p" data-act="imprimir">Imprimir ficha</button></div></div>'
    + '<div class="galeria">' + im.fotos.slice(0, 5).map((f, i) => '<button type="button" data-act="lb" data-i="' + i + '" aria-label="Abrir foto ' + (i + 1) + '"><img src="' + esc(f) + '" alt="Foto ' + (i + 1) + ' de ' + im.fotos.length + ': ' + esc(im.titulo) + '"' + (i ? ' loading="lazy"' : '') + '>' + (i === 0 ? '<span class="mais">Ver as ' + im.fotos.length + ' fotos</span>' : '') + '</button>').join('') + '</div>'
    + '<div class="im-corpo"><div class="im-main">'
    + (resumo.length ? '<div class="resumo">' + resumo.map(([k, v]) => '<div><span>' + esc(k) + '</span><b>' + esc(v) + '</b></div>').join('') + '</div>' : '')
    + lista('Cômodos', im.comodos) + lista('Características', im.caracteristicas) + lista('Proximidades', im.proximidades)
    + (im.descricao.length ? '<section class="descricao"><h2>Descrição</h2>' + im.descricao.map(p => '<p>' + esc(p) + '</p>').join('') + '</section>' : '')
    + (im.transacao === 'temporada' ? calendario(im) : '')
    + (mapa ? '<section><h2>Localização</h2>' + mapa + '</section>' : '')
    + '<section><h2>Ficha do imóvel</h2><div class="ficha">' + ficha.map(([k, v]) => '<div><span>' + esc(k) + '</span><span>' + esc(v) + '</span></div>').join('') + '</div></section>'
    + '</div><aside class="im-lado">'
    + '<div class="caixa destaque"><div><span class="rotulo" style="color:var(--suave)">' + TRANS[im.transacao] + (im.transacao === 'temporada' ? ' · a partir de' : '') + '</span><div class="preco">' + esc(rotuloPreco(im)) + '</div>' + (im.precoAnterior ? '<div class="nota">antes ' + esc(fmtPreco(im.precoAnterior)) + '</div>' : '') + (im.transacao === 'temporada' ? '<div class="nota">Valor por período; fim de ano e feriados sob consulta.</div>' : im.condominio ? '<div class="nota">+ condomínio ' + esc(fmtPreco(im.condominio)) + '/mês</div>' : '') + '</div>'
    + '<a class="btn btn-navy" href="#/imovel/' + esc(im.ref) + '/visita">Agendar visita</a><a class="btn btn-wa" target="_blank" rel="noopener" href="' + wa(msgWa, C.whatsappAdriana) + '">Falar com a ' + esc(C.dona) + ' no WhatsApp</a>'
    + '<div class="corretora"><img src="arte/adriana.jpg" alt=""><span><b>' + esc(C.dona) + ' · ' + esc(C.nome) + '</b><span style="color:var(--suave)">' + esc(C.creci) + ' · ' + fone(C.whatsappAdriana) + '</span></span></div></div>'
    + '<form class="caixa f" data-form="pedido" data-tipo="interesse" data-ref="' + esc(im.ref) + '" id="form-interesse"><div style="font-weight:800;font-size:16px">Quero mais informações</div>'
    + '<label>Nome <input name="nome" autocomplete="name" required></label><label>WhatsApp <input name="telefone" type="tel" autocomplete="tel" required></label><label>E-mail <input name="email" type="email" autocomplete="email"></label>'
    + '<label>Mensagem <textarea name="mensagem">Olá! Tenho interesse no imóvel Ref. ' + esc(im.ref) + '.</textarea></label>'
    + '<label class="aceite"><input type="checkbox" name="aceite"> Autorizo a AD7 a usar estes dados só para responder a este pedido. <a href="privacidade.html">Política de privacidade</a></label>'
    + '<div class="aviso erro" hidden data-aviso></div><button type="submit" class="btn btn-navy">Enviar</button></form>'
    + '</aside></div>'
    + '<section><h2 style="font-size:20px;font-weight:800;margin:0 0 14px">Imóveis parecidos</h2>' + grade(parecidos(im, 3), 'grid-3') + '</section>'
    + '</div>';
}

/* ---------- ÁREA DO CLIENTE ---------- */
const SERVICOS = {
  inquilino: [
    { id: 'boleto', t: '2ª via de boletos', p: 'O boleto do aluguel chega todo mês no e-mail do titular do contrato. Precisa de novo? Informe o CPF do titular e a AD7 manda a 2ª via no WhatsApp.', b: 'Pedir 2ª via', foto: 'arte/s-boleto.jpg' },
    { id: 'reembolso', t: 'Reembolso de taxas extraordinárias', p: 'Pagou fundo de reserva ou outra taxa extraordinária do condomínio? Informe o valor e o mês; o reembolso volta no seu próximo boleto de aluguel.', b: 'Solicitar reembolso', foto: 'arte/s-reembolso.jpg' },
    { id: 'chamado', t: 'Chamados de manutenção', p: 'Registre o problema do imóvel. A AD7 pede o orçamento, combina com o proprietário e agenda a visita do prestador com você.', b: 'Abrir chamado', foto: 'arte/s-chamado.jpg' },
    { id: 'desocupacao', t: 'Aviso de desocupação', p: 'Vai sair do imóvel? Formalize o aviso e receba o passo a passo da vistoria de saída e do acerto final.', b: 'Quero desocupar', foto: 'arte/s-desocupacao.jpg' },
  ],
  proprietario: [
    { id: 'extrato', t: 'Extrato de contas', p: 'Todo mês você recebe o extrato por e-mail: aluguel recebido, taxa de administração, descontos e o repasse líquido. Peça aqui uma via a qualquer hora.', b: 'Pedir extrato', foto: 'arte/s-extrato.jpg' },
    { id: 'informe', t: 'Informe de rendimentos', p: 'O informe anual para a declaração do Imposto de Renda, com os valores separados por imóvel.', b: 'Pedir informe', foto: 'arte/s-informe.jpg' },
    { id: 'vistoria', t: 'Vistorias e fotos do imóvel', p: 'Vistoria de entrada e de saída com fotos datadas e laudo. Peça a sua, ou saiba como está um chamado do inquilino.', b: 'Pedir vistoria', foto: 'arte/s-vistoria.jpg' },
  ],
};
function cardServico(s, grupo) {
  return '<article class="card card-serv"><div class="foto"><img src="' + s.foto + '" alt="" loading="lazy"><span class="chip chip-w">' + grupo + '</span></div><div class="corpo"><h3>' + esc(s.t) + '</h3><p>→ ' + esc(s.p) + '</p></div><a class="btn btn-teal" href="#/cliente/' + s.id + '">' + esc(s.b) + '</a></article>';
}
function vCliente() {
  return '<section class="faixa-cliente"><span class="logo" style="display:inline-flex"><img src="arte/logo.png" alt="" style="height:40px"></span><h1>Área do Cliente</h1><p>Tudo o que proprietários e inquilinos da AD7 precisam, sem precisar ligar. Escolha o serviço e identifique-se pelo CPF do titular do contrato.</p></section>'
    + '<div class="wrap pagina" style="gap:48px">'
    + '<div class="entrar"><div style="flex:1 1 100%"><b style="font-size:16px">Entrar com senha</b><div style="color:var(--suave);font-size:14px">O acesso com senha, com boletos, extratos e contratos na tela, chega na próxima etapa do app. Até lá, cada serviço abaixo é um pedido que a AD7 responde no WhatsApp.</div></div>'
    + '<div class="linha"><a href="#/entrar">Sou da equipe AD7</a></div></div>'
    + '<section><h2 style="margin:0 0 20px;font-size:26px;font-weight:700">Inquilinos</h2><div class="grid grid-2">' + SERVICOS.inquilino.map(s => cardServico(s, 'Inquilinos')).join('') + '</div></section>'
    + '<section><h2 style="margin:0 0 20px;font-size:26px;font-weight:700">Proprietários</h2><div class="grid grid-2">' + SERVICOS.proprietario.map(s => cardServico(s, 'Proprietários')).join('') + '</div></section>'
    + '<section class="grid grid-2">'
    + '<div class="caixa"><span class="rotulo teal">Seus dados · LGPD</span><h3 style="margin:0;font-size:20px;font-weight:700">Você manda nos seus dados</h3><p style="margin:0;color:var(--suave);font-size:14px">A AD7 guarda só o que o contrato e a lei exigem. Você pode pedir uma cópia, corrigir um dado ou pedir a exclusão do que não for mais obrigatório. Respondemos em até 15 dias.</p><div style="display:flex;flex-wrap:wrap;gap:16px;font-size:14px;font-weight:600"><a href="privacidade.html">Política de privacidade</a><a href="mailto:' + esc(C.emailPrivacidade) + '">' + esc(C.emailPrivacidade) + '</a></div></div>'
    + '<div class="bloco navy" style="padding:28px"><span class="rotulo gold">Prefere falar com alguém?</span><h3 style="margin:0;font-size:20px;font-weight:700">A ' + esc(C.dona) + ' responde no WhatsApp</h3><p style="font-size:14px">' + esc(C.horario) + '. Fora desse horário, mande a mensagem que a equipe retoma no dia seguinte.</p><div><a class="btn btn-wa" target="_blank" rel="noopener" href="' + wa('', C.whatsappAdriana) + '">Chamar no WhatsApp</a></div></div>'
    + '</section></div>';
}
function campo(nome, rot, attrs) { return '<label>' + rot + ' <input name="' + nome + '" ' + (attrs || '') + '></label>'; }
function vServico(id) {
  const s = [...SERVICOS.inquilino, ...SERVICOS.proprietario].find(x => x.id === id);
  if (!s) return vCliente();
  const extras = {
    boleto: campo('extra_mes', 'Mês do boleto', 'placeholder="ex.: outubro/2026"'),
    reembolso: '<div class="duas">' + campo('extra_valor', 'Valor pago (R$)', 'inputmode="decimal"') + campo('extra_mes', 'Mês', 'placeholder="ex.: setembro/2026"') + '</div>',
    chamado: '<label>Urgência <select name="extra_urgencia"><option>Pode esperar alguns dias</option><option>Precisa de atenção esta semana</option><option>Urgente (vazamento, falta de luz, risco)</option></select></label>',
    desocupacao: campo('extra_data', 'Data prevista para sair', 'type="date"'),
    extrato: campo('extra_mes', 'Mês do extrato', 'placeholder="ex.: setembro/2026"'),
    informe: campo('extra_ano', 'Ano-calendário', 'placeholder="ex.: 2026" inputmode="numeric"'),
    vistoria: '<label>Tipo <select name="extra_tipo"><option>Vistoria de entrada</option><option>Vistoria de saída</option><option>Acompanhar um chamado</option></select></label>',
  };
  const msgRot = { chamado: 'Descreva o problema (onde, desde quando)', desocupacao: 'Alguma observação', anuncio: 'Descreva o imóvel' }[id] || 'Mensagem';
  return '<div class="wrap pagina estreita"><nav class="caminho"><a href="#/cliente">Área do Cliente</a> › ' + esc(s.t) + '</nav><h1>' + esc(s.t) + '</h1><p class="intro">' + esc(s.p) + '</p>'
    + '<form class="caixa f" data-form="pedido" data-tipo="' + id + '">'
    + '<div class="duas">' + campo('nome', 'Nome completo', 'autocomplete="name" required') + campo('cpf', 'CPF do titular do contrato', 'inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" required') + '</div>'
    + '<div class="duas">' + campo('telefone', 'WhatsApp', 'type="tel" autocomplete="tel" required') + campo('email', 'E-mail', 'type="email" autocomplete="email"') + '</div>'
    + campo('extra_imovel', 'Imóvel (endereço ou referência)', '')
    + (extras[id] || '')
    + '<label>' + msgRot + ' <textarea name="mensagem"></textarea></label>'
    + '<label class="aceite"><input type="checkbox" name="aceite"> Autorizo a AD7 a usar estes dados só para atender a este pedido. O CPF serve para localizar o seu contrato. <a href="privacidade.html">Política de privacidade</a></label>'
    + '<div class="aviso erro" hidden data-aviso></div><button type="submit" class="btn btn-teal" style="border-radius:4px">Enviar pedido</button></form></div>';
}

/* ---------- NEGOCIE / FINANCIE / SOBRE / CONTATO / FAVORITOS ---------- */
function vNegocie() {
  return '<div class="wrap pagina estreita"><h1>Negocie seu imóvel</h1><p class="intro">Conte sobre o imóvel. A AD7 avalia, fotografa, anuncia nos portais e cuida do contrato. Sem compromisso até você autorizar.</p>'
    + '<form class="caixa f" data-form="pedido" data-tipo="anuncio">'
    + '<div class="rotulo teal">Seus dados</div><div class="duas">' + campo('nome', 'Nome', 'autocomplete="name" required') + campo('telefone', 'WhatsApp', 'type="tel" autocomplete="tel" required') + '</div>' + campo('email', 'E-mail', 'type="email" autocomplete="email"')
    + '<div class="rotulo teal" style="margin-top:8px">O imóvel</div>'
    + '<label>Você gostaria de</label><div class="opcoes"><label><input type="radio" name="extra_quer" value="Vender" checked> Vender</label><label><input type="radio" name="extra_quer" value="Alugar"> Alugar</label><label><input type="radio" name="extra_quer" value="Temporada"> Temporada</label></div>'
    + '<div class="duas"><label>Tipo <select name="extra_tipo"><option>Casa</option><option>Apartamento</option><option>Sobrado</option><option>Terreno</option><option>Comercial</option><option>Chácara</option></select></label><label>Perfil <select name="extra_perfil"><option>Residencial</option><option>Comercial</option></select></label></div>'
    + '<div class="duas">' + campo('extra_cidade', 'Cidade', 'value="Pontal do Paraná"') + campo('extra_bairro', 'Bairro', '') + '</div>'
    + campo('extra_endereco', 'Endereço (rua e número)', '')
    + '<div class="duas">' + campo('extra_preco', 'Preço pretendido (R$)', 'inputmode="decimal"') + campo('extra_condominio', 'Condomínio (R$/mês)', 'inputmode="decimal"') + '</div>'
    + '<div class="duas">' + campo('extra_iptu', 'IPTU (R$/ano)', 'inputmode="decimal"') + '<label>Aceita permuta? <select name="extra_permuta"><option>Não</option><option>Sim</option></select></label></div>'
    + '<label>Descreva o imóvel <textarea name="mensagem" placeholder="Situação do imóvel, pontos fortes, vizinhança, ventilação, iluminação…"></textarea></label>'
    + '<label class="aceite"><input type="checkbox" name="extra_autoriza"> Autorizo a AD7 a avaliar o imóvel e entrar em contato para combinar a intermediação.</label>'
    + '<label class="aceite"><input type="checkbox" name="aceite"> Concordo com a <a href="privacidade.html">Política de privacidade</a>.</label>'
    + '<div class="aviso erro" hidden data-aviso></div><button type="submit" class="btn btn-navy">Enviar</button></form></div>';
}
function vFinancie() {
  const bancos = [['Caixa', 'https://www.caixa.gov.br/voce/habitacao/Paginas/default.aspx'], ['Banco do Brasil', 'https://www.bb.com.br/site/pra-voce/financiamentos/financiamento-imobiliario/'], ['Itaú', 'https://www.itau.com.br/emprestimos-financiamentos/credito-imobiliario/'], ['Bradesco', 'https://banco.bradesco/html/classic/produtos-servicos/emprestimo-e-financiamento/credito-imobiliario.shtm'], ['Santander', 'https://www.santander.com.br/creditos-e-financiamentos/credito-imobiliario'], ['Sicredi', 'https://www.sicredi.com.br/site/credito-imobiliario/']];
  return '<div class="wrap pagina"><h1>Financie seu imóvel</h1><p class="intro">Simule o financiamento no banco de sua preferência. Com a carta de aprovação em mãos, a AD7 acompanha a documentação até a assinatura.</p>'
    + '<div class="grid grid-3">' + bancos.map(([n, u]) => '<a class="card card-linha" href="' + u + '" target="_blank" rel="noopener"><span class="ico">' + ICO.casa + '</span><span><b>' + n + '</b><span>Simular agora →</span></span></a>').join('') + '</div>'
    + '<div class="caixa"><b>Dica da AD7</b><p style="margin:0;color:var(--suave)">Imóveis que aceitam financiamento estão marcados na ficha. Na dúvida, <a href="' + wa('Olá! Quero saber quais imóveis da AD7 aceitam financiamento.') + '" target="_blank" rel="noopener">pergunte no WhatsApp</a>.</p></div></div>';
}
function vSobre() {
  const r = resumoCatalogo();
  return '<div class="wrap pagina"><div class="sobre"><img src="arte/sobre.jpg" alt="Sobrado anunciado pela AD7 em Pontal do Sul"><div><h1 style="margin:0 0 16px">Sobre a AD7</h1>'
    + '<p>Precisando de uma solução ou querendo investir no mercado imobiliário, conte com a máxima transparência e a atenção de uma corretora especializada.</p>'
    + '<p>Somos especializados na compra, venda e aluguel de imóveis e prestamos toda a assessoria necessária à realização de uma transação segura e tranquila, com acompanhamento jurídico e operacional de qualidade.</p>'
    + '<p>Reconhecidos pela ética profissional e transparência no mercado imobiliário, oferecemos a nossos clientes um atendimento personalizado, resultando em segurança e satisfação em todos os negócios realizados.</p>'
    + '<p>Possuímos profissionais capacitados e diferenciados para uma total eficiência e garantia nas intermediações imobiliárias. Entre em contato: teremos o prazer em ajudá-lo a realizar o sonho da casa própria.</p></div></div>'
    + '<div class="resumo" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><span>Imóveis</span><b>' + r.total + '</b></div><div><span>À venda</span><b>' + (r.porTransacao.venda || 0) + '</b></div><div><span>Temporada</span><b>' + (r.porTransacao.temporada || 0) + '</b></div><div><span>Cidades</span><b>' + r.cidades.length + '</b></div></div>'
    + '<div class="caixa"><b>Onde estamos</b><p style="margin:0">' + esc(C.endereco) + '<br>' + esc(C.cidade) + '</p><div class="acoes"><a class="btn btn-navy" href="#/contato">Fale com a gente</a><a class="btn btn-line" href="#/negocie">Anuncie seu imóvel</a></div></div></div>';
}
function vContato() {
  return '<div class="wrap pagina"><h1>Entre em contato</h1><div class="grid grid-2" style="align-items:start">'
    + '<form class="caixa f" data-form="pedido" data-tipo="contato">' + campo('nome', 'Nome', 'autocomplete="name" required') + '<div class="duas">' + campo('telefone', 'WhatsApp', 'type="tel" autocomplete="tel" required') + campo('email', 'E-mail', 'type="email" autocomplete="email"') + '</div>'
    + '<label>Mensagem <textarea name="mensagem" required></textarea></label><label class="aceite"><input type="checkbox" name="aceite"> Concordo com a <a href="privacidade.html">Política de privacidade</a>.</label><div class="aviso erro" hidden data-aviso></div><button type="submit" class="btn btn-navy">Enviar</button></form>'
    + '<div class="caixa"><b>' + esc(C.nome) + '</b><p style="margin:0">' + esc(C.endereco) + '<br>' + esc(C.cidade) + '</p><a href="https://www.google.com/maps/search/' + encodeURIComponent(C.endereco + ', ' + C.cidade) + '" target="_blank" rel="noopener">Veja como chegar</a>'
    + '<p style="margin:0"><a href="' + wa() + '" target="_blank" rel="noopener">' + fone(C.whatsapp) + '</a><br><a href="' + wa('', C.whatsappAdriana) + '" target="_blank" rel="noopener">' + fone(C.whatsappAdriana) + '</a><br>' + esc(C.fixo) + '</p><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a><p style="margin:0;color:var(--suave);font-size:14px">' + esc(C.horario) + '</p></div></div></div>';
}
function vFavoritos() {
  const lista = favs().map(porRef).filter(Boolean);
  return '<div class="wrap pagina"><h1>Meus favoritos</h1><p class="intro">Os imóveis que você salvou ficam neste aparelho. Compartilhe a lista com quem decide junto.</p>' + (lista.length ? grade(lista) + '<div class="acoes"><a class="btn btn-wa" target="_blank" rel="noopener" href="' + wa('Olá! Separei estes imóveis da AD7: ' + lista.map(im => 'Ref. ' + im.ref + ' (' + im.titulo + ')').join('; ')) + '">Mandar a lista no WhatsApp</a></div>' : '<div class="vazio">Você ainda não salvou nenhum imóvel. Toque no coração de um imóvel para guardar aqui.</div>') + '</div>';
}

/* ---------- ENTRAR / PAINEL ---------- */
function vEntrar(msg) {
  return '<div class="wrap pagina estreita"><h1>Entrar · equipe AD7</h1><p class="intro">Só para a ' + esc(C.dona) + ' e a equipe. Clientes usam a <a href="#/cliente">Área do Cliente</a>.</p>'
    + (temNuvem() ? '' : '<div class="aviso neutro">Este app ainda está sem banco: o painel mostra os pedidos recebidos neste aparelho. Com a sala no ar, o login passa a valer em qualquer aparelho.</div>')
    + '<form class="caixa f" data-form="entrar">' + campo('email', 'E-mail', 'type="email" autocomplete="username" required') + campo('senha', 'Senha', 'type="password" autocomplete="current-password" required') + '<div class="aviso erro"' + (msg ? '' : ' hidden') + ' data-aviso>' + esc(msg || '') + '</div><button type="submit" class="btn btn-navy">Entrar</button><a href="#/entrar/esqueci" style="font-size:14px">Esqueci a senha</a></form></div>';
}
async function vPainel() {
  if (temNuvem() && !isLoggedIn()) return vEntrar();
  const r = await listarPedidos();
  const tag = s => s === 'atendido' ? 'tag-ok' : s === 'novo' ? 'tag-novo' : 'tag-neu';
  const linhas = r.lista.map(p => '<tr><td>' + esc(new Date(p.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })) + '</td><td><b>' + esc(p.rotulo) + '</b>' + (p.imovelRef ? '<br><small>' + (/^\d+$/.test(p.imovelRef) ? 'Ref. ' : 'Imóvel: ') + esc(p.imovelRef) + '</small>' : '') + '</td><td>' + esc(p.nome) + '<br><a href="' + wa('Olá ' + p.nome.split(' ')[0] + '! Aqui é da AD7, sobre o seu pedido: ' + p.rotulo + '.', p.telefone) + '" target="_blank" rel="noopener">' + fone(p.telefone) + '</a>' + (p.email ? '<br><small>' + esc(p.email) + '</small>' : '') + '</td><td>' + esc(p.mensagem || '') + (Object.entries(p.extra || {}).filter(([, v]) => v).map(([k, v]) => '<br><small>' + esc(k) + ': ' + esc(v) + '</small>').join('')) + '</td><td><span class="tag ' + tag(p.status) + '">' + esc(p.status) + '</span></td><td>' + (p.status === 'atendido' ? '<button type="button" class="btn btn-line btn-p" data-act="pedido" data-id="' + esc(p.id) + '" data-status="novo">Reabrir</button>' : '<button type="button" class="btn btn-navy btn-p" data-act="pedido" data-id="' + esc(p.id) + '" data-status="atendido">Atendido</button>') + '</td></tr>').join('');
  return '<div class="wrap painel"><div class="sec-cab"><h1 style="margin:0;font-size:26px;font-weight:800">Pedidos recebidos <small style="color:var(--suave);font-weight:600;font-size:15px">· ' + r.lista.length + '</small></h1><div style="display:flex;gap:8px">' + (isLoggedIn() ? '<span style="font-size:13px;color:var(--suave);align-self:center">' + esc(authEmail() || '') + '</span><button type="button" class="btn btn-line btn-p" data-act="sair">Sair</button>' : '') + '</div></div>'
    + (r.nuvem ? '' : '<div class="aviso neutro">Sem banco ainda: estes são os pedidos feitos neste aparelho. Os que vieram pelo WhatsApp estão lá.</div>')
    + (r.lista.length ? '<div class="rolar"><table><thead><tr><th>Quando</th><th>Pedido</th><th>Quem</th><th>Detalhes</th><th>Situação</th><th></th></tr></thead><tbody>' + linhas + '</tbody></table></div>' : '<div class="vazio">Nenhum pedido ainda.</div>') + '</div>';
}

/* ---------- moldura: menu, rodapé ---------- */
function moldura() {
  const links = [['#/imoveis?neg=venda', 'Comprar'], ['#/imoveis?neg=aluguel', 'Alugar'], ['#/imoveis?neg=temporada', 'Temporada'], ['#/negocie', 'Negocie seu imóvel'], ['#/financie', 'Financie'], ['#/sobre', 'Sobre'], ['#/contato', 'Contato']];
  const atual = location.hash;
  $('#menu').innerHTML = links.map(([h, t]) => '<a href="' + h + '"' + (atual === h ? ' class="ativo"' : '') + '>' + t + '</a>').join('');
  $('#menu-cel').innerHTML = links.concat([['#/cliente', 'Área do Cliente'], ['#/favoritos', 'Meus favoritos']]).map(([h, t]) => '<a href="' + h + '">' + t + '</a>').join('');
  $('#topo-creci').textContent = C.creci + ' · ' + C.nome.toUpperCase() + ' · ' + C.slogan.toUpperCase();
  $('#topo-links').innerHTML = '<a href="' + wa() + '" target="_blank" rel="noopener">' + fone(C.whatsapp) + '</a><a href="#/contato">' + esc(C.fixo) + '</a><a href="#/cliente">Área do Cliente</a><a href="#/favoritos">Meus Favoritos</a>';
  $('#cab-wa').href = wa(); $('#wa-flut').href = wa();
  $('#rodape').innerHTML = '<div><span class="marca">' + esc(C.nome) + '</span><span style="font-size:13px;line-height:1.6;display:block;margin-top:8px">' + esc(C.slogan) + ' em Pontal do Paraná, do primeiro contato até a entrega das chaves.</span><div class="social"><a href="' + esc(C.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a><a href="' + esc(C.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg></a></div></div>'
    + '<div><b>Para você</b><a href="#/negocie">Anuncie seu imóvel</a><br><a href="#/financie">Financie</a><br><a href="privacidade.html">Política de privacidade</a><br><a href="mailto:' + esc(C.emailPrivacidade) + '">Seus dados (LGPD)</a></div>'
    + '<div><b>Acesso rápido</b><a href="#/imoveis?neg=venda">Comprar</a><br><a href="#/imoveis?neg=aluguel">Alugar</a><br><a href="#/imoveis?neg=temporada">Temporada</a><br><a href="#/favoritos">Favoritos</a><br><a href="#/cliente">Área do Cliente</a><br><a href="#/painel" style="color:var(--dourado)">Equipe AD7</a></div>'
    + '<div style="font-size:14px;line-height:1.6"><b>Contato</b>' + esc(C.endereco) + '<br>' + esc(C.cidade) + '<br><a href="' + wa() + '" target="_blank" rel="noopener">' + fone(C.whatsapp) + '</a><br><a href="' + wa('', C.whatsappAdriana) + '" target="_blank" rel="noopener">' + fone(C.whatsappAdriana) + '</a><br>' + esc(C.fixo) + '<br><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></div>';
  $('#rodape-fim').innerHTML = '<span>' + esc(C.nome) + ' · CNPJ ' + esc(C.cnpj) + ' · ' + esc(C.creci) + '</span><span>© ' + new Date().getFullYear() + ' ' + esc(C.nome) + ' · v' + APP_VERSAO + '</span>';
  $('#cookies').hidden = cookiesDecidido();
}

/* ---------- render ---------- */
let ROTA_ANTES = '';
async function render() {
  const r = rota();
  const app = $('#app');
  let html = '', titulo = C.nome + ' · ' + C.slogan + ' em Pontal do Paraná';
  if (!CAT.pronto) html = '<div class="carregando">Carregando os imóveis…</div>';
  else switch (r.nome) {
    case 'inicio': html = vInicio(); break;
    case 'imoveis': html = vBusca(r.query); titulo = 'Imóveis · ' + C.nome; break;
    case 'imovel': { const im = porRef(r.param); html = r.sub === 'visita' && im ? vServicoVisita(im) : vImovel(r.param); if (im) titulo = im.titulo + ' · Ref. ' + im.ref + ' · ' + C.nome; break; }
    case 'cliente': html = r.param ? vServico(r.param) : vCliente(); titulo = 'Área do Cliente · ' + C.nome; break;
    case 'negocie': html = vNegocie(); titulo = 'Negocie seu imóvel · ' + C.nome; break;
    case 'financie': html = vFinancie(); titulo = 'Financie · ' + C.nome; break;
    case 'sobre': html = vSobre(); titulo = 'Sobre · ' + C.nome; break;
    case 'contato': html = vContato(); titulo = 'Contato · ' + C.nome; break;
    case 'favoritos': html = vFavoritos(); titulo = 'Favoritos · ' + C.nome; break;
    case 'entrar': html = r.param === 'esqueci' ? vEsqueci() : vEntrar(); titulo = 'Entrar · ' + C.nome; break;
    case 'painel': html = await vPainel(); titulo = 'Pedidos · ' + C.nome; break;
    default: html = '<div class="wrap pagina"><h1>Página não encontrada</h1><p class="intro"><a href="#/">Voltar ao início</a></p></div>';
  }
  app.innerHTML = html;
  document.title = titulo;
  moldura();
  const chave = r.nome + '/' + r.param + '/' + r.sub;
  if (chave !== ROTA_ANTES) window.scrollTo(0, 0);
  ROTA_ANTES = chave;
  $('#menu-cel').classList.remove('aberto'); $('#hamb').setAttribute('aria-expanded', 'false');
}
function vServicoVisita(im) {
  return '<div class="wrap pagina estreita"><nav class="caminho"><a href="#/imovel/' + esc(im.ref) + '">' + esc(im.titulo) + '</a> › Agendar visita</nav><h1>Agendar visita</h1><p class="intro">Ref. ' + esc(im.ref) + ' · ' + esc(im.bairro) + '. Diga quando é bom para você; a ' + esc(C.dona) + ' confirma no WhatsApp.</p>'
    + '<form class="caixa f" data-form="pedido" data-tipo="interesse" data-ref="' + esc(im.ref) + '"><div class="duas">' + campo('nome', 'Nome', 'autocomplete="name" required') + campo('telefone', 'WhatsApp', 'type="tel" autocomplete="tel" required') + '</div><div class="duas">' + campo('extra_dia', 'Dia', 'type="date"') + campo('extra_horario', 'Horário', 'placeholder="ex.: de manhã"') + '</div>'
    + '<label>Observações <textarea name="mensagem">Quero agendar uma visita ao imóvel Ref. ' + esc(im.ref) + '.</textarea></label><label class="aceite"><input type="checkbox" name="aceite"> Autorizo a AD7 a usar estes dados só para combinar a visita. <a href="privacidade.html">Política de privacidade</a></label><div class="aviso erro" hidden data-aviso></div><button type="submit" class="btn btn-navy">Pedir visita</button></form></div>';
}
function vEsqueci() {
  return '<div class="wrap pagina estreita"><h1>Esqueci a senha</h1><p class="intro">Informe o e-mail da conta: chega um link para criar uma senha nova.</p><form class="caixa f" data-form="esqueci">' + campo('email', 'E-mail', 'type="email" required') + '<div class="aviso" hidden data-aviso></div><button type="submit" class="btn btn-navy">Mandar o link</button></form></div>';
}

/* ---------- eventos ---------- */
function dadosForm(form) { const d = {}; const extra = {}; for (const [k, v] of new FormData(form).entries()) { if (k.startsWith('extra_')) extra[k.slice(6)] = String(v).trim(); else d[k] = v; } d.extra = extra; d.aceite = form.elements.aceite ? form.elements.aceite.checked : false; if (form.elements.extra_autoriza && !form.elements.extra_autoriza.checked) d.extra.autoriza = ''; return d; }
function aviso(form, texto, cls) { const a = form.querySelector('[data-aviso]'); if (!a) return; a.className = 'aviso ' + (cls || 'erro'); a.textContent = texto; a.hidden = !texto; }

document.addEventListener('submit', async e => {
  const form = e.target; const tipo = form.dataset.form; if (!tipo) return;
  e.preventDefault();
  if (tipo === 'busca' || tipo === 'filtros') {
    const d = Object.fromEntries(new FormData(form).entries());
    for (const k of ['mar', 'piscina', 'mobiliado']) if (d[k] === 'on') d[k] = '1';
    const q = rota().query; if (q.ordem) d.ordem = q.ordem;
    navegar('#/imoveis' + qs(d)); return;
  }
  if (tipo === 'pedido') {
    const d = dadosForm(form); d.imovelRef = form.dataset.ref || d.extra.imovel || '';
    if (form.dataset.tipo === 'anuncio' && !form.elements.extra_autoriza.checked) { aviso(form, 'Marque a autorização para a AD7 avaliar o imóvel.'); return; }
    const bt = form.querySelector('button[type=submit]'); bt.disabled = true; bt.textContent = 'Enviando…';
    const r = await enviarPedido(form.dataset.tipo, d);
    if (!r.ok) { aviso(form, r.erro); bt.disabled = false; bt.textContent = 'Enviar'; return; }
    const nome = r.pedido.nome.split(' ')[0];
    form.innerHTML = '<div class="aviso ok"><b>Pronto, ' + esc(nome) + '!</b> ' + (r.nuvem ? 'Seu pedido chegou na AD7 (nº ' + esc(r.pedido.id) + '). A ' + esc(C.dona) + ' responde no WhatsApp.' : 'Seu pedido está anotado (nº ' + esc(r.pedido.id) + '). Para a AD7 receber agora, mande também pelo WhatsApp com um toque:') + '</div><a class="btn btn-wa" target="_blank" rel="noopener" href="' + r.whatsapp + '">' + (r.nuvem ? 'Adiantar no WhatsApp' : 'Mandar pelo WhatsApp') + '</a>';
    return;
  }
  if (tipo === 'entrar') {
    const d = Object.fromEntries(new FormData(form).entries());
    if (!temNuvem()) { navegar('#/painel'); return; }
    aviso(form, '');
    const r = await authSignIn(d.email, d.senha);
    if (!r.ok) { aviso(form, r.error || 'Não deu certo. Confira o e-mail e a senha.'); return; }
    if (typeof claimOwnership === 'function') claimOwnership().catch(() => {});
    navegar('#/painel'); return;
  }
  if (tipo === 'esqueci') {
    const d = Object.fromEntries(new FormData(form).entries());
    if (!temNuvem()) { aviso(form, 'Ainda sem banco: a senha só existe com a sala no ar.', 'neutro'); return; }
    const r = await authReset(d.email);
    aviso(form, r.ok ? 'Se existir uma conta com esse e-mail, o link já foi. Olhe a caixa de entrada e o spam.' : (r.error || 'Não deu certo.'), r.ok ? 'ok' : 'erro'); return;
  }
});

document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'fav') { e.preventDefault(); const on = favToggle(el.dataset.ref); el.classList.toggle('on', on); el.setAttribute('aria-pressed', on); if (el.classList.contains('fav')) el.innerHTML = on ? ICO.coracaoCheio : ICO.coracao; else el.textContent = on ? '♥ Salvo' : '♡ Salvar'; return; }
  if (act === 'cookies-sim' || act === 'cookies-nao') { try { localStorage.setItem(COOKIE_KEY, act === 'cookies-sim' ? 'sim' : 'nao'); } catch (x) {} $('#cookies').hidden = true; return; }
  if (act === 'filtros') { $('#filtros').classList.toggle('fechado'); return; }
  if (act === 'imprimir') { window.print(); return; }
  if (act === 'lb') { LB.i = +el.dataset.i || 0; lightbox(true); return; }
  if (act === 'lb-fechar') { lightbox(false); return; }
  if (act === 'lb-ant') { LB.i = (LB.i - 1 + LB.fotos.length) % LB.fotos.length; lightbox(true); return; }
  if (act === 'lb-prox') { LB.i = (LB.i + 1) % LB.fotos.length; lightbox(true); return; }
  if (act === 'pedido') { el.disabled = true; await marcarPedido(el.dataset.id, el.dataset.status); render(); return; }
  if (act === 'sair') { await authSignOut(); navegar('#/'); return; }
});
document.addEventListener('change', e => { if (e.target.dataset.act === 'ordem') { const q = rota().query; q.ordem = e.target.value; navegar('#/imoveis' + qs(q)); } });
document.addEventListener('keydown', e => { if ($('#lightbox').hidden) return; if (e.key === 'Escape') lightbox(false); if (e.key === 'ArrowRight') { LB.i = (LB.i + 1) % LB.fotos.length; lightbox(true); } if (e.key === 'ArrowLeft') { LB.i = (LB.i - 1 + LB.fotos.length) % LB.fotos.length; lightbox(true); } });
function lightbox(abrir) {
  const lb = $('#lightbox'); lb.hidden = !abrir;
  if (abrir && LB.fotos.length) { $('#lb-img').src = LB.fotos[LB.i]; $('#lb-img').alt = 'Foto ' + (LB.i + 1); $('#lb-n').textContent = (LB.i + 1) + ' / ' + LB.fotos.length; }
  document.body.style.overflow = abrir ? 'hidden' : '';
}
$('#hamb').addEventListener('click', () => { const m = $('#menu-cel'); m.classList.toggle('aberto'); $('#hamb').setAttribute('aria-expanded', m.classList.contains('aberto')); });

/* ---------- início ---------- */
window.addEventListener('hashchange', render);
(async function iniciar() {
  if (typeof authLoad === 'function') authLoad();
  if (typeof authFromHash === 'function') try { await authFromHash(); } catch (e) {}
  await carregarCatalogo(APP_VERSAO);
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
