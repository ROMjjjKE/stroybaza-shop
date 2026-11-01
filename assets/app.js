(function(){
  var S = window.STORE;
  var KEY = 'sb_cart_v1';
  var CATS = S.categories, PROD = S.products;
  var catName = function(id){ for (var i=0;i<CATS.length;i++) if (CATS[i][0]===id) return CATS[i][1]; return ''; };
  var money = function(n){ return n.toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}); };

  var ICONS = {
    kirpich:'<svg viewBox="0 0 64 64" fill="none"><rect x="6" y="18" width="52" height="12" rx="2" stroke="#4d565e" stroke-width="2"/><rect x="10" y="32" width="44" height="12" rx="2" stroke="#4d565e" stroke-width="2"/><path d="M6 18v6M58 18v6" stroke="#9aa3aa"/></svg>',
    smesi:'<svg viewBox="0 0 64 64" fill="none"><path d="M18 20h28l-3 30H21z" stroke="#4d565e" stroke-width="2"/><path d="M22 12h20l4 8H18z" stroke="#1557c0" stroke-width="2"/><path d="M26 36h12" stroke="#9aa3aa" stroke-width="2"/></svg>',
    les:'<svg viewBox="0 0 64 64" fill="none"><rect x="8" y="24" width="48" height="8" rx="1" stroke="#4d565e" stroke-width="2"/><rect x="8" y="36" width="48" height="8" rx="1" stroke="#4d565e" stroke-width="2"/><path d="M16 24v20M32 24v20M48 24v20" stroke="#c8ced3"/></svg>',
    metall:'<svg viewBox="0 0 64 64" fill="none"><rect x="14" y="14" width="36" height="36" rx="2" stroke="#4d565e" stroke-width="2"/><rect x="24" y="24" width="16" height="16" stroke="#1557c0" stroke-width="2"/></svg>',
    krovlya:'<svg viewBox="0 0 64 64" fill="none"><path d="M8 34 32 14l24 20" stroke="#1557c0" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 34v16h36V34" stroke="#4d565e" stroke-width="2"/><path d="M14 42h36" stroke="#c8ced3" stroke-width="2"/></svg>',
    otdelka:'<svg viewBox="0 0 64 64" fill="none"><rect x="12" y="12" width="40" height="40" rx="2" stroke="#4d565e" stroke-width="2"/><path d="M22 12v40M42 12v40M12 32h40" stroke="#c8ced3"/></svg>',
    krepezh:'<svg viewBox="0 0 64 64" fill="none"><path d="M26 12h12l-2 10v26a4 4 0 0 1-8 0V22z" stroke="#4d565e" stroke-width="2"/><path d="M26 20h12" stroke="#1557c0" stroke-width="2"/></svg>',
    izolyaciya:'<svg viewBox="0 0 64 64" fill="none"><rect x="10" y="16" width="44" height="32" rx="3" stroke="#4d565e" stroke-width="2"/><path d="M18 16v32M26 16v32M34 16v32M42 16v32" stroke="#c8ced3" stroke-width="1.6"/></svg>'
  };
  var icon = function(cat){ return ICONS[cat] || ICONS.otdelka; };

  function cart(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function save(c){ localStorage.setItem(KEY, JSON.stringify(c)); syncBadges(); }
  function count(){ var c=cart(), n=0; for (var k in c) n += c[k]; return n; }
  function total(){ var c=cart(), t=0; PROD.forEach(function(p){ if (c[p.id]) t += c[p.id]*p.price; }); return t; }
  function syncBadges(){ var n=count(); document.querySelectorAll('[data-cart-count]').forEach(function(el){ el.textContent = n; }); }

  function add(id, qty){
    var c=cart(); c[id]=(c[id]||0)+(qty||1); save(c);
    toast('Добавлено в корзину');
  }
  function setQty(id, q){ var c=cart(); if (q<=0) delete c[id]; else c[id]=q; save(c); }
  function remove(id){ var c=cart(); delete c[id]; save(c); }

  var toastEl;
  function toast(msg){
    if (!toastEl){ toastEl=document.createElement('div'); toastEl.className='toast'; document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.classList.add('on');
    clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){ toastEl.classList.remove('on'); }, 1800);
  }

  /* карточка товара в сетке */
  function cardHTML(p){
    var out = p.stock===0;
    var badge = out ? '<span class="badge out">нет в наличии</span>' : (p.badge ? '<span class="badge">'+p.badge+'</span>' : '');
    return '<article class="card">'
      + '<a class="ph" href="product.html?id='+p.id+'" aria-label="'+p.name+'">'+badge+icon(p.cat)+'</a>'
      + '<div class="body">'
      + '<span class="cat">'+catName(p.cat)+'</span>'
      + '<h3><a href="product.html?id='+p.id+'">'+p.name+'</a></h3>'
      + '<div class="meta"><span class="dot'+(out?' no':'')+'"></span>'+(out?'под заказ':'в наличии')+'</div>'
      + '<div class="bottom"><span class="price">'+money(p.price)+'<small>BYN/'+p.unit+'</small></span>'
      + '<button class="add" data-add="'+p.id+'"'+(out?' disabled':'')+'>'+(out?'Нет':'В корзину')+'</button>'
      + '</div></div></article>';
  }

  /* каталог */
  function initCatalog(){
    var root=document.getElementById('catalog'); if (!root) return;
    var params=new URLSearchParams(location.search);
    var state={
      q: params.get('q')||'',
      cats: (params.get('cat')||'').split(',').filter(Boolean),
      brands: (params.get('brand')||'').split(',').filter(Boolean),
      min: params.get('min')? +params.get('min') : null,
      max: params.get('max')? +params.get('max') : null,
      stock: params.get('stock')==='1',
      sort: params.get('sort')||'pop'
    };
    var brands = Array.from(new Set(PROD.map(function(p){return p.brand;}))).sort();
    var fbox=document.getElementById('filters');
    fbox.innerHTML = '<h4>Категории</h4>' + CATS.map(function(c){
        return '<label><input type="checkbox" data-f="cat" value="'+c[0]+'"'+(state.cats.indexOf(c[0])>-1?' checked':'')+'> '+c[1]+'</label>';
      }).join('')
      + '<div class="fgroup"><h4>Цена, BYN</h4><div class="range"><input type="number" min="0" placeholder="от" id="fmin" value="'+(state.min??'')+'"><input type="number" min="0" placeholder="до" id="fmax" value="'+(state.max??'')+'"></div></div>'
      + '<div class="fgroup"><h4>Бренд</h4>'+brands.map(function(b){
        return '<label><input type="checkbox" data-f="brand" value="'+b+'"'+(state.brands.indexOf(b)>-1?' checked':'')+'> '+b+'</label>';
      }).join('')+'</div>'
      + '<div class="fgroup"><h4>Наличие</h4><label><input type="checkbox" id="fstock"'+(state.stock?' checked':'')+'> Только в наличии</label></div>'
      + '<div class="fgroup"><button class="btn btn-ghost" id="freset" style="width:100%">Сбросить фильтры</button></div>';

    function apply(){
      var list = PROD.filter(function(p){
        if (state.q){ var s=(p.name+' '+p.brand+' '+catName(p.cat)+' '+p.desc).toLowerCase(); if (s.indexOf(state.q.toLowerCase())===-1) return false; }
        if (state.cats.length && state.cats.indexOf(p.cat)===-1) return false;
        if (state.brands.length && state.brands.indexOf(p.brand)===-1) return false;
        if (state.min!=null && p.price<state.min) return false;
        if (state.max!=null && p.price>state.max) return false;
        if (state.stock && p.stock===0) return false;
        return true;
      });
      if (state.sort==='cheap') list.sort(function(a,b){return a.price-b.price;});
      else if (state.sort==='exp') list.sort(function(a,b){return b.price-a.price;});
      else if (state.sort==='name') list.sort(function(a,b){return a.name.localeCompare(b.name,'ru');});
      else list.sort(function(a,b){ return (b.badge==='хит') - (a.badge==='хит') || (b.stock>0)-(a.stock>0); });

      var grid=document.getElementById('grid');
      grid.innerHTML = list.length ? list.map(cardHTML).join('') : '';
      document.getElementById('count').textContent = list.length + ' ' + plural(list.length,'товар','товара','товаров');
      document.getElementById('empty').hidden = list.length>0;

      var u=new URLSearchParams();
      if (state.q) u.set('q',state.q);
      if (state.cats.length) u.set('cat',state.cats.join(','));
      if (state.brands.length) u.set('brand',state.brands.join(','));
      if (state.min!=null) u.set('min',state.min);
      if (state.max!=null) u.set('max',state.max);
      if (state.stock) u.set('stock','1');
      if (state.sort!=='pop') u.set('sort',state.sort);
      history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''));
    }
    fbox.addEventListener('change',function(e){
      var t=e.target;
      if (t.dataset.f==='cat'){ state.cats = Array.from(fbox.querySelectorAll('[data-f=cat]:checked')).map(function(i){return i.value;}); }
      if (t.dataset.f==='brand'){ state.brands = Array.from(fbox.querySelectorAll('[data-f=brand]:checked')).map(function(i){return i.value;}); }
      if (t.id==='fstock') state.stock=t.checked;
      apply();
    });
    fbox.addEventListener('input',function(e){
      if (e.target.id==='fmin') state.min = e.target.value===''? null : Math.max(0,+e.target.value);
      if (e.target.id==='fmax') state.max = e.target.value===''? null : Math.max(0,+e.target.value);
      apply();
    });
    document.getElementById('freset').addEventListener('click',function(){
      state={q:'',cats:[],brands:[],min:null,max:null,stock:false,sort:'pop'};
      fbox.querySelectorAll('input[type=checkbox]').forEach(function(i){ i.checked=false; });
      document.getElementById('fmin').value=''; document.getElementById('fmax').value='';
      apply();
    });
    var sortSel=document.getElementById('sort');
    if (sortSel){ sortSel.value=state.sort; sortSel.addEventListener('change',function(){ state.sort=sortSel.value; apply(); }); }
    var s=document.getElementById('q');
    if (s){ s.value=state.q; s.addEventListener('input',function(){ state.q=s.value; apply(); }); }

    /* чипы категорий над сеткой */
    var chips=document.getElementById('chips');
    if (chips){ chips.innerHTML = CATS.map(function(c){
        return '<button class="chip" data-chip="'+c[0]+'" aria-pressed="'+(state.cats.indexOf(c[0])>-1)+'">'+c[1]+'</button>';
      }).join('');
      chips.addEventListener('click',function(e){
        var b=e.target.closest('[data-chip]'); if(!b) return;
        var id=b.dataset.chip, i=state.cats.indexOf(id);
        if (i>-1) state.cats.splice(i,1); else state.cats.push(id);
        fbox.querySelectorAll('[data-f=cat]').forEach(function(inp){ inp.checked = state.cats.indexOf(inp.value)>-1; });
        chips.querySelectorAll('[data-chip]').forEach(function(x){ x.setAttribute('aria-pressed', state.cats.indexOf(x.dataset.chip)>-1); });
        apply();
      });
    }
    apply();
  }

  function plural(n,a,b,c){ var m=n%100; if (m>10&&m<20) return c; var k=n%10; if(k===1) return a; if(k>1&&k<5) return b; return c; }

  /* карточка товара */
  function initProduct(){
    var box=document.getElementById('pdp'); if(!box) return;
    var id=new URLSearchParams(location.search).get('id');
    var p=PROD.filter(function(x){return x.id===id;})[0];
    if(!p){ box.innerHTML='<div class="empty">Товар не найден. <a href="catalog.html">Вернуться в каталог</a></div>'; return; }
    document.title = p.name + ' — купить в Стройбазе';
    box.innerHTML =
      '<div><div class="crumbs"><a href="index.html">Главная</a> / <a href="catalog.html?cat='+p.cat+'">'+catName(p.cat)+'</a> / <span>'+p.name+'</span></div>'
      + '<div class="big" style="margin-top:14px">'+icon(p.cat)+'</div></div>'
      + '<div><h1>'+p.name+'</h1><div class="brand">'+p.brand+' · арт. '+p.id.toUpperCase()+'</div>'
      + '<p style="color:var(--ink2)">'+p.desc+'</p>'
      + '<div class="prow"><span class="price num">'+money(p.price)+'<small> BYN/'+p.unit+'</small></span>'
      + '<span class="meta" style="display:inline-flex;align-items:center;gap:6px"><span class="dot'+(p.stock===0?' no':'')+'"></span>'+(p.stock===0?'под заказ':'в наличии, '+p.stock+' '+p.unit)+'</span></div>'
      + '<div class="prow"><div class="qtys"><button type="button" data-dec>−</button><input id="qty" value="1" inputmode="numeric"><button type="button" data-inc>+</button></div>'
      + '<button class="btn btn-acc" id="addp"'+(p.stock===0?' disabled':'')+'>'+(p.stock===0?'Нет в наличии':'Добавить в корзину')+'</button></div>'
      + '<table class="specs">'+p.specs.map(function(s){return '<tr><td>'+s.split(' ')[0]+'</td><td>'+s+'</td></tr>';}).join('')+'</table>'
      + '<div class="info">Доставка по городу и области. Самовывоз со склада. Цены указаны за '+p.unit+'.</div></div>';
    var q=document.getElementById('qty');
    box.addEventListener('click',function(e){
      if(e.target.hasAttribute('data-inc')) q.value=Math.min(999,(+q.value||1)+1);
      if(e.target.hasAttribute('data-dec')) q.value=Math.max(1,(+q.value||1)-1);
      if(e.target.id==='addp'){ add(p.id, Math.max(1,+q.value||1)); e.target.classList.add('done'); e.target.textContent='В корзине'; setTimeout(function(){e.target.classList.remove('done'); e.target.textContent='Добавить в корзину';},1200); }
    });
  }

  /* корзина */
  function initCart(){
    var box=document.getElementById('cart'); if(!box) return;
    function render(){
      var c=cart(), ids=Object.keys(c);
      if(!ids.length){
        box.innerHTML='<div><div class="empty"><p style="margin-bottom:12px">Корзина пуста.</p><a class="btn btn-acc" href="catalog.html">Перейти в каталог</a></div></div>';
        return;
      }
      var items=ids.map(function(id){ return PROD.filter(function(p){return p.id===id;})[0]; }).filter(Boolean);
      var sum=items.reduce(function(a,p){return a+p.price*c[p.id];},0);
      var rows=items.map(function(p){
        return '<div class="ci"><div class="th">'+icon(p.cat)+'</div>'
        +'<div><b>'+p.name+'</b><div class="sub">'+p.brand+' · '+money(p.price)+' BYN/'+p.unit+'</div>'
        +'<div style="margin-top:8px"><div class="qtys"><button data-dec="'+p.id+'">−</button><input value="'+c[p.id]+'" data-q="'+p.id+'" inputmode="numeric"><button data-inc="'+p.id+'">+</button></div></div></div>'
        +'<div style="text-align:right"><div class="qsum">'+money(p.price*c[p.id])+' BYN</div><button class="rm" data-rm="'+p.id+'">удалить</button></div></div>';
      }).join('');
      document.getElementById('cart').innerHTML='';
      box.innerHTML='<div class="shop-tbl">'+rows+'</div>'
        +'<div style="margin-top:12px"><a class="btn btn-ghost" href="catalog.html">← Продолжить покупки</a></div>';
      var side=document.getElementById('summary');
      side.innerHTML='<h3 style="margin-bottom:12px">Заказ</h3>'
        +'<div class="sumrow"><span>Товаров</span><span>'+Object.keys(c).reduce(function(a,k){return a+c[k];},0)+' шт.</span></div>'
        +'<div class="sumrow"><span>Доставка</span><span>по расчёту</span></div>'
        +'<div class="sumrow total"><span>Итого</span><span class="num">'+money(sum)+' BYN</span></div>'
        +'<form id="order" novalidate><fieldset>'
        +'<label class="fld">Имя<input name="name" required autocomplete="name" placeholder="Как к вам обращаться"></label>'
        +'<label class="fld">Телефон<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="+375 __ ___-__-__"></label>'
        +'<label class="fld">Способ получения<select name="mode"><option>Доставка на объект</option><option>Самовывоз со склада</option></select></label>'
        +'<label class="fld">Комментарий<textarea name="note" rows="2" placeholder="Адрес, этаж, удобное время"></textarea></label>'
        +'<div id="err" class="err"></div>'
        +'<button class="btn btn-acc" type="submit" style="width:100%">Оформить заказ</button>'
        +'<p style="font-size:.8rem;color:var(--ink3);margin-top:8px">Кнопка соберёт заказ и откроет WhatsApp — демо-режим без сервера.</p>'
        +'</fieldset></form>';
      var form=document.getElementById('order');
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var d=new FormData(form), name=(d.get('name')||'').trim(), phone=(d.get('phone')||'').trim();
        var err=document.getElementById('err');
        if (name.length<2){ err.textContent='Укажите имя.'; return; }
        if (phone.replace(/\D/g,'').length<9){ err.textContent='Укажите телефон минимум 9 цифр.'; return; }
        var text='Заказ на сайте:\n'+items.map(function(p){return '• '+p.name+' — '+c[p.id]+' '+p.unit+' = '+money(p.price*c[p.id])+' BYN';}).join('\n')
          +'\nИтого: '+money(sum)+' BYN\nИмя: '+name+'\nТелефон: '+phone+'\n'+d.get('mode')+(d.get('note')?'\n'+d.get('note'):'');
        var box2=document.getElementById('summary');
        box2.innerHTML='<div class="done"><b>Заказ собран</b><p style="font-size:.9rem;color:var(--ink2)">Скопируйте текст и отправьте менеджеру — данные никуда не ушли автоматически.</p>'
          +'<textarea readonly rows="8" style="width:100%;margin-top:10px;border:1px solid var(--line);border-radius:8px;padding:10px;font-family:inherit;font-size:.85rem" id="txt">'+text+'</textarea>'
          +'<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-acc" id="copy">Скопировать</button>'
          +'<a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(text)+'">Отправить в WhatsApp</a></div></div>';
        document.getElementById('copy').addEventListener('click',function(){
          var t=document.getElementById('txt'); t.select(); document.execCommand('copy'); toast('Скопировано');
        });
      });
    }
    box.addEventListener('click',function(e){
      var t=e.target;
      if(t.dataset.inc){ var id=t.dataset.inc; setQty(id, cart()[id]+1); render(); }
      if(t.dataset.dec){ var id2=t.dataset.dec; setQty(id2, cart()[id2]-1); render(); }
      if(t.dataset.rm){ remove(t.dataset.rm); render(); }
    });
    box.addEventListener('input',function(e){
      if(e.target.dataset.q){ var id=e.target.dataset.q; var v=Math.max(0,parseInt(e.target.value||'0',10)||0); if(v!==cart()[id]){ setQty(id,v); if(v===0) render(); } }
    });
    render();
    document.addEventListener('cart:changed', render);
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-add]'); if(!b) return;
    add(b.dataset.add,1);
    b.classList.add('done'); b.textContent='В корзине';
    setTimeout(function(){ b.classList.remove('done'); b.textContent='В корзину'; },1200);
  });

  document.addEventListener('DOMContentLoaded',function(){
    syncBadges();
    initCatalog(); initProduct(); initCart();
    var form=document.getElementById('searchform');
    if(form) form.addEventListener('submit',function(e){ e.preventDefault(); var v=document.getElementById('q').value.trim(); location.href='catalog.html'+(v?'?q='+encodeURIComponent(v):''); });
  });
})();
