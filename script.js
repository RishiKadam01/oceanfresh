document.addEventListener("DOMContentLoaded", () => {
  const CHECKOUT_MODE = "form"; // "form" or "demo"

  const cartCount = document.getElementById("cartCount");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartSidebar = document.getElementById("cartSidebar");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartButton = document.getElementById("cartButton");
  const closeCart = document.getElementById("closeCart");
  const checkoutBtn = document.querySelector("#cartSidebar button.w-full");

  // Modal elements
  const checkoutModal = document.getElementById("checkoutModal");
  const orderSummary = document.getElementById("orderSummary");
  const checkoutTotal = document.getElementById("checkoutTotal");
  const confirmOrder = document.getElementById("confirmOrder");
  const cancelCheckout = document.getElementById("cancelCheckout");

  let cart = [];

  // Add item to cart
  addToCartButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      const name = productCard.querySelector("h3").innerText;
      const priceText = productCard.querySelector("span").innerText.replace("₹","").replace("/kg","");
      const price = parseInt(priceText);

      cart.push({ name, price });
      updateCartUI();
    });
  });

  // Update cart UI
  function updateCartUI() {
    cartCount.textContent = cart.length;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      const div = document.createElement("div");
      div.classList.add("flex", "justify-between", "items-center", "border-b", "pb-2");
      div.innerHTML = `
        <span>${item.name}</span>
        <span>₹${item.price}</span>
        <button class="text-red-500 remove-item" data-index="${index}">Remove</button>
      `;
      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total;

    // Remove item functionality
    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        cart.splice(index, 1);
        updateCartUI();
      });
    });
  }

  // Open/Close Cart
  cartButton.addEventListener("click", () => cartSidebar.classList.remove("translate-x-full"));
  closeCart.addEventListener("click", () => cartSidebar.classList.add("translate-x-full"));

  // Checkout button
  checkoutBtn.addEventListener("click", () => {
    if(cart.length === 0){
      alert("Your cart is empty!");
      return;
    }

    if (CHECKOUT_MODE === "demo") {
      alert("✅ Thank you for your order! Your seafood will be delivered soon.");
      cart = [];
      updateCartUI();
      cartSidebar.classList.add("translate-x-full");
    } else {
      // Fill order summary
      orderSummary.innerHTML = "";
      let total = 0;
      cart.forEach(item => {
        total += item.price;
        const p = document.createElement("p");
        p.textContent = `${item.name} - ₹${item.price}`;
        orderSummary.appendChild(p);
      });
      checkoutTotal.textContent = total;

      checkoutModal.classList.remove("hidden");
    }
  });

  // ✅ Confirm Order (Now saves to Node.js + MySQL)
  confirmOrder.addEventListener("click", () => {
    const name = document.getElementById("customerName").value;
    const address = document.getElementById("customerAddress").value;
    const phone = document.getElementById("customerPhone").value;

    if (!name || !address || !phone) {
      alert("⚠️ Please fill all fields before confirming.");
      return;
    }

    const orderData = {
      name,
      address,
      phone,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    // Send to Node.js backend
    fetch("http://localhost:3000/save-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("✅ Order placed successfully!");
        cart = [];
        updateCartUI();
        checkoutModal.classList.add("hidden");
        cartSidebar.classList.add("translate-x-full");
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("⚠️ Failed to place order. Please try again.");
    });
  });

  // Cancel Checkout
  cancelCheckout.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
  });
});
