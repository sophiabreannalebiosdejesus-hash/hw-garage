
const products = [
  {
    id: 1,
    name: "Nissan Skyline GT-R R34",
    category: "Sports",
    price: 249,
    description: "A legendary Japanese sports car with an iconic design.",
    image: "skyline.png",
    badge: "BEST SELLER"
  },
  {
    id: 2,
    name: "Toyota Supra MK4",
    category: "Sports",
    price: 229,
    description: "A classic Japanese performance car loved by collectors.",
    image: "toyota.png",
    badge: "POPULAR"
  },
  {
    id: 3,
    name: "Ford Mustang GT",
    category: "Muscle",
    price: 199,
    description: "An American muscle car with aggressive styling.",
    image: "mustang.png",
    badge: "HOT PICK"
  },
  {
    id: 4,
    name: "Dodge Challenger SRT",
    category: "Muscle",
    price: 219,
    description: "A powerful muscle car with a bold racing appearance.",
    image: "challenger.png",
    badge: "NEW"
  },
  {
    id: 5,
    name: "Volkswagen Beetle",
    category: "Classic",
    price: 179,
    description: "A timeless classic with a charming vintage design.",
    image: "volkswagen.png",
    badge: "CLASSIC"
  },
  {
    id: 6,
    name: "Porsche 911 Carrera",
    category: "Classic",
    price: 259,
    description: "An iconic European sports car with timeless styling.",
    image: "porche.png",
    badge: "PREMIUM"
  },
  {
    id: 7,
    name: "Ford F-150 Raptor",
    category: "Trucks",
    price: 239,
    description: "A rugged off-road pickup built for adventure.",
    image: "ford.png",
    badge: "OFF-ROAD"
  },
  {
    id: 8,
    name: "Chevrolet Silverado",
    category: "Trucks",
    price: 209,
    description: "A bold American pickup with a tough exterior.",
    image: "chevrolet.png",
    badge: "COLLECTIBLE"
  }
];

let cart = [];
let activeCategory = "All";
let searchQuery = "";
let sortMode = "featured";
let toastTimer;
let lastFocusedElement = null;

const productGrid = document.getElementById("productGrid");
const resultCount = document.getElementById("resultCount");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filters = document.getElementById("filters");

const cartOpen = document.getElementById("cartOpen");
const cartClose = document.getElementById("cartClose");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutWrap = document.getElementById("checkoutWrap");
const checkoutClose = document.getElementById("checkoutClose");
const orderForm = document.getElementById("orderForm");
const orderSummary = document.getElementById("orderSummary");
const orderTotal = document.getElementById("orderTotal");
const formError = document.getElementById("formError");

const confirmationWrap = document.getElementById("confirmationWrap");
const confirmationMessage = document.getElementById("confirmationMessage");
const doneBtn = document.getElementById("doneBtn");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const toast = document.getElementById("toast");

function formatPrice(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function getProduct(id) {
  return products.find(product => product.id === id);
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = getProduct(item.id);
    return total + product.price * item.quantity;
  }, 0);
}

