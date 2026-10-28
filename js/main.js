const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
const cartDialog = document.querySelector("#cart-dialog");
const cartOpen = document.querySelector("#cart-open");
const cartClose = document.querySelector("#cart-close");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const toast = document.querySelector("#toast");
const catalogNote = document.querySelector("#catalog-note");
const checkoutButton = document.querySelector("#checkout-button");

const cart = new Map();
const products = new Map(
  [...document.querySelectorAll(".product-card")].map((card) => [
    card.dataset.id,
    { id: card.dataset.id, name: card.dataset.name, price: Number(card.dataset.price) }
  ])
);
let toastTimeout;

const money = (value) => new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0
}).format(value);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function updateCart() {
  const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  const total = [...cart.entries()].reduce((sum, [id, quantity]) => {
    return sum + products.get(id).price * quantity;
  }, 0);

  cartCount.textContent = count;
  cartTotal.textContent = money(total);

  if (cart.size === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Пока здесь пусто. Добавьте что-нибудь красивое!</p>';
    return;
  }

  cartItems.replaceChildren();
  for (const [id, quantity] of cart) {
    const product = products.get(id);
    const line = document.createElement("div");
    line.className = "cart-line";

    const description = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = product.name;
    const price = document.createElement("p");
    price.textContent = `${money(product.price)} за шт.`;
    description.append(title, price);

    const controls = document.createElement("div");
    controls.className = "cart-line__controls";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Уменьшить количество: ${product.name}`);
    minus.addEventListener("click", () => changeQuantity(id, -1));
    const amount = document.createElement("span");
    amount.textContent = quantity;
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Увеличить количество: ${product.name}`);
    plus.addEventListener("click", () => changeQuantity(id, 1));
    controls.append(minus, amount, plus);
    line.append(description, controls);
    cartItems.append(line);
  }
}

function changeQuantity(id, delta) {
  const next = (cart.get(id) || 0) + delta;
  if (next <= 0) cart.delete(id);
  else cart.set(id, next);
  updateCart();
}

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  });
});

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    changeQuantity(card.dataset.id, 1);
    catalogNote.textContent = `${card.dataset.name} добавлен в корзину.`;
    showToast(`${card.dataset.name} добавлен в корзину`);
  });
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const isFavorite = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isFavorite));
    button.textContent = isFavorite ? "♡" : "♥";
    const name = button.closest(".product-card").dataset.name;
    showToast(isFavorite ? `${name} удалён из избранного` : `${name} добавлен в избранное`);
  });
});

cartOpen.addEventListener("click", () => {
  updateCart();
  cartDialog.showModal();
  document.body.classList.add("dialog-open");
});

function closeCart() {
  cartDialog.close();
  document.body.classList.remove("dialog-open");
}

cartClose.addEventListener("click", closeCart);
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) closeCart();
});
cartDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

checkoutButton.addEventListener("click", () => {
  if (cart.size === 0) {
    showToast("Сначала добавьте товары в корзину");
    return;
  }
  showToast("Спасибо! Это демонстрационная корзина учебного проекта.");
  cart.clear();
  updateCart();
  closeCart();
});

updateCart();
