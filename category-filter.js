/**
 * Category Filter for Furniture E-Commerce
 * Handles filtering products by category
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all category links
    const categoryLinks = document.querySelectorAll('.category-link');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    // Track current category
    let currentCategory = 'all';
    
    // Check for hash in URL on page load
    function checkUrlHash() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== '') {
            // Find the matching category link
            const matchingLink = document.querySelector(`.category-link[data-category="${hash}"]`);
            if (matchingLink) {
                // Simulate a click on the category link
                matchingLink.click();
                return true;
            }
        }
        return false;
    }
    
    // Add event listeners to category buttons
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all category links
            categoryLinks.forEach(cat => cat.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get category from data attribute
            const category = this.getAttribute('data-category');
            currentCategory = category;
            
            // Update URL hash without scrolling
            if (history.pushState) {
                history.pushState(null, null, `#${category}`);
            } else {
                window.location.hash = category;
            }
            
            // Filter products
            filterProductsByCategory(category);
            
            // Scroll to top of product section
            const productSection = document.querySelector('.product-catalog');
            if (productSection) {
                window.scrollTo({
                    top: productSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add event listeners to dropdown category items
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get category from data attribute
            const category = this.getAttribute('data-category');
            if (!category) return;
            
            currentCategory = category;
            
            // Update URL hash without scrolling
            if (history.pushState) {
                history.pushState(null, null, `#${category}`);
            } else {
                window.location.hash = category;
            }
            
            // Update sidebar category links if they exist
            categoryLinks.forEach(cat => {
                if (cat.getAttribute('data-category') === category) {
                    cat.classList.add('active');
                } else {
                    cat.classList.remove('active');
                }
            });
            
            // Filter products
            filterProductsByCategory(category);
            
            // Scroll to top of product section
            const productSection = document.querySelector('.product-catalog');
            if (productSection) {
                window.scrollTo({
                    top: productSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // If this is the shop link on the catalogue page, or a hash link for filtering
            if (href === 'catalogue-fixed.html' || (href.startsWith('#') && href.length > 1)) {
                e.preventDefault(); // Prevent default only for these specific cases
                
                // Remove active class from all nav links
                navLinks.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked link
                this.classList.add('active');
                
                if (href === 'catalogue-fixed.html' || href === '#all') { // or any other relevant hash for catalogue
                    resetFilters(); // Reset to show all products or handle specific filter
                }
                // If it's a category hash like #living-room, the other listeners will handle it
                // or it will scroll to the section if not handled by other listeners.
            } else if (href && !href.startsWith('http') && !href.startsWith('#')) {
                // For other internal page links (index.html, cart-page.html, etc.)
                // Remove active class from all nav links
                navLinks.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked link
                this.classList.add('active');
                // Allow default navigation to occur (e.g., window.location.href = href; is not needed)
            }
            // For external links (href.startsWith('http')) or simple anchor links ('#'), default behavior is already allowed.
            // For the main "Categories" dropdown toggle, we also want default Bootstrap behavior.
        });
    });
    
    // Function to filter products by category
    function filterProductsByCategory(category) {
        console.log('Filtering products by category:', category);
        
        // Get all product cards
        const productCards = document.querySelectorAll('.product-card');
        
        // Handle animation and filtering
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardColumn = card.closest('.col-md-4');
            
            // Add fade-out class
            cardColumn.classList.add('category-transition');
            
            // Filter logic
            setTimeout(() => {
                if (category === 'all' || cardCategory === category) {
                    // Show this card
                    cardColumn.style.display = 'block';
                    setTimeout(() => {
                        cardColumn.classList.remove('category-transition');
                    }, 50);
                } else {
                    // Hide this card
                    cardColumn.style.display = 'none';
                    cardColumn.classList.remove('category-transition');
                }
            }, 300);
        });
        
        // After filtering, initialize pagination
        setTimeout(() => {
            // If pagination_fix.js is in use, trigger a pagination reset
            if (typeof resetPagination === 'function') {
                resetPagination();
            } else {
                // Fallback - find any pagination script and try to reset it
                const paginationContainer = document.querySelector('.pagination-container');
                if (paginationContainer) {
                    // Force pagination redraw
                    paginationContainer.style.display = 'none';
                    setTimeout(() => {
                        paginationContainer.style.display = 'flex';
                    }, 10);
                }
            }
            
            // Re-setup cart functionality to ensure add-to-cart buttons work
            // This addresses issues with cart buttons not working after filtering
            if (window.cartSystem && typeof window.cartSystem.setupCartFunctionality === 'function') {
                console.log('Re-initializing cart functionality after category filter');
                window.cartSystem.setupCartFunctionality();
            }
        }, 400);
    }
    
    // Function to reset all filters
    function resetFilters() {
        // Set "All Products" as active
        categoryLinks.forEach(link => {
            if (link.getAttribute('data-category') === 'all') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update URL hash
        if (history.pushState) {
            history.pushState(null, null, '#all');
        } else {
            window.location.hash = 'all';
        }
        
        // Show all products
        filterProductsByCategory('all');
    }
    
    // Initialize - check for hash in URL or ensure "All Products" is active
    if (!checkUrlHash()) {
        resetFilters();
    }
    
    // Handle hash changes when user uses browser navigation
    window.addEventListener('hashchange', function() {
        console.log('Hash changed, checking URL hash');
        checkUrlHash();
    });
    
    // Expose reset function to global scope for other scripts to use
    window.resetCategoryFilters = resetFilters;
}); 