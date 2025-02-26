// Check if 'product-form' custom element is already defined
if (!customElements.get('product-form')) {
  // Define 'product-form' custom element
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        // Select the form element within the custom element
        this.form = this.querySelector('form');
        // Enable the variant ID input field
        this.variantIdInput.disabled = false;
        // Add event listener for form submission
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        // Select the cart notification or cart drawer element
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        // Select the submit button and its text span
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        // Select product title and image elements
        const prodTitle = document.querySelector('#custom_price');
        const prodImg = document.querySelector('#custom_price');
        // Set ARIA attribute for accessibility if cart drawer is present
        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
        // Determine if error messages should be hidden
        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      // Handler for form submission
      onSubmitHandler = async (evt) => {
        evt.preventDefault();

        // Create a FormData object to hold form data
        const formData = new FormData();
        let sections = [];
        let sections_url = window.location.pathname;

        // Get custom pricing URL from global data
        let cartApiUrl = '';
        if (window.globalData && window.globalData.customPricingUrl) {
          cartApiUrl = window.globalData.customPricingUrl;
        } else {
          console.error("Custom pricing URL is not set in globalData.");
        }

        let pricingData = null;

        // Function to fetch pricing data from an external API
        const fetchPricingData = async () => {
          try {
            const apiUrl = cartApiUrl;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Network response was not ok.");
            const data = await response.json();
            return data.record;
          } catch (error) {
            console.error("Error fetching pricing data", error);
            return null;
          }
        };

        // Fetch pricing data
        pricingData = await fetchPricingData();

        // Handle case where pricing data is not available
        if (!pricingData) {
          console.error("Pricing data is not available.");
          this.submitButton.removeAttribute('aria-disabled');
          this.submitButton.classList.remove('loading');
          this.querySelector('.loading__spinner').classList.add('hidden');
          return;
        }

        // Prevent multiple submissions
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        // Handle error messages
        this.handleErrorMessage();

        // Disable submit button and show loading spinner
        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        // Select the quantity input element
        const quantityInput = document.querySelector('input[name="quantity"].quantity__input');

        // Handle case where quantity input is not found
        if (!quantityInput) {
          console.error("Quantity input not found.");
          this.submitButton.removeAttribute('aria-disabled');
          this.submitButton.classList.remove('loading');
          this.querySelector('.loading__spinner').classList.add('hidden');
          return;
        }

        // Get minimum order quantity (MOQ) and current quantity
        const moq = parseInt(quantityInput.getAttribute("data-min"), 10) || 1;
        const quantity = parseInt(quantityInput.value, 10);

        // Validate quantity against MOQ
        if (quantity < moq) {
          this.submitButton.classList.add("shake", "error-border");
          setTimeout(() => {
            this.submitButton.classList.remove("shake", "error-border");
          }, 500);
          this.submitButton.removeAttribute('aria-disabled');
          this.submitButton.classList.remove('loading');
          return;
        }

        // Select the variant ID input element
        const variantIdInput = this.form.querySelector('input[name="id"][data-sku][data-title][data-img-link]');
        if (!variantIdInput) {
          console.error("Variant ID input not found.");
          return;
        }

        // Find matching products based on SKU
        const matchedProducts = pricingData.filter(item => String(item.sku).trim() === String(variantIdInput.dataset.sku).trim());

        // Handle case where no matching products are found
        if (matchedProducts.length === 0) {
          console.error("No pricing data found for this SKU.", matchedProducts);
          return;
        }

        // Extract prices from matched products
        const _prices = matchedProducts.flatMap(product => 
          Array.isArray(product.prices)
            ? product.prices.map(price => ({
                qtyBreak: price.qtyBreak,
                priceBreak: price.priceBreak,
              }))
            : [{ qtyBreak: product.qtyBreak, priceBreak: product.priceBreak }]
        );
        
        // Create properties object with SKU and prices
        const properties = {
          _sku: variantIdInput.dataset.sku,
          _prices
        };

        // Add product to cart
        this.addToCart({
          productVariantID: variantIdInput,
          quantity,
          properties,
          sections,
          sections_url
        });
      }

      // Function to add product to cart
      addToCart({ productVariantID, quantity, properties, sections, sections_url }) {
        const formData = {
          items: [
            {
              id: productVariantID.value,
              quantity: quantity,
              properties: properties,
            }
          ],
          section: sections,
          sections_url: sections_url,
        };

        // Select custom price element
        const customPriceElement = document.querySelector('#custom_price');

        // Handle case where custom price element is not found
        if (!customPriceElement) {
          console.error("Error: #custom_price element not found.");
          return;
        }
        const cartNotificationProducts = document.querySelector('#cart-notification-product');
        cartNotificationProducts.innerHTML = '';

        // Create product wrapper element for cart notification
        const productWrapper = document.createElement('div');
        productWrapper.classList.add('cart-notification-prod');

        // Get product title and image
        const prodTitle = document.querySelector('#custom_price')?.dataset.title || 'Product Name';
        const prodImg = customPriceElement?.getAttribute('data-img-link') || 'https://via.placeholder.com/150';

        // Create product title element
        const productTitle = document.createElement('h3');
        productTitle.classList.add('cart-notification-product__name');
        productTitle.classList.add('h4');
        productTitle.textContent = prodTitle;

        // Create product image element
        const productImage = document.createElement('img');
        productImage.classList.add('cart-notification-product__image');
        productImage.src = prodImg.startsWith("//") ? `https:${prodImg}` : prodImg;
        productImage.alt = prodTitle;
        productImage.style.width = "70px";
        productImage.style.height = "70px";
        productWrapper.appendChild(productImage);
        productWrapper.appendChild(productTitle);
        cartNotificationProducts.appendChild(productWrapper);
  
        // Add product to cart via API
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
          if (this.cart) {
            fetch('/cart/update.js', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sections: this.cart?.getSectionsToRender?.()?.map((section) => section.id) || [],
                sections_url: window.location.pathname,
              }),
            })
              .then(response => response.json())
              .then(cartData => {
                document.querySelector('#cart-notification').classList.add('active');
              })
              .catch(error => {
                console.error('Error updating the cart sections:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          this.handleErrorMessage('There was an error adding the product to the cart.');
        })
        .finally(() => {
          this.submitButton.removeAttribute('aria-disabled');
          this.submitButton.classList.remove('loading');
          this.querySelector('.loading__spinner').classList.add('hidden');
        });
      }

      // Function to handle error messages
      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      // Function to toggle submit button state
      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      // Getter for variant ID input element
      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}