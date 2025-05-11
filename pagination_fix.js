/**
 * Pagination Fix for Catalogue Page
 * This script ensures that only 9 products are shown per page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set the number of items to display per page
    const itemsPerPage = 9;
    
    // Get all product cards
    let productCards = [];
    let currentPage = 1;
    
    // Function to show/hide products based on current page
    function showPage(page) {
        // Update productCards to only include visible products
        updateVisibleProductCards();
        
        // Hide all products first
        productCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Calculate start and end indexes for current page
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, productCards.length);
        
        // Show only the products for current page
        for (let i = startIndex; i < endIndex; i++) {
            if (productCards[i]) {
                productCards[i].style.display = 'block';
            }
        }
        
        updatePageIndicator(page);
    }
    
    // Get all visible product cards
    function updateVisibleProductCards() {
        // Get all product card columns that are not hidden by category filter
        const productCardColumns = document.querySelectorAll('.col-md-4[style*="display: block"], .col-md-4:not([style*="display"])');
        
        // Get the actual product cards from the columns
        productCards = Array.from(productCardColumns).map(column => column.querySelector('.product-card'));
    }
    
    // Function to create pagination controls
    function createPaginationControls() {
        // Update productCards to only include visible products
        updateVisibleProductCards();
        
        const totalPages = Math.ceil(productCards.length / itemsPerPage);
        
        // Create pagination container if it doesn't exist
        let paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            
            // Place it after the product catalog
            const productCatalog = document.querySelector('.product-catalog');
            if (productCatalog && productCatalog.parentNode) {
                productCatalog.parentNode.insertBefore(paginationContainer, productCatalog.nextSibling);
            }
        }
        
        // If no pages or only 1 page, hide pagination
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        } else {
            paginationContainer.style.display = 'flex';
        }
        
        // Clear any existing pagination
        paginationContainer.innerHTML = '';
        
        // Create the pagination HTML
        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
        </li>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }
        
        // Next button
        paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
        </li>`;
        
        paginationHTML += '</ul>';
        
        // Add product count
        const start = Math.min((currentPage - 1) * itemsPerPage + 1, productCards.length);
        const end = Math.min(start + itemsPerPage - 1, productCards.length);
        paginationHTML += `<div class="product-count">Showing ${start} - ${end} of ${productCards.length} products</div>`;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners to pagination links
        const pageLinks = paginationContainer.querySelectorAll('.page-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageNum = parseInt(this.getAttribute('data-page'));
                
                const totalPages = Math.ceil(productCards.length / itemsPerPage);
                if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                    currentPage = pageNum;
                    showPage(currentPage);
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Update the page indicator
    function updatePageIndicator(page) {
        createPaginationControls();
    }
    
    // Add custom styling for pagination
    function addPaginationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pagination-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 40px 0;
            }
            
            .pagination {
                display: flex;
                list-style: none;
                padding: 0;
                margin: 0 0 15px 0;
            }
            
            .page-item {
                margin: 0 5px;
            }
            
            .page-link {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 1px solid #ddd;
                color: #254336;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            
            .page-item.active .page-link {
                background-color: #254336;
                color: #fff;
                border-color: #254336;
            }
            
            .page-item.disabled .page-link {
                color: #ccc;
                pointer-events: none;
            }
            
            .page-link:hover:not(.page-item.active .page-link):not(.page-item.disabled .page-link) {
                background-color: #f5f5f5;
            }
            
            .product-count {
                color: #666;
                font-size: 0.9rem;
            }
            
            .category-transition {
                opacity: 0.5;
                transition: opacity 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public reset function that can be called by other scripts
    window.resetPagination = function() {
        currentPage = 1;
        updateVisibleProductCards();
        createPaginationControls();
        showPage(1);
    };
    
    // Initialize pagination
    function init() {
        addPaginationStyles();
        updateVisibleProductCards();
        createPaginationControls();
        showPage(1);
    }
    
    // Start the pagination
    init();
}); 