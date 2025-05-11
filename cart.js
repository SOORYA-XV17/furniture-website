/**
 * Professional Cart Management System
 * Handles adding items to cart, cart display, and checkout preparation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // DOM Elements
    const cartButton = document.getElementById('cartButton');
    const cartCountDisplay = document.querySelector('.cart-count');
    
    // Initialize
    updateCartCount();
    
    // Create and add cart modal to the DOM
    createCartModal();
    
    // Setup cart functionality
    setupCartFunctionality();
    
    // Listen for hash changes to reinitialize if needed
    window.addEventListener('hashchange', function() {
        // Ensure cart functionality works after hash change
        console.log('Hash changed, reinitializing cart functionality');
        setupCartFunctionality();
    });
    
    function setupCartFunctionality() {
        // Add event listeners for add to cart buttons using event delegation
        // This ensures it works with dynamically filtered/displayed content
        document.addEventListener('click', function(e) {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                addToCart(productCard);
            }
        }, { capture: true }); // Use capture to ensure this runs first
    }
    
    // Cart button click event
    if (cartButton) {
        cartButton.addEventListener('click', function(e) {
            // Navigate to cart page
            window.location.href = 'cart-page.html';
        });
    }
    
    // Function to add product to cart
    function addToCart(productCard) {
        if (!productCard) {
            console.error('Invalid product card element');
            return;
        }

        // Get product details
        const productId = productCard.getAttribute('data-id') || generateProductId(productCard);
        const productNameElement = productCard.querySelector('h3');
        const productPriceElement = productCard.querySelector('.price');
        const productImageElement = productCard.querySelector('.product-image-container img');
        
        if (!productNameElement || !productPriceElement || !productImageElement) {
            console.error('Cannot find required product elements', {
                name: !!productNameElement,
                price: !!productPriceElement,
                image: !!productImageElement
            });
            return;
        }

        const productName = productNameElement.textContent;
        const productPrice = parseFloat(productPriceElement.textContent.replace('$', ''));
        const productImage = productImageElement.src;
        
        console.log('Adding to cart:', {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
        });
        
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        
        if (existingProductIndex > -1) {
            // Increase quantity if product already in cart
            cart[existingProductIndex].quantity += 1;
            showNotification(`Increased quantity for ${productName} (${cart[existingProductIndex].quantity})`);
        } else {
            // Add new product to cart
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            showNotification(`${productName} added to cart!`);
        }
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart count
        updateCartCount();
        
        // Add animation effect
        animateCartIcon();
        
        console.log('Updated cart:', cart);
    }
    
    // Function to add to cart from modal
    function addToCartFromModal(productId, productName, productPrice, productImage, quantity) {
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        
        console.log('Adding from modal to cart:', {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
        
        if (existingProductIndex > -1) {
            // Update quantity if product already in cart
            cart[existingProductIndex].quantity += quantity;
            showNotification(`Updated ${productName} quantity (${cart[existingProductIndex].quantity})`);
        } else {
            // Add new product to cart
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: quantity
            });
            showNotification(`${productName} added to cart!`);
        }
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart count
        updateCartCount();
        
        // Add animation effect
        animateCartIcon();
    }
    
    // Function to update cart count display
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCountDisplay) {
            cartCountDisplay.textContent = totalItems;
            
            // Show/hide count based on items
            if (totalItems > 0) {
                cartCountDisplay.style.display = 'inline-flex';
            } else {
                cartCountDisplay.style.display = 'inline-flex';
            }
        }
    }
    
    // Generate unique ID for product
    function generateProductId(productElement) {
        const productName = productElement.querySelector('h3').textContent;
        const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const randomString = Math.random().toString(36).substring(2, 8);
        const id = `prod_${sanitizedName}_${randomString}`;
        
        // Set the ID as a data attribute on the product card
        productElement.setAttribute('data-id', id);
        
        return id;
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Show notification
    function showNotification(message) {
        // Prevent notification on checkout page
        if (window.location.pathname.includes('checkout.html')) {
            return;
        }

        // Remove any existing custom notification modal to prevent duplicates
        const existingModal = document.getElementById('cart-add-notification-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal structure
        const modal = document.createElement('div');
        modal.id = 'cart-add-notification-modal';
        modal.className = 'custom-notification-modal'; // For styling via cart-styles.css

        modal.innerHTML = `
            <div class="custom-notification-modal-content">
                <button class="custom-notification-close-btn">&times;</button>
                <p class="custom-notification-message">${message}</p>
                <div class="custom-notification-actions">
                    <button id="continue-shopping-btn" class="btn btn-sm btn-outline-secondary">Continue Shopping</button>
                    <button id="go-to-cart-btn" class="btn btn-sm btn-primary">View Cart & Checkout</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for the buttons inside the new modal
        const continueShoppingBtn = modal.querySelector('#continue-shopping-btn');
        const goToCartBtn = modal.querySelector('#go-to-cart-btn');
        const closeModalBtn = modal.querySelector('.custom-notification-close-btn');

        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                // Allow animation to finish before removing
                setTimeout(() => { modal.remove(); }, 300); 
            });
        }

        if (goToCartBtn) {
            goToCartBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => { modal.remove(); }, 300);
                window.location.href = 'cart-page.html'; // Navigate to cart page
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => { modal.remove(); }, 300); 
            });
        }

        // Make it visible (e.g., by adding a class if it's initially hidden by CSS)
        // Needs a slight delay to ensure the element is in the DOM for transition
        requestAnimationFrame(() => {
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });
    }
    
    // Animate cart icon when adding products
    function animateCartIcon() {
        if (cartButton) {
            cartButton.classList.add('shake');
            setTimeout(() => {
                cartButton.classList.remove('shake');
            }, 500);
        }
    }
    
    // Create cart modal
    function createCartModal() {
        // Create modal structure
        const cartModal = document.createElement('div');
        cartModal.id = 'cartModal';
        cartModal.className = 'cart-modal';
        
        cartModal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2>Your Shopping Cart</h2>
                    <button class="close-cart-modal">&times;</button>
                </div>
                <div class="cart-modal-body">
                    <div class="cart-items">
                        <!-- Cart items will be dynamically added here -->
                    </div>
                </div>
                <div class="cart-modal-footer">
                    <div class="cart-summary">
                        <div class="subtotal">
                            <span>Subtotal:</span>
                            <span class="subtotal-amount">$0.00</span>
                        </div>
                        <div class="shipping">
                            <span>Shipping:</span>
                            <span class="shipping-amount">$0.00</span>
                        </div>
                        <div class="tax">
                            <span>Tax:</span>
                            <span class="tax-amount">$0.00</span>
                        </div>
                        <div class="total">
                            <span>Total:</span>
                            <span class="total-amount">$0.00</span>
                        </div>
                    </div>
                    <div class="cart-actions">
                        <button class="continue-shopping">Continue Shopping</button>
                        <button class="checkout-btn">Proceed to Checkout</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(cartModal);
        
        // Add event listeners for cart modal
        const closeBtn = cartModal.querySelector('.close-cart-modal');
        const continueShoppingBtn = cartModal.querySelector('.continue-shopping');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCartModal);
        }
        
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', closeCartModal);
        }
        
        // Close modal when clicking outside
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
        
        // Add event listener for checkout button
        const checkoutBtn = cartModal.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length > 0) {
                    // Redirect to checkout page
                    window.location.href = 'checkout.html';
                } else {
                    showNotification('Your cart is empty', 'error');
                }
            });
        }
        
        // Add event listener for cart item quantity changes and removal
        const cartItemsContainer = cartModal.querySelector('.cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', function(e) {
                // Handle quantity decrease
                if (e.target.classList.contains('decrease-quantity')) {
                    const itemId = e.target.closest('.cart-item').getAttribute('data-id');
                    updateItemQuantity(itemId, 'decrease');
                }
                
                // Handle quantity increase
                if (e.target.classList.contains('increase-quantity')) {
                    const itemId = e.target.closest('.cart-item').getAttribute('data-id');
                    updateItemQuantity(itemId, 'increase');
                }
                
                // Handle item removal
                if (e.target.classList.contains('remove-item')) {
                    const itemId = e.target.closest('.cart-item').getAttribute('data-id');
                    removeCartItem(itemId);
                }
            });
        }
    }
    
    // Open cart modal
    function openCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            updateCartDisplay();
            cartModal.style.display = 'flex';
            document.body.classList.add('modal-open');
            
            // Add animation
            setTimeout(() => {
                cartModal.classList.add('show');
            }, 10);
        }
    }
    
    // Close cart modal
    function closeCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('show');
            setTimeout(() => {
                cartModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }
    
    // Update cart display in modal
    function updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <button class="start-shopping">Start Shopping</button>
                </div>
            `;
            
            // Add event listener to start shopping button
            const startShoppingBtn = cartItemsContainer.querySelector('.start-shopping');
            if (startShoppingBtn) {
                startShoppingBtn.addEventListener('click', closeCartModal);
            }
        } else {
            // Generate HTML for cart items
            let cartItemsHTML = '';
            
            cart.forEach(item => {
                cartItemsHTML += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h3>${item.name}</h3>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="decrease-quantity">-</button>
                            <input type="number" value="${item.quantity}" min="1" readonly>
                            <button class="increase-quantity">+</button>
                        </div>
                        <div class="cart-item-total">
                            $${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button class="remove-item">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            });
            
            cartItemsContainer.innerHTML = cartItemsHTML;
        }
        
        // Update cart summary
        updateCartSummary();
    }
    
    // Update cart summary calculations
    function updateCartSummary() {
        const subtotalElement = document.querySelector('.subtotal-amount');
        const shippingElement = document.querySelector('.shipping-amount');
        const taxElement = document.querySelector('.tax-amount');
        const totalElement = document.querySelector('.total-amount');
        
        if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return;
        
        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculate shipping (free over $50, otherwise $9.99)
        const shipping = subtotal > 50 ? 0 : 9.99;
        
        // Calculate tax (8.25%)
        const tax = subtotal * 0.0825;
        
        // Calculate total
        const total = subtotal + shipping + tax;
        
        // Update elements
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update item quantity
    function updateItemQuantity(itemId, action) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            console.warn(`Item with ID ${itemId} not found in cart.`);
            return;
        }

        let item = cart[itemIndex];
        if (action === 'increase') {
            item.quantity += 1;
            showNotification(`Increased quantity for ${item.name} to ${item.quantity}`);
        } else if (action === 'decrease') {
            if (item.quantity > 1) {
                item.quantity -= 1;
                showNotification(`Decreased quantity for ${item.name} to ${item.quantity}`);
            } else {
                // If quantity is 1 and decreasing, remove the item
                removeCartItem(itemId, true); // Pass flag to avoid double notification if called from remove
                return; // removeCartItem will handle save and updateCount
            }
        }
        saveCart();
        updateCartCount();
        // If a cart modal is open and visible, you might want to update its display too
        // updateCartDisplay(); // Example
    }
    
    // Remove item from cart
    function removeCartItem(itemId, isInternalCall = false) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            console.warn(`Item with ID ${itemId} not found for removal.`);
            return;
        }
        
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1); // Remove item from cart array
        
        if (!isInternalCall) { // Avoid double notification if called from updateItemQuantity
            showNotification(`${itemName} removed from cart`);
        }
        
        saveCart();
        updateCartCount();
        // If a cart modal is open and visible, you might want to update its display too
        // updateCartDisplay(); // Example
    }
    
    // Expose key cart functions globally under cartSystem namespace
    window.cartSystem = {
        addToCart: addToCart,
        addToCartFromModal: addToCartFromModal,
        showNotification: showNotification,
        updateCartCount: updateCartCount,
        getCart: function() { 
            // Return a deep copy to prevent external direct mutation of the cart array and its objects
            return JSON.parse(JSON.stringify(cart)); 
        },
        saveCart: saveCart,  // Expose saveCart if other modules manipulate the cart directly
        updateCartDisplay: updateCartDisplay, // If modal display needs to be triggered externally
        updateItemQuantity: updateItemQuantity,
        removeCartItem: removeCartItem,
        openCartModal: openCartModal,
        closeCartModal: closeCartModal
    };

    console.log('Cart system initialized and exposed on window.cartSystem:', window.cartSystem);
}); 