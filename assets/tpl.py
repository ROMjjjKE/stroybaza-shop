import sys
head=open('assets/head.inc',encoding='utf-8').read()
hdr=open('assets/hdr.inc',encoding='utf-8').read()
ftr=open('assets/ftr.inc',encoding='utf-8').read()
def page(fn, title, desc, body):
    html=f"""<!DOCTYPE html>
<html lang="ru">
<head>
{head}
<title>{title}</title>
<meta name="description" content="{desc}">
</head>
<body>
{hdr}
<main>
{body}
</main>
{ftr}
</body>
</html>
"""
    open(fn,'w',encoding='utf-8').write(html)
    print(fn, len(html))

page('catalog.html',
 'Каталог стройматериалов — фильтры и наличие | Стройбаза',
 'Каталог стройматериалов с фильтрами по категории, цене, бренду и наличию. Кирпич, смеси, пиломатериалы, металл, кровля, отделка.',
 '''<div class="wrap"><div class="crumbs"><a href="index.html">Главная</a> / <span>Каталог</span></div></div>
<div class="wrap"><div class="catalog">
  <aside class="filters" id="filters"></aside>
  <div>
    <div class="chips" id="chips"></div>
    <div class="toolbar">
      <span class="count" id="count">—</span>
      <select id="sort" aria-label="Сортировка">
        <option value="pop">Сначала популярные</option>
        <option value="cheap">Сначала дешёвые</option>
        <option value="exp">Сначала дорогие</option>
        <option value="name">По названию</option>
      </select>
    </div>
    <div class="grid" id="grid"></div>
    <div class="empty" id="empty" hidden><p style="margin-bottom:10px">По этим фильтрам ничего не нашлось.</p><button class="btn btn-ghost" onclick="document.getElementById('freset').click()">Сбросить фильтры</button></div>
  </div>
</div></div>''')

page('product.html',
 'Товар — Стройбаза',
 'Карточка товара: цена, наличие, характеристики, добавление в корзину.',
 '''<div class="wrap"><div class="pdp" id="pdp"></div></div>''')

page('cart.html',
 'Корзина и оформление заказа | Стройбаза',
 'Корзина: состав заказа, количество, сумма, оформление с проверкой контактов.',
 '''<div class="wrap"><div class="crumbs"><a href="index.html">Главная</a> / <span>Корзина</span></div></div>
<div class="wrap"><div class="cart">
  <div id="cart"></div>
  <aside class="summary" id="summary"></aside>
</div></div>''')

page('delivery.html',
 'Доставка и оплата | Стройбаза',
 'Условия доставки стройматериалов по городу и области, самовывоз со склада, оплата наличными и по счёту.',
 '''<div class="wrap"><div class="doc">
  <div class="crumbs"><a href="index.html">Главная</a> / <span>Доставка и оплата</span></div>
  <h1 style="margin-top:12px">Доставка и оплата</h1>
  <p>Отгружаем со склада в день заказа, если позиция в наличии. Крупные партии — по согласованию, чтобы не задерживать разгрузку на объекте.</p>
  <h2>Доставка</h2>
  <ul>
    <li>По городу — в течение дня, окно согласовываем по телефону.</li>
    <li>По области — от одного дня, стоимость считается по расстоянию и весу.</li>
    <li>Самовывоз со склада — бесплатно, нужен только номер заказа.</li>
    <li>Разгрузка на объекте — по договорённости; манипулятор и грузчики заказываются заранее.</li>
  </ul>
  <h2>Оплата</h2>
  <ul>
    <li>Наличными при получении.</li>
    <li>Безналичный расчёт для организаций, счёт и документы по запросу.</li>
    <li>Стоимость доставки не входит в цену товара и считается отдельно.</li>
  </ul>
  <h2>Возврат и вес</h2>
  <p>Сыпучие материалы отгружаются по весу и объёму — расхождение до 2% считается нормой и не является браком. Остатки по количеству на складе уточняйте перед оплатой.</p>
  <p style="font-size:.9rem;color:var(--ink3)">Это демо-магазин: условия написаны как образец текста, который подставляется под конкретного клиента.</p>
</div></div>''')

page('contacts.html',
 'Контакты | Стройбаза',
 'Телефон, адрес склада и время работы магазина стройматериалов.',
 '''<div class="wrap"><div class="doc">
  <div class="crumbs"><a href="index.html">Главная</a> / <span>Контакты</span></div>
  <h1 style="margin-top:12px">Контакты</h1>
  <div class="contact-grid">
    <div><b>Телефон</b><a href="tel:+375290000000">+375 29 000-00-00</a></div>
    <div><b>Почта</b><a href="mailto:zakaz@stroybaza.example">zakaz@stroybaza.example</a></div>
    <div><b>Склад</b>Минск, ул. Примерная, 1</div>
    <div><b>Часы работы</b>Пн–Сб 8:00–19:00, Вс — выходной</div>
  </div>
  <h2>Как заказать</h2>
  <p>Соберите заказ в корзине или позвоните. Менеджер подтвердит наличие, назовёт цену доставки и согласует время отгрузки.</p>
  <h2>Реквизиты</h2>
  <p>Заполняются под клиента: наименование, УНП, адрес, банк. В демо-версии поля оставлены пустыми намеренно.</p>
</div></div>''')
