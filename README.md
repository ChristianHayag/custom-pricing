Custom Pricing Documentation

Overview
This documentation provides an overview of two JavaScript files: custom-pricing.js and product-form-custom.js. These files are used to manage custom pricing and product form submission on a web page. The custom-pricing.js file handles frontend validation and price updates, while the product-form-custom.js file manages the submission of custom pricing data to the cart.

Files
custom-pricing.js
This file is responsible for handling frontend validation and updating the displayed price based on the quantity input by the user.

Key Functions and Event Listeners
DOMContentLoaded Event Listener

Waits for the DOM to fully load before executing the script.
Selects various elements from the DOM, such as quantity input, plus and minus buttons, custom price display, product SKU, and add to cart button.
Ensures essential elements are present before proceeding.
fetchPricingData

Fetches pricing data from an external API.
Handles errors and updates the custom price display if there is an error fetching the data.
updatePrice

Updates the displayed price based on the quantity input.
Finds the matching product based on SKU and determines the applicable price based on quantity breaks.
updateMOQ

Updates the minimum order quantity (MOQ) based on the data attribute of the quantity input.
Ensures the quantity input value is not less than the MOQ.
debounceUpdateMOQ

Debounces the MOQ update to prevent rapid changes.
updateQuantity

Updates the quantity and price based on the new quantity input.
Ensures the new quantity is a multiple of the standard pack size (stdPk).
Event Listeners

Adds event listeners to update MOQ on input change, update quantity on input change, increase quantity on plus button click, decrease quantity on minus button click, and validate quantity before adding to cart.
product-form-custom.js
This file is responsible for managing the submission of custom pricing data to the cart.

Key Functions and Event Listeners
Custom Element Definition

Checks if the product-form custom element is already defined.
Defines the product-form custom element if not already defined.
Constructor

Selects the form element within the custom element.
Enables the variant ID input field.
Adds an event listener for form submission.
Selects the cart notification or cart drawer element.
Selects the submit button and its text span.
Selects product title and image elements.
Sets ARIA attribute for accessibility if cart drawer is present.
Determines if error messages should be hidden.
onSubmitHandler

Handles form submission.
Prevents default form submission behavior.
Creates a FormData object to hold form data.
Fetches custom pricing data from an external API.
Validates the quantity against the minimum order quantity (MOQ).
Finds matching products based on SKU.
Extracts prices from matched products and creates a properties object with SKU and prices.
Adds the product to the cart.
addToCart

Adds the product to the cart via API.
Handles the case where the custom price element is not found.
Creates product wrapper element for cart notification.
Adds product to cart via API and updates the cart sections.
handleErrorMessage

Handles error messages.
Toggles the visibility of the error message wrapper.
toggleSubmitButton

Toggles the submit button state.
Disables or enables the submit button and updates the button text.
variantIdInput Getter

Returns the variant ID input element.
Usage
custom-pricing.js

Include this file in your HTML to handle frontend validation and price updates based on quantity input.
Ensure the necessary elements (quantity input, plus and minus buttons, custom price display, product SKU, and add to cart button) are present in the DOM.
product-form-custom.js

Include this file in your HTML to manage the submission of custom pricing data to the cart.
Ensure the product-form custom element is defined and used in your HTML.
Conclusion
These two JavaScript files work together to provide a seamless experience for managing custom pricing and product form submission on a web page. The custom-pricing.js file handles frontend validation and price updates, while the product-form-custom.js file manages the submission of custom pricing data to the cart.
