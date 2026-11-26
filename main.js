// ==============================
// Практична 6. DOM: товари й кошик
// ==============================

// ---------- Дані ----------
const products = [
  { id: 1, name: "Ноутбук Lenovo", price: 25000, category: "електроніка", stock: 5 },
  { id: 2, name: "Смартфон Samsung", price: 18000, category: "електроніка", stock: 10 },
  { id: 3, name: "Навушники Sony", price: 3500, category: "аксесуари", stock: 0 },
  { id: 4, name: "Клавіатура Logitech", price: 1800, category: "аксесуари", stock: 15 },
  { id: 5, name: "Миша Razer", price: 2200, category: "аксесуари", stock: 0 },
  { id: 6, name: "Монітор Dell", price: 9500, category: "електроніка", stock: 7 },
  { id: 7, name: "Рюкзак Xiaomi", price: 1200, category: "одяг", stock: 20 },
  { id: 8, name: "Футболка Nike", price: 900, category: "одяг", stock: 30 },
];
let nextId = 9;
let activeCategory = "all";
let cart = []; // елементи виду { id, qty }
let newProductId = null; // щоб підсвітити щойно доданий товар

// ---------- Пошук елементів (Практична 1) ----------
const productList = document.querySelector("#product-list");
const emptyProducts = document.querySelector("#empty-products");
const totalValueEl = document.querySelector("#total-value");
const filtersEl = document.querySelector("#filters");
const categoryOptions = document.querySelector("#category-options");

const cartList = document.querySelector("#cart-list");
const cartEmpty = document.querySelector("#cart-empty");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const cartMessage = document.querySelector("#cart-message");

const form = document.querySelector("#product-form");
const formError = document.querySelector("#form-error");

// ---------- Допоміжні функції ----------
function formatPrice(n) {
  return n.toLocaleString("uk-UA") + " грн";
}

function findProduct(id) {
  return products.find((p) => p.id === id);
}

function getCategories() {
  const list = [];
  for (const p of products) {
    if (!list.includes(p.category)) list.push(p.category);
  }
  return list;
}

function showMessage(el, text) {
  el.textContent = text;
  el.classList.remove("hidden");
}

function hideMessage(el) {
  el.textContent = "";
  el.classList.add("hidden");
}

// ---------- Практична 1: картки товарів ----------
function createCard(product) {
  const card = document.createElement("article");
  card.className = "card";
  if (product.stock === 0) card.classList.add("card--out");
  if (product.id === newProductId) card.classList.add("card--new");

  const name = document.createElement("h3");
  name.className = "card-name";
  name.textContent = product.name;

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = product.category;

  const price = document.createElement("p");
  price.className = "card-price";
  price.textContent = formatPrice(product.price);

  const stock = document.createElement("p");
  stock.className = "card-stock";
  stock.textContent = `На складі: ${product.stock}`;

  const badge = document.createElement("p");
  badge.className = "card-badge";
  badge.textContent = "Немає в наявності";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn";
  button.dataset.action = "add";
  button.dataset.id = product.id;
  button.textContent = "Додати в кошик";
  button.disabled = product.stock === 0;

  card.append(name, category, price, stock, badge, button);
  return card;
}

function renderProducts() {
  productList.innerHTML = "";
  const visible = products.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );
  for (const product of visible) {
    productList.append(createCard(product));
  }
  emptyProducts.classList.toggle("hidden", visible.length > 0);
}

function renderTotalValue() {
  let total = 0;
  for (const p of products) {
    total += p.price * p.stock;
  }
  totalValueEl.textContent = formatPrice(total);
}

function renderFilters() {
  filtersEl.innerHTML = "";
  const names = ["all", ...getCategories()];
  for (const name of names) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.dataset.category = name;
    btn.textContent = name === "all" ? "Усі" : name;
    btn.classList.toggle("active", name === activeCategory);
    filtersEl.append(btn);
  }

  categoryOptions.innerHTML = "";
  for (const name of getCategories()) {
    const option = document.createElement("option");
    option.value = name;
    categoryOptions.append(option);
  }
}

filtersEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".filter-btn");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  renderFilters();
  renderProducts();
});

function renderCart() {
  cartList.innerHTML = "";
  let count = 0;
  let sum = 0;

  for (const item of cart) {
    const product = findProduct(item.id);
    count += item.qty;
    sum += product.price * item.qty;

    const li = document.createElement("li");
    li.className = "cart-item";

    const name = document.createElement("span");
    name.className = "cart-item-name";
    name.textContent = product.name;

    const lineSum = document.createElement("span");
    lineSum.className = "cart-item-sum";
    lineSum.textContent = formatPrice(product.price * item.qty);

    const info = document.createElement("span");
    info.className = "cart-item-info";
    info.textContent = `${item.qty} × ${formatPrice(product.price)}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.dataset.action = "remove";
    remove.dataset.id = product.id;
    remove.textContent = "Видалити";

    li.append(name, lineSum, info, remove);
    cartList.append(li);
  }

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(sum);
  cartEmpty.classList.toggle("hidden", cart.length > 0);
}

function addToCart(id) {
  const product = findProduct(id);
  if (!product || product.stock === 0) return;

  const item = cart.find((i) => i.id === id);
  if (item) {
    if (item.qty >= product.stock) {
      showMessage(cartMessage, `Більше «${product.name}» на складі немає.`);
      return;
    }
    item.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  hideMessage(cartMessage);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  hideMessage(cartMessage);
  renderCart();
}

productList.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action='add']");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

cartList.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action='remove']");
  if (!btn) return;
  removeFromCart(Number(btn.dataset.id));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = form.querySelector("#f-name").value.trim();
  const price = Number(form.querySelector("#f-price").value);
  const category = form.querySelector("#f-category").value.trim().toLowerCase();
  const stockValue = form.querySelector("#f-stock").value;
  const stock = Number(stockValue);

  if (name === "" || category === "") {
    showMessage(formError, "Заповни назву й категорію.");
    return;
  }
  if (!(price > 0)) {
    showMessage(formError, "Ціна має бути більшою за 0.");
    return;
  }
  if (stockValue === "" || stock < 0 || !Number.isInteger(stock)) {
    showMessage(formError, "Кількість має бути цілим числом від 0.");
    return;
  }

  hideMessage(formError);
  const product = { id: nextId++, name, price, category, stock };
  products.push(product);
  newProductId = product.id;

  form.reset();
  renderFilters();
  renderProducts();
  renderTotalValue();
});


renderFilters();
renderProducts();
renderTotalValue();
renderCart();
