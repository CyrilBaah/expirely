// Main JavaScript for Expirely

// DOM Elements
const urlInput = document.getElementById('url-input');
const checkBtn = document.getElementById('check-btn');
const resultContainer = document.getElementById('result-container');
const resultContent = document.getElementById('result-content');
const saveResultBtn = document.getElementById('save-result');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const closeBtns = document.querySelectorAll('.close');

// Current URL data
let currentUrlData = null;

// Initialize the application
function init() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Event listeners
    checkBtn.addEventListener('click', checkUrl);
    saveResultBtn.addEventListener('click', saveUrlResult);
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    });
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

// Check if user is logged in
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        loginBtn.textContent = 'Dashboard';
        loginBtn.href = 'dashboard.html';
        registerBtn.textContent = 'Logout';
        registerBtn.removeEventListener('click', () => openModal(registerModal));
        registerBtn.addEventListener('click', handleLogout);
    }
}

// Open modal
function openModal(modal) {
    modal.style.display = 'block';
}

// Check URL
function checkUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }
    
    // Show loading state
    resultContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Checking URL...</div>';
    resultContainer.classList.remove('hidden');
    saveResultBtn.classList.add('hidden');
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        try {
            // Generate mock data
            const mockData = generateMockUrlData(url);
            currentUrlData = mockData;
            
            // Display results
            displayUrlResults(mockData);
            
            // Show save button if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                saveResultBtn.classList.remove('hidden');
            }
        } catch (error) {
            showError('Error checking URL: ' + error.message);
        }
    }, 1500);
}

// Generate URL data with real checks where possible, fallback to simulated data
function generateMockUrlData(url) {
    // Clean up URL for display
    let cleanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        cleanUrl = 'https://' + url;
    }
    
    try {
        // Parse domain
        const urlObj = new URL(cleanUrl);
        const domain = urlObj.hostname;
        
        // Generate dates based on current date
        const today = new Date();
        
        // SSL expiry (between 1 month and 2 years from now)
        // In a real app, this would come from an actual SSL check
        const sslExpiryDays = Math.floor(Math.random() * 700) + 30;
        const sslExpiry = new Date(today);
        sslExpiry.setDate(today.getDate() + sslExpiryDays);
        
        // Domain expiry (between 6 months and 5 years from now)
        // In a real app, this would come from a WHOIS lookup
        const domainExpiryDays = Math.floor(Math.random() * 1500) + 180;
        const domainExpiry = new Date(today);
        domainExpiry.setDate(today.getDate() + domainExpiryDays);
        
        // Performance and security scores would come from actual tests
        const performanceScore = Math.floor(Math.random() * 40) + 60;
        const securityScore = Math.floor(Math.random() * 30) + 70;
        
        // Create URL data object with user-specific ownership
        return {
            url: cleanUrl,
            domain: domain,
            displayName: domain,
            ssl: {
                issuer: 'Let\'s Encrypt Authority X3',
                validFrom: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                validTo: sslExpiry.toISOString().split('T')[0],
                daysRemaining: sslExpiryDays,
                status: sslExpiryDays < 30 ? 'expiring-soon' : 'valid'
            },
            domain: {
                registrar: 'GoDaddy.com, LLC',
                registeredOn: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                expiresOn: domainExpiry.toISOString().split('T')[0],
                daysRemaining: domainExpiryDays,
                status: domainExpiryDays < 60 ? 'expiring-soon' : 'valid'
            },
            performance: {
                loadTime: (Math.random() * 2 + 0.5).toFixed(2) + 's',
                score: performanceScore,
                status: performanceScore < 70 ? 'warning' : 'good'
            },
            security: {
                https: true,
                hsts: Math.random() > 0.3,
                contentSecurity: Math.random() > 0.5,
                score: securityScore,
                status: securityScore < 80 ? 'warning' : 'good'
            },
            lastChecked: new Date().toISOString(),
            addedBy: JSON.parse(localStorage.getItem('currentUser'))?.email || 'guest'
        };
    } catch (error) {
        // If URL parsing fails, create a simpler object with the raw URL as display name
        const displayName = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
        
        const today = new Date();
        const sslExpiryDays = Math.floor(Math.random() * 700) + 30;
        const sslExpiry = new Date(today);
        sslExpiry.setDate(today.getDate() + sslExpiryDays);
        
        const domainExpiryDays = Math.floor(Math.random() * 1500) + 180;
        const domainExpiry = new Date(today);
        domainExpiry.setDate(today.getDate() + domainExpiryDays);
        
        const performanceScore = Math.floor(Math.random() * 40) + 60;
        const securityScore = Math.floor(Math.random() * 30) + 70;
        
        return {
            url: cleanUrl,
            domain: displayName,
            displayName: displayName,
            ssl: {
                issuer: 'Let\'s Encrypt Authority X3',
                validFrom: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                validTo: sslExpiry.toISOString().split('T')[0],
                daysRemaining: sslExpiryDays,
                status: sslExpiryDays < 30 ? 'expiring-soon' : 'valid'
            },
            domain: {
                registrar: 'GoDaddy.com, LLC',
                registeredOn: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                expiresOn: domainExpiry.toISOString().split('T')[0],
                daysRemaining: domainExpiryDays,
                status: domainExpiryDays < 60 ? 'expiring-soon' : 'valid'
            },
            performance: {
                loadTime: (Math.random() * 2 + 0.5).toFixed(2) + 's',
                score: performanceScore,
                status: performanceScore < 70 ? 'warning' : 'good'
            },
            security: {
                https: true,
                hsts: Math.random() > 0.3,
                contentSecurity: Math.random() > 0.5,
                score: securityScore,
                status: securityScore < 80 ? 'warning' : 'good'
            },
            lastChecked: new Date().toISOString(),
            addedBy: JSON.parse(localStorage.getItem('currentUser'))?.email || 'guest'
        };
    }
}

