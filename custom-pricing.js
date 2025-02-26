// Wait for the DOM to fully load before executing the script
document.addEventListener("DOMContentLoaded", async () => {
  // Select various elements from the DOM
  const quantityInput = document.querySelector(".quantity__input");
  const plusButton = document.querySelector(".plus_button");
  const minusButton = document.querySelector(".minus_button");
  const customPriceDisplay = document.querySelector(".custom-price");
  const productSKU = document.querySelector(".price-item__custom")?.getAttribute("data-product-sku");
  const addToCartButton = document.querySelector(".product-form__submit");

  // Ensure essential elements are present before proceeding
  if (!quantityInput || !productSKU || !addToCartButton) return;

  // Decode the minimum quantity from a base64 encoded attribute
  const encodedMin = quantityInput.getAttribute("data-encoded-min");
  const stdPk = encodedMin ? parseInt(atob(encodedMin)) || 1 : 1;

  // Initialize the current quantity based on the input value or the standard pack size
  let currentQuantity = parseInt(quantityInput.value) || stdPk;

  // Variable to store fetched pricing data
  let pricingData = null;

  // Function to fetch pricing data from an external API
  const fetchPricingData = async () => {
    try {
      const apiUrl = "https://api.jsonbin.io/v3/b/67adfe72e41b4d34e48c5a86";
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      return data.record;
    } catch (error) {
      console.error("Error fetching pricing data", error);
      customPriceDisplay.innerText = "Error fetching price data.";
      return null;
    }
  };

  // Fetch pricing data and update the price based on the current quantity
  fetchPricingData().then(data => {
    if (data) {
      pricingData = data;
      updatePrice(currentQuantity);
    }
  });

  // Function to update the displayed price based on the quantity
  const updatePrice = (quantity) => {
    if (!pricingData) {
      console.error("Pricing data not available.");
      customPriceDisplay.innerText = "Price data not available.";
      return;
    }

    // Find the matching product based on SKU
    const matchedProducts = pricingData.filter(item => String(item.sku).trim() === String(productSKU).trim());
    if (!matchedProducts.length) {
      console.error("No pricing data found for this SKU or incorrect format.", matchedProducts);
      customPriceDisplay.innerText = "Price not available.";
      return;
    }

    // Determine the applicable price based on quantity breaks
    let applicablePrice = matchedProducts[0].priceBreak;
    for (let product of matchedProducts) {
      if (quantity >= product.qtyBreak) {
        applicablePrice = product.priceBreak;
      }
    }

    // Update the displayed price
    customPriceDisplay.innerText = `$${applicablePrice.toFixed(2)}`;
  };

  // Function to update the minimum order quantity (MOQ)
  const updateMOQ = () => {
    const moq = parseInt(quantityInput.getAttribute("data-min"), 10) || stdPk;
    quantityInput.min = moq;

    if (!quantityInput.value || parseInt(quantityInput.value) < moq) {
      quantityInput.value = moq;
      currentQuantity = moq;
    }
  };

  // Debounce function to delay the MOQ update
  let debounceTimeout;
  const debounceUpdateMOQ = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(updateMOQ, 200);
  };

  // Add event listener to update MOQ on input change
  quantityInput.addEventListener("input", debounceUpdateMOQ);
  updateMOQ();

  // Function to update the quantity and price
  const updateQuantity = (newQuantity) => {
    if (newQuantity < stdPk || (newQuantity - stdPk) % stdPk !== 0) {
      newQuantity = stdPk;
    }

    currentQuantity = newQuantity;
    quantityInput.value = currentQuantity;
    quantityInput.setAttribute('value', currentQuantity);
    updatePrice(currentQuantity);
  };

  // Add event listener to update quantity on input change
  quantityInput.addEventListener("change", (event) => {
    updateQuantity(parseInt(event.target.value));
  });

  // Add event listener to increase quantity on plus button click
  plusButton?.addEventListener("click", () => {
    updateQuantity(currentQuantity + stdPk);
  });

  // Add event listener to decrease quantity on minus button click
  minusButton?.addEventListener("click", () => {
    if (currentQuantity > stdPk) {
      updateQuantity(currentQuantity - stdPk);
    }
  });

  // Add event listener to validate quantity before adding to cart
  addToCartButton.addEventListener("click", async (event) => {
    const moq = parseInt(quantityInput.getAttribute("data-min"), 10) || stdPk;
    const quantity = parseInt(quantityInput.value, 10);

    if (quantity < moq) {
      event.preventDefault();
      addToCartButton.classList.add("shake", "error-border");
      setTimeout(() => {
        addToCartButton.classList.remove("shake", "error-border");
      }, 500);
      return;
    }
  });
});