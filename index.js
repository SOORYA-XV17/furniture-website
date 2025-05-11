document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelector('.slider');
    const slideElements = document.querySelectorAll('.slide');
    const slideCount = slideElements.length;
    const prevArrow = document.querySelector('.arrow.left');
    const nextArrow = document.querySelector('.arrow.right');
    const navbar = document.querySelector('.navbar');
    const button = document.querySelector('.explore-more-btn button');
    const body = document.body;
    const footer = document.querySelector('.footer');
    const reviewCards = document.querySelectorAll('.review-carousel .review-card');
    let currentIndex = 0;

    // Array of colors corresponding to slides
    const slideColors = [
        '#254336', // Dark Green
        '#6B8A7A', // Light Green
        '#B7B597', // Beige
        '#DAD3BE'  // Light Beige
    ];

    function updateSlidePosition() {
        if (slides) {
            const offset = -currentIndex * 100;
            slides.style.transform = `translateX(${offset}%)`;
            updateColors();
        }
    }

    function updateColors() {
        const color = slideColors[currentIndex];
        if (navbar) navbar.style.backgroundColor = color;
        if (body) body.style.backgroundColor = color;
        if (button) {
            button.style.backgroundColor = color;
            button.style.color = '#fff';
        }
        if (footer) footer.style.backgroundColor = color;

        // Update review cards color
        reviewCards.forEach(card => {
            card.style.backgroundColor = color;
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        updateSlidePosition();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateSlidePosition();
    }

    if (nextArrow) nextArrow.addEventListener('click', nextSlide);
    if (prevArrow) prevArrow.addEventListener('click', prevSlide);

    // Automatic slide transition
    setInterval(nextSlide, 5000);

    // Initialize the colors on page load
    updateColors();
});
