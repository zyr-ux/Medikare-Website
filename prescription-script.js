document.addEventListener('DOMContentLoaded', function() {
    // Quote rotation functionality
    const quoteBoxes = document.querySelectorAll('.quote-box');
    let currentQuoteIndex = 0;

    function showQuote(index) {
        // Hide all quotes
        quoteBoxes.forEach(box => {
            box.classList.remove('active');
        });

        // Show the selected quote
        quoteBoxes[index].classList.add('active');
    }

    // Show the first quote immediately
    showQuote(currentQuoteIndex);

    // Rotate quotes every 5 seconds
    setInterval(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % quoteBoxes.length;
        showQuote(currentQuoteIndex);
    }, 5000);

    // Modal functionality
    const contactBtn = document.getElementById('contact-btn');
    const aboutBtn = document.getElementById('about-btn');
    const emergencyBtn = document.getElementById('emergency-btn');
    
    const contactModal = document.getElementById('contact-modal');
    const aboutModal = document.getElementById('about-modal');
    const emergencyModal = document.getElementById('emergency-modal');
    
    const closeButtons = document.querySelectorAll('.close-btn');

    // Open modals
    contactBtn.addEventListener('click', function(e) {
        e.preventDefault();
        contactModal.style.display = 'block';
    });

    aboutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });

    emergencyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        emergencyModal.style.display = 'block';
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            contactModal.style.display = 'none';
            aboutModal.style.display = 'none';
            emergencyModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target == contactModal) {
            contactModal.style.display = 'none';
        }
        if (e.target == aboutModal) {
            aboutModal.style.display = 'none';
        }
        if (e.target == emergencyModal) {
            emergencyModal.style.display = 'none';
        }
    });

    // 3D floating elements animation enhancement
    const floatElements = document.querySelectorAll('.float-element');
    
    floatElements.forEach(element => {
        // Random starting positions
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        
        element.style.left = `${randomX}%`;
        element.style.top = `${randomY}%`;
        
        // Random animation duration
        const duration = 15 + Math.random() * 10;
        element.style.animationDuration = `${duration}s`;
    });

    // Action button hover effect
    const actionBtn = document.querySelector('.action-btn');
    
    actionBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 8px 25px rgba(42, 125, 225, 0.6)';
    });
    
    actionBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 20px rgba(42, 125, 225, 0.4)';
    });
});