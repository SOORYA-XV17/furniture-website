/**
 * FurnitureUI Catalogue Module
 * Enhanced product browsing experience with advanced interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const productCatalog = document.querySelector('.product-catalog');
    const categoryLinks = document.querySelectorAll('.category-link');
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    const cartCountElement = document.querySelector('.cart-count');
    
    // App state
    const state = {
        currentPage: 1,
        itemsPerPage: 9,
        currentCategory: 'all',
        searchTerm: '',
        priceRange: 'all',
        sortBy: 'default',
        isFiltering: false,
        wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
        recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed')) || []
    };
    
    // Initialize the application
    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Initialize product interactions
        initProductInteractions();
        
        // Apply initial animations
        animateProductsIn();
        
        // Setup intersection observer for lazy loading
        setupLazyLoading();
        
        // Apply URL parameters if any
        applyUrlParams();
        
        // Initialize tooltips and popovers if using Bootstrap
        if (typeof $ !== 'undefined') {
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
        }
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Category filtering
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Visual feedback
                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Apply filter
                state.currentCategory = this.getAttribute('data-category');
                state.currentPage = 1; // Reset to first page
                applyFilters();
                
                // Update URL
                updateUrlParams();
            });
        });
        
        // Search input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.searchTerm = this.value.toLowerCase().trim();
                state.currentPage = 1; // Reset to first page
                applyFilters();
                
                // Update URL
                updateUrlParams();
            }, 300);
        });
        
        // Price range filter
        priceFilter.addEventListener('change', function() {
            state.priceRange = this.value;
            state.currentPage = 1; // Reset to first page
            applyFilters();
            
            // Update URL
            updateUrlParams();
        });
        
        // Sort filter
        sortFilter.addEventListener('change', function() {
            state.sortBy = this.value;
            applySorting();
            
            // Update URL
            updateUrlParams();
        });
        
        // Pagination
        paginationBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Skip if it's the next button and we handle that differently
                if (this.innerHTML.includes('fa-chevron-right')) {
                    state.currentPage++;
                } else {
                    state.currentPage = parseInt(this.textContent);
                }
                
                updatePaginationUI();
                scrollToTop();
                
                // Update URL
                updateUrlParams();
            });
        });
        
        // Clear filters button (delegated event)
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'clearFiltersBtn') {
                resetFilters();
            }
        });
        
        // Quick view buttons (handled by Bootstrap modal, no need for custom handler)
        
        // Quantity controls in modal
        document.querySelector('.quantity-btn.decrease').addEventListener('click', function() {
            const input = document.getElementById('quantityInput');
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        });
        
        document.querySelector('.quantity-btn.increase').addEventListener('click', function() {
            const input = document.getElementById('quantityInput');
            const currentValue = parseInt(input.value);
            const max = parseInt(input.getAttribute('max') || 10);
            if (currentValue < max) {
                input.value = currentValue + 1;
            }
        });
        
        // Modal add to cart button
        const modalAddToCartBtn = document.querySelector('.modal-body .add-to-cart-btn');
        if (modalAddToCartBtn) {
            modalAddToCartBtn.addEventListener('click', function() {
                const modal = document.getElementById('productModal');
                const productId = modal.getAttribute('data-current-product');
                const quantity = parseInt(document.getElementById('quantityInput').value);
                addToCart(productId, null, quantity);
                
                // Optional: close the modal after adding to cart
                if (typeof $ !== 'undefined') {
                    $('#productModal').modal('hide');
                }
            });
        }
        
        // Buy now button
        const buyNowBtn = document.querySelector('.buy-now-btn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function() {
                const modal = document.getElementById('productModal');
                const productId = modal.getAttribute('data-current-product');
                const quantity = parseInt(document.getElementById('quantityInput').value);
                addToCart(productId, null, quantity);
                
                // Redirect to cart/checkout
                window.location.href = 'cart.html';
            });
        }
        
        // Thumbnail click in modal
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Window resize handler for responsive adjustments
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                adjustResponsiveElements();
            }, 250);
        });
    }
    
    // Apply all current filters
    function applyFilters() {
        state.isFiltering = true;
        
        // Show loading state
        showLoading();
        
        // Simulate network delay (remove in production)
        setTimeout(() => {
            const productCards = document.querySelectorAll('.product-card');
            let visibleCount = 0;
            
            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const productName = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.product-description').textContent.toLowerCase();
                const priceText = card.querySelector('.price').textContent.replace('$', '').replace(',', '');
                const price = parseFloat(priceText);
                
                // Category filter
                const categoryMatch = state.currentCategory === 'all' || category === state.currentCategory;
                
                // Search filter
                const searchMatch = state.searchTerm === '' || 
                                  productName.includes(state.searchTerm) || 
                                  description.includes(state.searchTerm);
                
                // Price filter
                let priceMatch = true;
                if (state.priceRange === '0-100') {
                    priceMatch = price <= 100;
                } else if (state.priceRange === '100-500') {
                    priceMatch = price > 100 && price <= 500;
                } else if (state.priceRange === '500-1000') {
                    priceMatch = price > 500 && price <= 1000;
                } else if (state.priceRange === '1000+') {
                    priceMatch = price > 1000;
                }
                
                // Combine filters
                if (categoryMatch && searchMatch && priceMatch) {
                    card.classList.remove('filtered-out');
                    visibleCount++;
                } else {
                    card.classList.add('filtered-out');
                }
            });
            
            // Hide loading
            hideLoading();
            
            // Show "no products" message if needed
            if (visibleCount === 0) {
                showNoProductsMessage();
            } else {
                hideNoProductsMessage();
            }
            
            // Apply sorting after filtering
            applySorting();
            
            // Update pagination after filtering
            updatePagination(visibleCount);
            
            state.isFiltering = false;
            
            // Animate products in
            animateFilteredProductsIn();
        }, 300);
    }
    
    // Apply sorting to filtered products
    function applySorting() {
        const products = Array.from(document.querySelectorAll('.product-card:not(.filtered-out)'));
        
        products.sort(function(a, b) {
            const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', '').replace(',', ''));
            const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', '').replace(',', ''));
            
            const reviewsAMatch = a.querySelector('.review-count').textContent.match(/\d+/);
            const reviewsBMatch = b.querySelector('.review-count').textContent.match(/\d+/);
            
            const reviewsA = reviewsAMatch ? parseInt(reviewsAMatch[0]) : 0;
            const reviewsB = reviewsBMatch ? parseInt(reviewsBMatch[0]) : 0;
            
            switch (state.sortBy) {
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'popular':
                    return reviewsB - reviewsA;
                case 'newest':
                    // For demo, we'll just use a random sort for "newest"
                    return Math.random() - 0.5;
                default:
                    return 0;
            }
        });
        
        // Reorder DOM elements
        products.forEach(product => {
            productCatalog.appendChild(product);
        });
    }
    
    // Update pagination based on filtered products count
    function updatePagination(visibleCount) {
        const pageCount = Math.ceil(visibleCount / state.itemsPerPage);
        
        // Update pagination UI based on total pages
        if (pageCount <= 1) {
            document.querySelector('.pagination-container').style.display = 'none';
        } else {
            document.querySelector('.pagination-container').style.display = 'flex';
            
            // Update pagination buttons (only first 4 numbered buttons)
            const numericButtons = Array.from(paginationBtns).filter(btn => !btn.innerHTML.includes('fa-'));
            
            numericButtons.forEach((btn, index) => {
                if (index < pageCount) {
                    btn.style.display = 'flex';
                    btn.textContent = index + 1;
                    btn.classList.toggle('active', index + 1 === state.currentPage);
                } else {
                    btn.style.display = 'none';
                }
            });
            
            // Show/hide next button
            const nextButton = Array.from(paginationBtns).find(btn => btn.innerHTML.includes('fa-'));
            if (nextButton) {
                nextButton.style.display = state.currentPage < pageCount ? 'flex' : 'none';
            }
        }
        
        // Apply pagination to products
        applyPagination();
    }
    
    // Apply pagination to filtered products
    function applyPagination() {
        const visibleProducts = document.querySelectorAll('.product-card:not(.filtered-out)');
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        
        visibleProducts.forEach((product, index) => {
            if (index >= startIndex && index < endIndex) {
                product.classList.remove('pagination-hidden');
            } else {
                product.classList.add('pagination-hidden');
            }
        });
    }
    
    // Update pagination UI
    function updatePaginationUI() {
        const numericButtons = Array.from(paginationBtns).filter(btn => !btn.innerHTML.includes('fa-'));
        
        numericButtons.forEach(btn => {
            const pageNum = parseInt(btn.textContent);
            btn.classList.toggle('active', pageNum === state.currentPage);
        });
        
        // Apply pagination to products
        applyPagination();
    }
    
    // Reset all filters
    function resetFilters() {
        // Reset state
        state.currentCategory = 'all';
        state.searchTerm = '';
        state.priceRange = 'all';
        state.sortBy = 'default';
        state.currentPage = 1;
        
        // Reset UI elements
        searchInput.value = '';
        priceFilter.value = 'all';
        sortFilter.value = 'default';
        categoryLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-category') === 'all');
        });
        
        // Apply filters
        applyFilters();
        
        // Update URL
        updateUrlParams();
        
        // Remove no products message
        hideNoProductsMessage();
    }
    
    // Initialize product interactions
    function initProductInteractions() {
        // Set up hover effects
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            // Add unique product IDs if they don't exist
            if (!card.getAttribute('data-product-id')) {
                // Generate an ID based on the product index or use the data-product attribute
                const quickViewBtn = card.querySelector('.quick-view-btn');
                const productId = quickViewBtn ? quickViewBtn.getAttribute('data-product') : `product-${Math.random().toString(36).substr(2, 9)}`;
                card.setAttribute('data-product-id', productId);
            }
        });
        
        // Initialize modal event
        if (typeof $ !== 'undefined') {
            $('#productModal').on('show.bs.modal', function(event) {
                const button = $(event.relatedTarget);
                const productId = button.data('product');
                const productCard = button.closest('.product-card');
                
                // Set current product ID on modal
                this.setAttribute('data-current-product', productId);
                
                // Reset quantity
                document.getElementById('quantityInput').value = 1;
                
                // Log product view for analytics
                logProductView(productId);
                
                // Update recently viewed
                addToRecentlyViewed(productId, productCard);
            });
        }
    }
    
    // Log product view (for analytics)
    function logProductView(productId) {
        // In a real app, this would send data to an analytics service
        console.log(`Product viewed: ${productId}`);
    }
    
    // Add to recently viewed products
    function addToRecentlyViewed(productId, productElement) {
        if (!productElement) return;
        
        // Get product data
        const productName = productElement.querySelector('h3').textContent;
        const productPrice = productElement.querySelector('.price').textContent;
        const productImage = productElement.querySelector('img').getAttribute('src');
        
        // Create product object
        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            timestamp: new Date().getTime()
        };
        
        // Remove if already in list
        state.recentlyViewed = state.recentlyViewed.filter(item => item.id !== productId);
        
        // Add to front of list
        state.recentlyViewed.unshift(product);
        
        // Limit to 6 items
        if (state.recentlyViewed.length > 6) {
            state.recentlyViewed = state.recentlyViewed.slice(0, 6);
        }
        
        // Save to local storage
        localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed));
    }
    
    // Show loading state
    function showLoading() {
        // Remove any existing loading indicator
        hideLoading();
        
        // Create loading element
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading';
        
        // Append to catalog
        productCatalog.appendChild(loadingEl);
    }
    
    // Hide loading state
    function hideLoading() {
        const loadingEl = document.querySelector('.loading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    // Show no products message
    function showNoProductsMessage() {
        // Remove any existing message
        hideNoProductsMessage();
        
        // Clone template
        const noProductsTemplate = document.getElementById('noProductsTemplate');
        const noProducts = noProductsTemplate.content.cloneNode(true);
        
        // Append to catalog
        productCatalog.appendChild(noProducts);
    }
    
    // Hide no products message
    function hideNoProductsMessage() {
        const noProductsEl = document.querySelector('.no-products');
        if (noProductsEl) {
            noProductsEl.remove();
        }
    }
    
    // Animate products in on page load
    function animateProductsIn() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 50)); // Stagger the animations
        });
    }
    
    // Animate filtered products in
    function animateFilteredProductsIn() {
        const productCards = document.querySelectorAll('.product-card:not(.filtered-out):not(.pagination-hidden)');
        
        productCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50 + (index * 30)); // Faster stagger for filtering
        });
    }
    
    // Set up lazy loading for images
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            });
            
            // Get all images with data-src attribute
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
            });
        }
    }
    
    // Adjust responsive elements based on screen size
    function adjustResponsiveElements() {
        const windowWidth = window.innerWidth;
        
        // Adjust items per page based on screen size
        if (windowWidth < 576) {
            state.itemsPerPage = 4;
        } else if (windowWidth < 992) {
            state.itemsPerPage = 6;
        } else {
            state.itemsPerPage = 12;
        }
        
        // Reapply filters and pagination
        if (!state.isFiltering) {
            applyFilters();
        }
    }
    
    // Scroll to top smoothly
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Update URL parameters based on current filters
    function updateUrlParams() {
        const params = new URLSearchParams();
        
        if (state.currentCategory !== 'all') {
            params.set('category', state.currentCategory);
        }
        
        if (state.searchTerm) {
            params.set('search', state.searchTerm);
        }
        
        if (state.priceRange !== 'all') {
            params.set('price', state.priceRange);
        }
        
        if (state.sortBy !== 'default') {
            params.set('sort', state.sortBy);
        }
        
        if (state.currentPage > 1) {
            params.set('page', state.currentPage);
        }
        
        // Update URL without reloading page
        const newUrl = params.toString() ? 
            `${window.location.pathname}?${params.toString()}` : 
            window.location.pathname;
        
        window.history.replaceState({}, '', newUrl);
    }
    
    // Apply filters from URL parameters
    function applyUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        // Category
        const category = params.get('category');
        if (category) {
            state.currentCategory = category;
            
            // Update category link UI
            categoryLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-category') === category);
            });
        }
        
        // Search
        const search = params.get('search');
        if (search) {
            state.searchTerm = search;
            searchInput.value = search;
        }
        
        // Price range
        const price = params.get('price');
        if (price) {
            state.priceRange = price;
            priceFilter.value = price;
        }
        
        // Sort
        const sort = params.get('sort');
        if (sort) {
            state.sortBy = sort;
            sortFilter.value = sort;
        }
        
        // Page
        const page = params.get('page');
        if (page) {
            state.currentPage = parseInt(page);
        }
        
        // Apply all filters
        applyFilters();
    }
    
    // Initialize the app
    init();
}); 