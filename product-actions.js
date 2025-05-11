/**
 * Product Actions for FurnitureUI E-Commerce
 * Handles product interactions like quick view and add to cart
 */

document.addEventListener('DOMContentLoaded', function() {
    // Product Modal
    const productModal = document.querySelector('.product-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    console.log('Product-actions.js loaded - DOM ready');
    
    // Set up all event listeners
    setupEventListeners();
    
    // Listen for hash changes to ensure functionality with category navigation
    window.addEventListener('hashchange', function() {
        console.log('Hash changed, re-initializing product action events');
        setupEventListeners();
    });
    
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Quick View Button Event - using delegation for dynamic content
        document.addEventListener('click', function(e) {
            if (e.target.closest('.quick-view-btn')) {
                const productCard = e.target.closest('.product-card');
                openProductModal(productCard);
            }
        }, { capture: true });
        
        // Place in Your Space Button Event - using delegation
        document.addEventListener('click', function(e) {
            const placeInSpaceBtn = e.target.closest('.place-in-space-btn');
            if (placeInSpaceBtn) {
                const productCard = placeInSpaceBtn.closest('.product-card');
                const productName = productCard ? productCard.querySelector('h3').textContent.trim() : 'Unknown Product';
                
                // Basic mobile detection (can be made more robust)
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                if (isMobile) {
                    console.log(`Place in Your Space (Mobile) clicked for ${productName}.`);
                    
                    let packageName;
                    const lowerProductName = productName.toLowerCase();

                    if (lowerProductName.includes('chair')) {
                        packageName = 'com.evospace.chair';
                        console.log(`Product name contains "chair". Using specific package name: ${packageName}`);
                    } else {
                        // Sanitize the product name to create a valid package name component
                        const sanitizedProductNameComponent = productName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
                        packageName = `com.evospace.${sanitizedProductNameComponent}`;
                        console.log(`Product name does not contain "chair". Generated dynamic package name: ${packageName}`);
                    }

                    const encodedProductNameForData = encodeURIComponent(productName); // Keep original product name for data if needed by app
                    const playStoreUrl = encodeURIComponent(`market://details?id=${packageName}`);
                    const intentUrl = `intent://arview/${encodedProductNameForData}#Intent;package=${packageName};scheme=app;S.browser_fallback_url=${playStoreUrl};end`;
                    
                    console.log(`Attempting to open AR app with Intent URL: ${intentUrl}`);
                    window.location.href = intentUrl;
                } else {
                    console.log(`Place in Your Space (Desktop) clicked for ${productName}.`);
                    alert(`Desktop AR feature for \"${productName}\" would typically activate here.`);
                }
            }
        }, { capture: true });
        
        // Close modal when clicking X button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                console.log('Close button clicked');
                closeProductModal();
            });
        } else {
            console.warn('Close modal button not found!');
        }
        
        // Close modal when clicking outside the content
        if (productModal) {
            productModal.addEventListener('click', function(e) {
                if (e.target === productModal) {
                    console.log('Modal backdrop clicked');
                    closeProductModal();
                }
            });
        } else {
            console.warn('Product modal element not found!');
        }
        
        // Quantity controls in modal
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('quantity-control')) {
                const action = e.target.getAttribute('data-action');
                const input = document.querySelector('.quantity-input');
                const currentValue = parseInt(input.value);
                
                console.log('Quantity control clicked:', action, 'Current value:', currentValue);
                
                if (action === 'increase') {
                    input.value = currentValue + 1;
                } else if (action === 'decrease' && currentValue > 1) {
                    input.value = currentValue - 1;
                }
            }
        }, { capture: true });
        
        // Direct event listener for Add to Cart button in modal
        const modalAddBtn = document.querySelector('.modal-add-btn');
        if (modalAddBtn) {
            console.log('Add to cart button found, attaching event listener');
            modalAddBtn.addEventListener('click', function(e) {
                console.log('Add to cart button clicked directly');
                handleModalAddToCart(e);
            });
        } else {
            console.warn('Modal add button not found for direct event listener!');
        }
        
        // Add to Cart from Modal (using delegation as a fallback)
        document.addEventListener('click', function(e) {
            if (e.target.closest('.modal-add-btn')) {
                console.log('Add to cart button clicked via delegation');
                handleModalAddToCart(e);
            }
        }, { capture: true });
    }
    
    // Function to handle Add to Cart from modal
    function handleModalAddToCart(e) {
        const modal = document.querySelector('.product-modal');
        if (!modal) {
            console.error('Modal not found when trying to add to cart!');
            return;
        }
        
        // Get product data from the modal's data attributes
        const productName = modal.getAttribute('data-product-name');
        const productPrice = parseFloat(modal.getAttribute('data-product-price'));
        const productImage = modal.getAttribute('data-product-image');
        
        if (!productName || !productPrice || !productImage) {
            console.error('Product data missing from modal!', {
                name: productName,
                price: productPrice,
                image: productImage
            });
            return;
        }
        
        // Get quantity
        const quantityInput = modal.querySelector('.quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        // Generate a unique ID for this product if not already on modal (or rely on cartSystem to generate)
        // For now, cartSystem.addToCartFromModal will generate its own if needed or use a passed one.
        const productId = modal.getAttribute('data-product-id') || 'modal_product_' + Date.now(); 
        
        console.log('Adding to cart from modal via cartSystem:', {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
        
        try {
            if (window.cartSystem && typeof window.cartSystem.addToCartFromModal === 'function') {
                window.cartSystem.addToCartFromModal(productId, productName, productPrice, productImage, quantity);
                // Notification is handled by cartSystem.addToCartFromModal now
            } else {
                console.error('cartSystem.addToCartFromModal is not available!');
                // Fallback or error message if cartSystem is somehow not loaded
                alert('Error: Could not add to cart. cartSystem not available.'); 
            }
            
            // Close the modal
            closeProductModal();
        } catch (error) {
            console.error('Error adding product to cart from modal:', error);
            if (window.cartSystem && typeof window.cartSystem.showNotification === 'function') {
                window.cartSystem.showNotification('Error adding product to cart. Please try again.', 'error');
            } else {
                alert('Error adding product to cart. Please try again.');
            }
        }
    }
    
    // Functions
    function openProductModal(productCard) {
        if (!productModal) return;
        
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;
        const productDesc = productCard.querySelector('.product-description').textContent;
        const productImage = productCard.querySelector('.product-image-container img').src;
        const productCategory = productCard.getAttribute('data-category') || 'Furniture';
        
        // Get star rating and review count if available
        let starsHTML = '';
        let reviewCount = '';
        const ratingSection = productCard.querySelector('.rating-section');
        if (ratingSection) {
            starsHTML = ratingSection.querySelector('.stars').innerHTML;
            reviewCount = ratingSection.querySelector('.review-count').textContent;
        }
        
        // Get original price and discount badge if available
        let originalPrice = '';
        let discountBadge = '';
        const priceSection = productCard.querySelector('.price-section');
        if (priceSection) {
            const originalPriceEl = priceSection.querySelector('.original-price');
            if (originalPriceEl) {
                originalPrice = originalPriceEl.textContent;
            }
            
            const discountBadgeEl = priceSection.querySelector('.discount-badge');
            if (discountBadgeEl) {
                discountBadge = discountBadgeEl.textContent;
            }
        }
        
        console.log('Opening modal for product:', productName);
        
        // Store original product data for add to cart functionality
        productModal.setAttribute('data-product-name', productName);
        productModal.setAttribute('data-product-price', productPrice.replace('$', ''));
        productModal.setAttribute('data-product-image', productImage);
        
        // Generate a unique SKU for the product
        const sku = 'SKU-' + productName.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        
        // Set up carousel images (main image + 2 different angles/variations)
        const carouselInner = productModal.querySelector('.carousel-inner');
        carouselInner.innerHTML = '';
        
        // Background colors for carousel variations
        const bgColors = ['#f8f9fa', '#edf7f0', '#f0f5f9'];
        
        // Primary image
        const mainCarouselItem = document.createElement('div');
        mainCarouselItem.className = 'carousel-item active';
        mainCarouselItem.style.backgroundColor = bgColors[0];
        mainCarouselItem.innerHTML = `<img src="${productImage}" alt="${productName} - Main View">`;
        carouselInner.appendChild(mainCarouselItem);
        
        // Generate 2 additional images (simulate different angles)
        // In a real app, you'd have actual additional product images
        for (let i = 1; i <= 2; i++) {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.style.backgroundColor = bgColors[i];
            
            // Use the same image but with different styling for demo purposes
            const angle = i === 1 ? 'Side View' : 'Detail View';
            const scale = i === 1 ? '0.9' : '1.1';
            const rotate = i === 1 ? 'rotateY(15deg)' : 'rotate(5deg)';
            
            carouselItem.innerHTML = `
                <img src="${productImage}" alt="${productName} - ${angle}" 
                     style="transform: scale(${scale}) ${rotate}">
            `;
            carouselInner.appendChild(carouselItem);
        }
        
        // Set product details
        const productDetails = productModal.querySelector('.product-details');
        
        // Set product name
        productDetails.querySelector('h2').textContent = productName;
        
        // Set rating and reviews
        const modalRatingSection = productDetails.querySelector('.modal-rating-section');
        modalRatingSection.querySelector('.stars').innerHTML = starsHTML || '★★★★☆';
        modalRatingSection.querySelector('.review-count').textContent = reviewCount || '(0 reviews)';
        
        // Set price section
        const modalPriceSection = productDetails.querySelector('.modal-price-section');
        modalPriceSection.querySelector('.price').textContent = productPrice;
        modalPriceSection.querySelector('.original-price').textContent = originalPrice;
        modalPriceSection.querySelector('.discount-badge').textContent = discountBadge;
        
        // Set short description
        const productDescriptionShort = productDetails.querySelector('.product-description-short');
        productDescriptionShort.textContent = productDesc;
        
        // Set features (extract from description or create generic ones)
        const featureList = productDetails.querySelector('.feature-list');
        featureList.innerHTML = '';
        
        // Parse description to create features or use generic features
        const words = productDesc.split(' ');
        if (words.length > 5) {
            // Create 3 features from the description
            for (let i = 0; i < 3; i++) {
                const startIdx = Math.floor(i * words.length / 3);
                const endIdx = Math.min(startIdx + 4, words.length);
                const featureText = words.slice(startIdx, endIdx).join(' ');
                
                const li = document.createElement('li');
                li.textContent = featureText.charAt(0).toUpperCase() + featureText.slice(1);
                // Add fade-in animation with delay
                li.style.opacity = '0';
                li.style.animation = `fadeInRight 0.5s ease ${0.3 + (i * 0.15)}s forwards`;
                featureList.appendChild(li);
            }
        } else {
            // Generic features
            const genericFeatures = [
                'Premium quality materials for durability',
                'Elegant design that complements any interior',
                'Comfortable and practical for everyday use'
            ];
            
            genericFeatures.forEach((feature, i) => {
                const li = document.createElement('li');
                li.textContent = feature;
                // Add fade-in animation with delay
                li.style.opacity = '0';
                li.style.animation = `fadeInRight 0.5s ease ${0.3 + (i * 0.15)}s forwards`;
                featureList.appendChild(li);
            });
        }
        
        // Set product metadata (category and SKU)
        const productMeta = productDetails.querySelector('.product-meta');
        productMeta.innerHTML = `
            <div class="meta-item">
                <span class="meta-label">Category:</span>
                <span class="meta-value category-value">${productCategory}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">SKU:</span>
                <span class="meta-value sku-value">${sku}</span>
            </div>
        `;
        
        // Add animation to meta items
        const metaItems = productMeta.querySelectorAll('.meta-item');
        metaItems.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.animation = `fadeInUp 0.5s ease ${0.7 + (i * 0.1)}s forwards`;
        });
        
        // Set tab content
        const descriptionContent = productModal.querySelector('.description-content');
        if (descriptionContent) {
            // Create a detailed description by repeating the short description
            descriptionContent.innerHTML = `
                <p>${productDesc}</p>
                <p>Our ${productName} is designed with both style and functionality in mind. The premium materials ensure durability while adding a touch of elegance to your space.</p>
                <p>Each piece is carefully crafted to meet the highest standards of quality and design. Perfect for both modern and traditional interiors, this piece will be a valuable addition to your home.</p>
            `;
        }
        
        // Set specifications table
        const specsTable = productModal.querySelector('.specs-table tbody');
        if (specsTable) {
            // Generate generic specifications based on product category
            specsTable.innerHTML = '';
            
            // Add some generic specs
            const specs = [
                ['Material', 'Premium quality materials'],
                ['Dimensions', '60 x 40 x 30 inches (W x H x D)'],
                ['Weight', '35 lbs'],
                ['Assembly Required', 'Minimal assembly required'],
                ['Warranty', '2 years limited warranty']
            ];
            
            specs.forEach((spec, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${spec[0]}</td>
                    <td>${spec[1]}</td>
                `;
                // Add fade-in animation
                tr.style.opacity = '0';
                tr.style.animation = `fadeInUp 0.4s ease ${0.2 + (i * 0.1)}s forwards`;
                specsTable.appendChild(tr);
            });
        }
        
        // Set reviews
        const reviewsList = productModal.querySelector('.review-list');
        if (reviewsList) {
            // Generate sample reviews
            reviewsList.innerHTML = '';
            
            // Extract review count from text like "(42 reviews)"
            let numReviews = 3; // Default
            if (reviewCount) {
                const match = reviewCount.match(/\((\d+)\s+reviews\)/);
                if (match && match[1]) {
                    numReviews = Math.min(parseInt(match[1]), 5);
                }
            }
            
            // Update the review count in the summary
            const reviewCountNumber = productModal.querySelector('.review-count-number');
            if (reviewCountNumber) {
                reviewCountNumber.textContent = numReviews;
            }
            
            // Random reviewer names
            const reviewerNames = ['John D.', 'Sarah M.', 'Michael T.', 'Emily W.', 'Robert P.'];
            
            // Random review dates (within last 3 months)
            const today = new Date();
            
            // Generate reviews
            for (let i = 0; i < numReviews; i++) {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                // Random rating (4 or 5 stars)
                const rating = Math.random() > 0.3 ? 5 : 4;
                const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
                
                // Random date in last 3 months
                const daysAgo = Math.floor(Math.random() * 90);
                const reviewDate = new Date(today);
                reviewDate.setDate(today.getDate() - daysAgo);
                const dateString = reviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                
                reviewItem.innerHTML = `
                    <div class="review-header">
                        <span class="reviewer-name">${reviewerNames[i % reviewerNames.length]}</span>
                        <span class="review-date">${dateString}</span>
                    </div>
                    <div class="review-rating">${stars}</div>
                    <div class="review-content">
                        <p>Absolutely love this ${productName}! ${rating === 5 ? 'Exceeded my expectations in every way.' : 'Very happy with my purchase.'} The quality is excellent and it looks exactly as pictured. Would definitely recommend.</p>
                    </div>
                `;
                
                // Add fade-in animation with delay
                reviewItem.style.opacity = '0';
                reviewItem.style.animation = `fadeInUp 0.5s ease ${0.3 + (i * 0.2)}s forwards`;
                
                reviewsList.appendChild(reviewItem);
            }
            
            // Animate the rating bars with delays
            setTimeout(() => {
                const ratingBars = productModal.querySelectorAll('.progress-bar');
                ratingBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }, 500);
        }
        
        // Reset quantity
        const quantityInput = productModal.querySelector('.quantity-input');
        if (quantityInput) {
            quantityInput.value = 1;
        }
        
        // Show modal
        productModal.style.display = 'block';
        
        // Add animation to modal content
        const modalContent = productModal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(40px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transition = 'all 0.5s ease';
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.opacity = '1';
            
            // Initialize the Bootstrap carousel after the modal is displayed
            try {
                $('#productCarousel').carousel();
                console.log('Carousel initialized');
            } catch (error) {
                console.error('Error initializing carousel:', error);
            }
        }, 10);
    }
    
    function closeProductModal() {
        const productModal = document.querySelector('.product-modal');
        if (productModal) {
            productModal.style.display = 'none'; // Hide the modal
            productModal.classList.remove('show'); // Ensure any Bootstrap 'show' class is removed
            // Reset modal content or state if necessary
            // Example: reset quantity input to 1
            const quantityInput = productModal.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = '1';
            }
        }
    }
    
    // SKU is not used in the current cart logic, but good for future reference
    // console.log('SKU:', sku);
});