function getCartQuantity() {
  return cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function renderProducts() {
  let filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const searchableText =
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase();

    const matchesSearch = searchableText.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  if (sortMode === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortMode === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortMode === "name") {
    filteredProducts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  productGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">

      <div class="product-image">
        <span class="product-badge">
          ${product.badge}
        </span>

        <img
          src="${product.image}"
          alt="${product.name} collectible die-cast car"
          loading="lazy"
        >
      </div>

      <div class="product-info">
        <p class="product-category">
          ${product.category}
        </p>

        <h3>${product.name}</h3>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="product-bottom">
          <span class="product-price">
            ${formatPrice(product.price)}
          </span>

          <button
            class="add-cart"
            type="button"
            data-id="${product.id}"
            aria-label="Add ${product.name} to cart"
          >
            + Add to Cart
          </button>
        </div>
      </div>

    </article>
  `).join("");

  resultCount.textContent =
    `${filteredProducts.length} ${
      filteredProducts.length === 1 ? "car" : "cars"
    }`;

  noResults.hidden = filteredProducts.length > 0;
}

function addToCart(id) {
  const product = getProduct(id);

  if (!product) return;

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: id,
      quantity: 1
    });
  }

  updateCart();
  showToast(`${product.name} added to cart!`);
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== id);
  }

  updateCart();
}

function removeFromCart(id) {
  const product = getProduct(id);

  cart = cart.filter(item => item.id !== id);

  updateCart();

  if (product) {
    showToast(`${product.name} removed from cart.`);
  }
}

function updateCart() {
  cartCount.textContent = getCartQuantity();
  cartTotal.textContent = formatPrice(getCartTotal());

  checkoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <span aria-hidden="true">🛒</span>
        <h3>Your cart is empty</h3>
        <p>
          Explore our collection and add your favorite rides.
        </p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    const subtotal = product.price * item.quantity;

    return `
      <div class="cart-item">

        <div class="cart-item-image">
          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
          >
        </div>

        <div class="cart-item-info">
          <h3>${product.name}</h3>

          <p class="cart-item-price">
            ${formatPrice(product.price)} each
          </p>

          <p class="muted">
            Subtotal: ${formatPrice(subtotal)}
          </p>

          <div class="cart-item-controls">

            <button
              class="qty-btn"
              data-action="decrease"
              data-id="${product.id}"
              aria-label="Decrease ${product.name} quantity"
            >
              −
            </button>

            <span class="qty-value">
              ${item.quantity}
            </span>

            <button
              class="qty-btn"
              data-action="increase"
              data-id="${product.id}"
              aria-label="Increase ${product.name} quantity"
            >
              +
            </button>

            <button
              class="remove-btn"
              data-action="remove"
              data-id="${product.id}"
            >
              Remove
            </button>

          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openCart() {
  lastFocusedElement = document.activeElement;

  overlay.hidden = false;
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");

  document.body.classList.add("no-scroll");
  cartClose.focus();
}

function closeCart(restoreFocus = true) {
  if (cartDrawer.contains(document.activeElement)) {
    cartOpen.focus();
  }

  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;

  document.body.classList.remove("no-scroll");

  if (restoreFocus && lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function renderOrderSummary() {
  orderSummary.innerHTML = cart.map(item => {
    const product = getProduct(item.id);

    return `
      <div class="summary-item">
        <span>
          ${product.name} × ${item.quantity}
        </span>

        <strong>
          ${formatPrice(product.price * item.quantity)}
        </strong>
      </div>
    `;
  }).join("");

  orderTotal.textContent = formatPrice(getCartTotal());
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("Add products to your cart first.");
    return;
  }

  closeCart(false);

  renderOrderSummary();
  formError.textContent = "";
  orderForm.reset();

  checkoutWrap.hidden = false;
  document.body.classList.add("no-scroll");

  checkoutClose.focus();
}

function closeCheckout() {
  checkoutWrap.hidden = true;
  document.body.classList.remove("no-scroll");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  } else {
    cartOpen.focus();
  }
}

function placeOrder(event) {
  event.preventDefault();

  const customerName =
    document.getElementById("customerName").value.trim();

  const customerEmail =
    document.getElementById("customerEmail").value.trim();

  const fulfillment =
    document.getElementById("fulfillment").value;

  const demoAgree =
    document.getElementById("demoAgree").checked;

  formError.textContent = "";

  if (cart.length === 0) {
    formError.textContent = "Your cart is empty.";
    return;
  }

  if (!orderForm.checkValidity()) {
    formError.textContent =
      "Please complete all required fields correctly.";

    orderForm.reportValidity();
    return;
  }

  if (customerName.length < 2) {
    formError.textContent =
      "Please enter a name with at least 2 characters.";
    return;
  }

  if (!customerEmail.includes("@")) {
    formError.textContent =
      "Please enter a valid sample email.";
    return;
  }

  if (!fulfillment) {
    formError.textContent =
      "Please select an order method.";
    return;
  }

  if (!demoAgree) {
    formError.textContent =
      "Please confirm that this is a simulated order.";
    return;
  }

  const total = getCartTotal();
  const quantity = getCartQuantity();

  checkoutWrap.hidden = true;
  confirmationWrap.hidden = false;

  confirmationMessage.textContent =
    `Thank you, ${customerName}! Your simulated order ` +
    `for ${quantity} item(s), totaling ${formatPrice(total)}, ` +
    `has been confirmed. Order method: ${fulfillment}.`;

  cart = [];
  updateCart();
  orderForm.reset();

  document.body.classList.add("no-scroll");
  doneBtn.focus();
}

function closeConfirmation() {
  confirmationWrap.hidden = true;
  document.body.classList.remove("no-scroll");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  } else {
    cartOpen.focus();
  }
}

function toggleMenu() {
  const isOpen = mainNav.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
}

function closeMenu() {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}

searchInput.addEventListener("input", event => {
  searchQuery = event.target.value.trim().toLowerCase();
  renderProducts();
});

sortSelect.addEventListener("change", event => {
  sortMode = event.target.value;
  renderProducts();
});

filters.addEventListener("click", event => {
  const button = event.target.closest(".filter");

  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".filter").forEach(filter => {
    const isActive = filter === button;

    filter.classList.toggle("active", isActive);
    filter.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts();
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest(".add-cart");

  if (!button) return;

  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") {
    changeQuantity(id, 1);
  }

  if (action === "decrease") {
    changeQuantity(id, -1);
  }

  if (action === "remove") {
    removeFromCart(id);
  }
});

cartOpen.addEventListener("click", openCart);

cartClose.addEventListener("click", () => {
  closeCart();
});

overlay.addEventListener("click", () => {
  closeCart();
});

checkoutBtn.addEventListener("click", openCheckout);

checkoutClose.addEventListener("click", closeCheckout);

orderForm.addEventListener("submit", placeOrder);

doneBtn.addEventListener("click", closeConfirmation);

menuToggle.addEventListener("click", toggleMenu);

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (!confirmationWrap.hidden) {
    closeConfirmation();
  } else if (!checkoutWrap.hidden) {
    closeCheckout();
  } else if (cartDrawer.classList.contains("open")) {
    closeCart();
  } else {
    closeMenu();
  }
});

renderProducts();
updateCart();
