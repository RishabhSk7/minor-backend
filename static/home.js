document.addEventListener('DOMContentLoaded', function() {
    const appLogos = document.querySelectorAll('.app-logo');
    const appCards = document.querySelectorAll('.app-card');
    const cardsContainer = document.getElementById('appCards');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const logosContainer = document.getElementById('appLogos');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginFormContent = document.getElementById('loginFormContent');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');
    const launchNotification = document.getElementById('launchNotification');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationText = document.getElementById('notificationText');
    
    let currentIndex = 0;
    const totalApps = appLogos.length;
    let currentApp = 'reddit'; // Track current app for login

    // App login forms data with logo URLs and protocol handlers
    const appForms = {
        reddit: {
            title: "Reddit Login",
            logo: "https://logo.clearbit.com/reddit.com",
            fields: [
                { label: "Username", type: "text", placeholder: "Enter your Reddit username" },
                { label: "Password", type: "password", placeholder: "Enter your password" }
            ],
            footer: "Don't have an account? <a href='#'>Sign up</a>",
            socialLogin: true,
            protocol: "reddit://", // Custom protocol for Reddit desktop app
            exePath: "C:\\Program Files\\Reddit\\Reddit.exe", // Example path (would be different per user)
            launchMessage: "Launching Reddit with your credentials..."
        },
        instagram: {
            title: "Instagram",
            subtitle: "Log in to see photos and videos from your friends",
            logo: "https://logo.clearbit.com/instagram.com",
            fields: [
                { label: "Phone, username, or email", type: "text", placeholder: "Phone, username, or email" },
                { label: "Password", type: "password", placeholder: "Password" }
            ],
            footer: "Forgot password? <a href='#'>Get help signing in</a>",
            socialLogin: true,
            protocol: "instagram://",
            exePath: "C:\\Program Files\\Instagram\\Instagram.exe",
            launchMessage: "Opening Instagram desktop app..."
        },
        whatsapp: {
            title: "WhatsApp",
            subtitle: "Send and receive messages with no fees",
            logo: "https://logo.clearbit.com/whatsapp.com",
            fields: [
                { label: "Phone number", type: "tel", placeholder: "Enter phone number with country code" },
                { label: "Password", type: "password", placeholder: "Enter your password" }
            ],
            footer: "Trouble logging in? <a href='#'>Get help</a>",
            socialLogin: false,
            protocol: "whatsapp://",
            exePath: "C:\\Program Files\\WhatsApp\\WhatsApp.exe",
            launchMessage: "Starting WhatsApp with your account..."
        },
        twitter: {
            title: "Twitter",
            subtitle: "See what's happening in the world right now",
            logo: "https://logo.clearbit.com/twitter.com",
            fields: [
                { label: "Phone, email, or username", type: "text", placeholder: "Phone, email, or username" },
                { label: "Password", type: "password", placeholder: "Password" }
            ],
            footer: "Forgot password? <a href='#'>Reset it</a> | <a href='#'>Sign up for Twitter</a>",
            socialLogin: true,
            protocol: "twitter://",
            exePath: "C:\\Program Files\\Twitter\\Twitter.exe",
            launchMessage: "Launching Twitter desktop application..."
        },
        facebook: {
            title: "Facebook",
            subtitle: "Connect with friends and the world around you",
            logo: "https://logo.clearbit.com/facebook.com",
            fields: [
                { label: "Email or phone number", type: "text", placeholder: "Email or phone number" },
                { label: "Password", type: "password", placeholder: "Password" }
            ],
            footer: "Forgotten account? <a href='#'>Find your account</a>",
            socialLogin: false,
            protocol: "facebook://",
            exePath: "C:\\Program Files\\Facebook\\Facebook.exe",
            launchMessage: "Opening Facebook Messenger..."
        },
        telegram: {
            title: "Telegram",
            subtitle: "Fast and secure messaging",
            logo: "https://logo.clearbit.com/telegram.org",
            fields: [
                { label: "Phone number", type: "tel", placeholder: "Enter phone number with country code" },
                { label: "Password", type: "password", placeholder: "Enter your password" }
            ],
            footer: "Need help? <a href='#'>Visit support</a>",
            socialLogin: false,
            protocol: "tg://",
            exePath: "C:\\Program Files\\Telegram\\Telegram.exe",
            launchMessage: "Starting Telegram desktop client..."
        }
    };

    // Generate login form with logo and enhanced styling
    function generateLoginForm(app) {
        currentApp = app; // Set the current app
        const formData = appForms[app];
        let formHTML = `
            <div class="form-header">
                <img src="${formData.logo}" alt="${app} Logo" class="form-logo">
                <h2 class="form-title">${formData.title}</h2>
                ${formData.subtitle ? `<p class="form-subtitle">${formData.subtitle}</p>` : ''}
            </div>
            <form class="login-form" id="loginForm">
        `;
        
        formData.fields.forEach(field => {
            formHTML += `
                <div class="form-group">
                    <label>${field.label}</label>
                    <input type="${field.type}" placeholder="${field.placeholder || ''}" required>
                </div>
            `;
        });
        
        formHTML += `
                <button type="submit" class="login-btn">Log In</button>
            </form>
        `;
        
        if (formData.socialLogin) {
            formHTML += `
                <div class="divider">OR</div>
                <div class="social-login">
                    <div class="social-btn">
                        <img src="https://logo.clearbit.com/google.com" alt="Google">
                    </div>
                    <div class="social-btn">
                        <img src="https://logo.clearbit.com/facebook.com" alt="Facebook">
                    </div>
                    <div class="social-btn">
                        <img src="https://logo.clearbit.com/apple.com" alt="Apple">
                    </div>
                </div>
            `;
        }
        
        formHTML += `
            <p class="form-footer">${formData.footer}</p>
        `;
        
        return formHTML;
    }

    // Show login modal with animation
    function showLoginForm(app) {
        loginFormContent.innerHTML = generateLoginForm(app);
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add submit handler after form is generated
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin(app);
            });
        }
    }

    // Handle login submission
    function handleLogin(app) {
        const formData = appForms[app];
        
        // Show launching notification
        notificationIcon.src = formData.logo;
        notificationText.textContent = formData.launchMessage;
        launchNotification.classList.add('show');
        
        // Close the modal
        closeLoginModal();
        
        // Simulate launching the desktop app (in a real app, this would actually launch it)
        setTimeout(() => {
            simulateAppLaunch(app);
        }, 1500);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            launchNotification.classList.remove('show');
        }, 3000);
    }

    // Simulate launching the desktop app
    function simulateAppLaunch(app) {
        const formData = appForms[app];
        
        // In a real implementation, you would:
        // 1. Try to launch using the custom protocol (works for web apps)
        // window.location.href = formData.protocol;
        
        // 2. For Electron apps or desktop apps, you would use a bridge to the native system
        // For example, in Electron you might use:
        // const { shell } = require('electron');
        // shell.openPath(formData.exePath);
        
        // 3. For this demo, we'll just show an alert
        console.log(`Attempting to launch ${app} desktop app...`);
        console.log(`Protocol: ${formData.protocol}`);
        console.log(`Executable path: ${formData.exePath}`);
        
        // For demonstration purposes, we'll show an alert
        alert(`The ${app} desktop app would now launch with your credentials.\n\nIn a real implementation, this would:\n1. Validate your credentials\n2. Launch the desktop app\n3. Pass your login information securely`);
    }

    // Close modal
    function closeLoginModal() {
        loginModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    closeModal.addEventListener('click', closeLoginModal);

    // Close modal when clicking outside or pressing Escape
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLoginModal();
        }
    });

    // Update active logo and slide to corresponding card
    function updateActiveLogo(index) {
        appLogos.forEach(logo => logo.classList.remove('active'));
        appLogos[index].classList.add('active');
        
        // Center the active logo in the container
        const logo = appLogos[index];
        const containerWidth = logosContainer.offsetWidth;
        const logoLeft = logo.offsetLeft;
        const logoWidth = logo.offsetWidth;
        
        logosContainer.scrollTo({
            left: logoLeft - (containerWidth / 2) + (logoWidth / 2),
            behavior: 'smooth'
        });
    }

    // Slide to specific card
    function slideTo(index) {
        if (index < 0) index = totalApps - 1;
        if (index >= totalApps) index = 0;
        
        currentIndex = index;
        cardsContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateActiveLogo(currentIndex);
    }

    // Click on logo to slide to corresponding card
    appLogos.forEach(logo => {
        logo.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            slideTo(index);
        });
    });

    // Click on card to show login form
    appCards.forEach(card => {
        card.addEventListener('click', function() {
            const app = this.getAttribute('data-app');
            showLoginForm(app);
        });
    });

    // Navigation arrows
    prevBtn.addEventListener('click', () => slideTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => slideTo(currentIndex + 1));

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            slideTo(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            slideTo(currentIndex + 1);
        }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    cardsContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    cardsContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        if (touchEndX < touchStartX) {
            slideTo(currentIndex + 1); // Swipe left
        }
        if (touchEndX > touchStartX) {
            slideTo(currentIndex - 1); // Swipe right
        }
    }

    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on overlay
    overlay.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        this.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Initialize
    updateActiveLogo(0);
});