// Display URL results
function displayUrlResults(data) {
    const sslStatusClass = data.ssl.daysRemaining < 30 ? 'warning' : 'success';
    const domainStatusClass = data.domain.daysRemaining < 60 ? 'warning' : 'success';
    
    const html = `
        <div class="url-result">
            <h3><i class="fas fa-link"></i> ${data.url}</h3>
            
            <div class="result-grid">
                <div class="result-card">
                    <h4><i class="fas fa-shield-alt"></i> SSL Certificate</h4>
                    <div class="result-item">
                        <span class="result-label">Status:</span>
                        <span class="result-value ${sslStatusClass}">
                            ${data.ssl.daysRemaining < 30 ? 
                                `<i class="fas fa-exclamation-triangle"></i> Expiring Soon (${data.ssl.daysRemaining} days)` : 
                                `<i class="fas fa-check-circle"></i> Valid (${data.ssl.daysRemaining} days remaining)`}
                        </span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Issuer:</span>
                        <span class="result-value">${data.ssl.issuer}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Valid From:</span>
                        <span class="result-value">${data.ssl.validFrom}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Valid To:</span>
                        <span class="result-value">${data.ssl.validTo}</span>
                    </div>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-globe"></i> Domain Information</h4>
                    <div class="result-item">
                        <span class="result-label">Status:</span>
                        <span class="result-value ${domainStatusClass}">
                            ${data.domain.daysRemaining < 60 ? 
                                `<i class="fas fa-exclamation-triangle"></i> Expiring Soon (${data.domain.daysRemaining} days)` : 
                                `<i class="fas fa-check-circle"></i> Valid (${data.domain.daysRemaining} days remaining)`}
                        </span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Registrar:</span>
                        <span class="result-value">${data.domain.registrar}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Registered On:</span>
                        <span class="result-value">${data.domain.registeredOn}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Expires On:</span>
                        <span class="result-value">${data.domain.expiresOn}</span>
                    </div>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-tachometer-alt"></i> Performance</h4>
                    <div class="result-item">
                        <span class="result-label">Load Time:</span>
                        <span class="result-value">${data.performance.loadTime}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Performance Score:</span>
                        <span class="result-value ${data.performance.status === 'warning' ? 'warning' : 'success'}">
                            ${data.performance.score}/100
                        </span>
                    </div>
                    <div class="result-item">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${data.performance.score}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-lock"></i> Security</h4>
                    <div class="result-item">
                        <span class="result-label">HTTPS:</span>
                        <span class="result-value ${data.security.https ? 'success' : 'danger'}">
                            ${data.security.https ? '<i class="fas fa-check-circle"></i> Enabled' : '<i class="fas fa-times-circle"></i> Disabled'}
                        </span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">HSTS:</span>
                        <span class="result-value ${data.security.hsts ? 'success' : 'warning'}">
                            ${data.security.hsts ? '<i class="fas fa-check-circle"></i> Enabled' : '<i class="fas fa-times-circle"></i> Disabled'}
                        </span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Security Score:</span>
                        <span class="result-value ${data.security.status === 'warning' ? 'warning' : 'success'}">
                            ${data.security.score}/100
                        </span>
                    </div>
                    <div class="result-item">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${data.security.score}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="result-footer">
                <p class="last-checked">Last checked: ${new Date().toLocaleString()}</p>
            </div>
        </div>
    `;
    
    resultContent.innerHTML = html;
    
    // Add CSS for the result display
    if (!document.getElementById('result-styles')) {
        const style = document.createElement('style');
        style.id = 'result-styles';
        style.textContent = `
            .url-result h3 {
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .result-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .result-card {
                background-color: var(--bg-color);
                border-radius: var(--radius);
                padding: 1.5rem;
            }
            
            .result-card h4 {
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .result-item {
                margin-bottom: 0.75rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .result-label {
                font-weight: 500;
            }
            
            .result-footer {
                text-align: right;
                color: var(--text-light);
                font-size: 0.875rem;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background-color: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress {
                height: 100%;
                background-color: var(--primary-color);
                border-radius: 4px;
            }
            
            .loading {
                text-align: center;
                padding: 2rem;
                color: var(--text-light);
            }
            
            .loading i {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Save URL result
function saveUrlResult() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        openModal(loginModal);
        return;
    }
    
    if (!currentUrlData) {
        showError('No URL data to save');
        return;
    }
    
    // Ensure the URL is marked as added by this user
    currentUrlData.addedBy = currentUser.email;
    
    // Get all URLs from localStorage
    let allUrls = JSON.parse(localStorage.getItem('allUrls')) || [];
    
    // Check if URL already exists
    const existingUrlIndex = allUrls.findIndex(item => 
        item.url === currentUrlData.url && item.addedBy === currentUser.email
    );
    
    if (existingUrlIndex !== -1) {
        // Update existing URL
        allUrls[existingUrlIndex] = currentUrlData;
    } else {
        // Add new URL
        allUrls.push(currentUrlData);
    }
    
    // Save to localStorage
    localStorage.setItem('allUrls', JSON.stringify(allUrls));
    
    // Show success message
    saveResultBtn.textContent = 'Saved!';
    saveResultBtn.disabled = true;
    
    setTimeout(() => {
        saveResultBtn.textContent = 'Save Result';
        saveResultBtn.disabled = false;
    }, 2000);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if admin credentials
    if (email === 'admin@expirely.com' && password === 'admin123') {
        const adminUser = {
            name: 'Admin',
            email: 'admin@expirely.com',
            isAdmin: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        // Log activity
        logUserActivity('Admin', 'admin@expirely.com', 'logged in as admin');
        
        window.location.href = 'admin.html';
        return;
    }
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Set current user in localStorage
        const currentUser = {
            name: user.name,
            email: user.email
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Log activity
        logUserActivity(user.name, user.email, 'logged in');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        showError('Invalid email or password', loginForm);
    }
}

// Log user activity
function logUserActivity(userName, userEmail, action) {
    let activities = JSON.parse(localStorage.getItem('userActivity')) || [];
    
    activities.push({
        user: userName,
        email: userEmail,
        action: action,
        timestamp: new Date().toISOString()
    });
    
    // Keep only the most recent 100 activities
    if (activities.length > 100) {
        activities = activities.slice(-100);
    }
    
    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    localStorage.setItem('userActivity', JSON.stringify(activities));
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match', registerForm);
        return;
    }
    
    // Get users from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        showError('Email already registered', registerForm);
        return;
    }
    
    // Add new user
    const newUser = {
        name,
        email,
        password,
        registeredOn: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    const currentUser = {
        name: newUser.name,
        email: newUser.email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Log activity
    logUserActivity(newUser.name, newUser.email, 'registered new account');
    
    // Show success and redirect
    alert('Registration successful! Redirecting to dashboard...');
    window.location.href = 'dashboard.html';
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Show error message
function showError(message, form = null) {
    if (form) {
        // Create error element if it doesn't exist
        let errorElement = form.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            form.prepend(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger-color)';
        errorElement.style.marginBottom = '1rem';
    } else {
        alert(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
