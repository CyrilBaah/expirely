// Dashboard JavaScript for Expirely

// DOM Elements
const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const dashboardSearch = document.getElementById('dashboard-search');
const dashboardSearchBtn = document.getElementById('dashboard-search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const totalUrlsElement = document.getElementById('total-urls');
const expiringSoonElement = document.getElementById('expiring-soon');
const expiredElement = document.getElementById('expired');
const healthyElement = document.getElementById('healthy');
const recentChecksBody = document.getElementById('recent-checks-body');
const savedUrlsBody = document.getElementById('saved-urls-body');
const notificationsList = document.getElementById('notifications-list');
const urlDetailsModal = document.getElementById('url-details-modal');
const urlDetailsContent = document.getElementById('url-details-content');
const closeModalBtns = document.querySelectorAll('.close');

// Current user data
let currentUser = null;
let savedUrls = [];

// Initialize the dashboard
function init() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Event listeners
    logoutBtn.addEventListener('click', handleLogout);
    dashboardSearchBtn.addEventListener('click', searchUrl);
    refreshBtn.addEventListener('click', refreshData);
    
    // Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            urlDetailsModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === urlDetailsModal) {
            urlDetailsModal.style.display = 'none';
        }
    });
    
    // Load user data
    loadUserData();
}

// Check if user is logged in
function checkAuthStatus() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Update user info in sidebar
    userNameElement.textContent = currentUser.name;
    userEmailElement.textContent = currentUser.email;
}

// Load user data
function loadUserData() {
    // Load saved URLs
    savedUrls = JSON.parse(localStorage.getItem(`savedUrls_${currentUser.email}`)) || [];
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Populate tables
    populateRecentChecks();
    populateSavedUrls();
    
    // Generate notifications
    generateNotifications();
}

// Update dashboard stats
function updateDashboardStats() {
    let expiringSoon = 0;
    let expired = 0;
    let healthy = 0;
    
    savedUrls.forEach(url => {
        const sslDaysRemaining = url.ssl.daysRemaining;
        const domainDaysRemaining = url.domain.daysRemaining;
        
        if (sslDaysRemaining < 0 || domainDaysRemaining < 0) {
            expired++;
        } else if (sslDaysRemaining < 30 || domainDaysRemaining < 60) {
            expiringSoon++;
        } else {
            healthy++;
        }
    });
    
    totalUrlsElement.textContent = savedUrls.length;
    expiringSoonElement.textContent = expiringSoon;
    expiredElement.textContent = expired;
    healthyElement.textContent = healthy;
}

// Populate recent checks table
function populateRecentChecks() {
    // Sort by last checked date (most recent first)
    const recentUrls = [...savedUrls].sort((a, b) => {
        return new Date(b.lastChecked) - new Date(a.lastChecked);
    }).slice(0, 5); // Get only the 5 most recent
    
    if (recentUrls.length === 0) {
        recentChecksBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">No recent checks</td>
            </tr>
        `;
        return;
    }
    
    recentChecksBody.innerHTML = '';
    
    recentUrls.forEach(url => {
        const sslStatus = getStatusBadge(url.ssl.status, url.ssl.daysRemaining + ' days');
        const domainStatus = getStatusBadge(url.domain.status, url.domain.daysRemaining + ' days');
        const overallStatus = getOverallStatus(url);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${url.url}" target="_blank">${url.domain}</a></td>
            <td>${sslStatus}</td>
            <td>${domainStatus}</td>
            <td>${overallStatus}</td>
            <td>
                <div class="table-actions">
                    <button class="view-btn" data-url="${url.url}"><i class="fas fa-eye"></i></button>
                    <button class="delete-btn" data-url="${url.url}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        recentChecksBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addTableButtonListeners();
}

// Populate saved URLs table
function populateSavedUrls() {
    if (savedUrls.length === 0) {
        savedUrlsBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">No saved URLs</td>
            </tr>
        `;
        return;
    }
    
    savedUrlsBody.innerHTML = '';
    
    savedUrls.forEach(url => {
        const sslStatus = getStatusBadge(url.ssl.status, url.ssl.daysRemaining + ' days');
        const domainStatus = getStatusBadge(url.domain.status, url.domain.daysRemaining + ' days');
        const overallStatus = getOverallStatus(url);
        const lastChecked = new Date(url.lastChecked).toLocaleString();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${url.url}" target="_blank">${url.domain}</a></td>
            <td>${sslStatus}</td>
            <td>${domainStatus}</td>
            <td>${overallStatus}</td>
            <td>${lastChecked}</td>
            <td>
                <div class="table-actions">
                    <button class="view-btn" data-url="${url.url}"><i class="fas fa-eye"></i></button>
                    <button class="refresh-btn" data-url="${url.url}"><i class="fas fa-sync-alt"></i></button>
                    <button class="delete-btn" data-url="${url.url}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        savedUrlsBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addTableButtonListeners();
}

// Add event listeners to table buttons
function addTableButtonListeners() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const urlToView = btn.getAttribute('data-url');
            viewUrlDetails(urlToView);
        });
    });
    
    // Refresh buttons
    document.querySelectorAll('.refresh-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const urlToRefresh = btn.getAttribute('data-url');
            refreshUrl(urlToRefresh);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const urlToDelete = btn.getAttribute('data-url');
            deleteUrl(urlToDelete);
        });
    });
}

// Generate status badge HTML
function getStatusBadge(status, text) {
    let badgeClass = '';
    let icon = '';
    
    switch (status) {
        case 'valid':
            badgeClass = 'success';
            icon = 'check-circle';
            break;
        case 'expiring-soon':
            badgeClass = 'warning';
            icon = 'exclamation-triangle';
            break;
        case 'expired':
            badgeClass = 'danger';
            icon = 'times-circle';
            break;
        default:
            badgeClass = 'primary';
            icon = 'info-circle';
    }
    
    return `<span class="status-badge ${badgeClass}"><i class="fas fa-${icon}"></i> ${text}</span>`;
}

// Get overall status for a URL
function getOverallStatus(url) {
    if (url.ssl.daysRemaining < 0 || url.domain.daysRemaining < 0) {
        return getStatusBadge('expired', 'Expired');
    } else if (url.ssl.daysRemaining < 30 || url.domain.daysRemaining < 60) {
        return getStatusBadge('expiring-soon', 'Expiring Soon');
    } else {
        return getStatusBadge('valid', 'Healthy');
    }
}

// Generate notifications
function generateNotifications() {
    // Check for expiring URLs
    const expiringUrls = savedUrls.filter(url => 
        (url.ssl.daysRemaining > 0 && url.ssl.daysRemaining < 30) || 
        (url.domain.daysRemaining > 0 && url.domain.daysRemaining < 60)
    );
    
    // Check for expired URLs
    const expiredUrls = savedUrls.filter(url => 
        url.ssl.daysRemaining < 0 || url.domain.daysRemaining < 0
    );
    
    if (expiringUrls.length === 0 && expiredUrls.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }
    
    notificationsList.innerHTML = '';
    
    // Add expired notifications
    expiredUrls.forEach(url => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        let message = '';
        if (url.ssl.daysRemaining < 0) {
            message = `SSL certificate for ${url.domain} has expired!`;
        } else if (url.domain.daysRemaining < 0) {
            message = `Domain ${url.domain} has expired!`;
        }
        
        notificationItem.innerHTML = `
            <div class="notification-icon danger">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${message}</div>
                <div class="notification-time">Action required immediately</div>
            </div>
        `;
        
        notificationsList.appendChild(notificationItem);
    });
    
    // Add expiring soon notifications
    expiringUrls.forEach(url => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        let message = '';
        if (url.ssl.daysRemaining > 0 && url.ssl.daysRemaining < 30) {
            message = `SSL certificate for ${url.domain} expires in ${url.ssl.daysRemaining} days`;
        } else if (url.domain.daysRemaining > 0 && url.domain.daysRemaining < 60) {
            message = `Domain ${url.domain} expires in ${url.domain.daysRemaining} days`;
        }
        
        notificationItem.innerHTML = `
            <div class="notification-icon warning">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${message}</div>
                <div class="notification-time">Plan renewal soon</div>
            </div>
        `;
        
        notificationsList.appendChild(notificationItem);
    });
    
    // Update notification count
    const notificationCount = document.querySelector('.notification-count');
    notificationCount.textContent = expiringUrls.length + expiredUrls.length;
}

// View URL details
function viewUrlDetails(urlToView) {
    const urlData = savedUrls.find(url => url.url === urlToView);
    
    if (!urlData) {
        alert('URL not found');
        return;
    }
    
    const sslStatusClass = urlData.ssl.daysRemaining < 30 ? 'warning' : 'success';
    const domainStatusClass = urlData.domain.daysRemaining < 60 ? 'warning' : 'success';
    
    urlDetailsContent.innerHTML = `
        <div class="url-details-header">
            <h3><i class="fas fa-link"></i> ${urlData.url}</h3>
            <span class="last-checked">Last checked: ${new Date(urlData.lastChecked).toLocaleString()}</span>
        </div>
        
        <div class="url-details">
            <div class="url-detail-card">
                <h3><i class="fas fa-shield-alt"></i> SSL Certificate</h3>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value ${sslStatusClass}">
                        ${urlData.ssl.daysRemaining < 30 ? 
                            `<i class="fas fa-exclamation-triangle"></i> Expiring Soon (${urlData.ssl.daysRemaining} days)` : 
                            `<i class="fas fa-check-circle"></i> Valid (${urlData.ssl.daysRemaining} days remaining)`}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Issuer:</span>
                    <span class="detail-value">${urlData.ssl.issuer}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Valid From:</span>
                    <span class="detail-value">${urlData.ssl.validFrom}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Valid To:</span>
                    <span class="detail-value">${urlData.ssl.validTo}</span>
                </div>
            </div>
            
            <div class="url-detail-card">
                <h3><i class="fas fa-globe"></i> Domain Information</h3>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value ${domainStatusClass}">
                        ${urlData.domain.daysRemaining < 60 ? 
                            `<i class="fas fa-exclamation-triangle"></i> Expiring Soon (${urlData.domain.daysRemaining} days)` : 
                            `<i class="fas fa-check-circle"></i> Valid (${urlData.domain.daysRemaining} days remaining)`}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registrar:</span>
                    <span class="detail-value">${urlData.domain.registrar}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registered On:</span>
                    <span class="detail-value">${urlData.domain.registeredOn}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Expires On:</span>
                    <span class="detail-value">${urlData.domain.expiresOn}</span>
                </div>
            </div>
            
            <div class="url-detail-card">
                <h3><i class="fas fa-tachometer-alt"></i> Performance</h3>
                <div class="detail-item">
                    <span class="detail-label">Load Time:</span>
                    <span class="detail-value">${urlData.performance.loadTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Performance Score:</span>
                    <span class="detail-value ${urlData.performance.status === 'warning' ? 'warning' : 'success'}">
                        ${urlData.performance.score}/100
                    </span>
                </div>
                <div class="detail-item">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${urlData.performance.score}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="url-detail-card">
                <h3><i class="fas fa-lock"></i> Security</h3>
                <div class="detail-item">
                    <span class="detail-label">HTTPS:</span>
                    <span class="detail-value ${urlData.security.https ? 'success' : 'danger'}">
                        ${urlData.security.https ? '<i class="fas fa-check-circle"></i> Enabled' : '<i class="fas fa-times-circle"></i> Disabled'}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">HSTS:</span>
                    <span class="detail-value ${urlData.security.hsts ? 'success' : 'warning'}">
                        ${urlData.security.hsts ? '<i class="fas fa-check-circle"></i> Enabled' : '<i class="fas fa-times-circle"></i> Disabled'}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Security Score:</span>
                    <span class="detail-value ${urlData.security.status === 'warning' ? 'warning' : 'success'}">
                        ${urlData.security.score}/100
                    </span>
                </div>
                <div class="detail-item">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${urlData.security.score}%"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="url-details-actions">
            <button class="refresh-url-btn" data-url="${urlData.url}">Refresh Data</button>
            <button class="delete-url-btn danger" data-url="${urlData.url}">Delete URL</button>
        </div>
    `;
    
    // Add event listeners to buttons
    const refreshUrlBtn = urlDetailsContent.querySelector('.refresh-url-btn');
    const deleteUrlBtn = urlDetailsContent.querySelector('.delete-url-btn');
    
    refreshUrlBtn.addEventListener('click', () => {
        refreshUrl(urlToView);
        urlDetailsModal.style.display = 'none';
    });
    
    deleteUrlBtn.addEventListener('click', () => {
        deleteUrl(urlToView);
        urlDetailsModal.style.display = 'none';
    });
    
    // Show modal
    urlDetailsModal.style.display = 'block';
}

// Search for a URL
function searchUrl() {
    const url = dashboardSearch.value.trim();
    
    if (!url) {
        alert('Please enter a URL to check');
        return;
    }
    
    // Show loading state
    dashboardSearch.disabled = true;
    dashboardSearchBtn.disabled = true;
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        try {
            // Generate mock data
            const mockData = generateMockUrlData(url);
            
            // Save URL
            saveUrl(mockData);
            
            // Reset search
            dashboardSearch.value = '';
            dashboardSearch.disabled = false;
            dashboardSearchBtn.disabled = false;
            
            // Show URL details
            viewUrlDetails(mockData.url);
        } catch (error) {
            alert('Error checking URL: ' + error.message);
            dashboardSearch.disabled = false;
            dashboardSearchBtn.disabled = false;
        }
    }, 1500);
}

// Generate mock URL data (same as in main.js)
function generateMockUrlData(url) {
    // Clean up URL for display
    let cleanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        cleanUrl = 'https://' + url;
    }
    
    // Parse domain
    const domain = new URL(cleanUrl).hostname;
    
    // Generate random dates
    const today = new Date();
    
    // SSL expiry (between 1 month and 2 years from now)
    const sslExpiryDays = Math.floor(Math.random() * 700) + 30;
    const sslExpiry = new Date(today);
    sslExpiry.setDate(today.getDate() + sslExpiryDays);
    
    // Domain expiry (between 6 months and 5 years from now)
    const domainExpiryDays = Math.floor(Math.random() * 1500) + 180;
    const domainExpiry = new Date(today);
    domainExpiry.setDate(today.getDate() + domainExpiryDays);
    
    // Generate random performance scores
    const performanceScore = Math.floor(Math.random() * 40) + 60;
    const securityScore = Math.floor(Math.random() * 30) + 70;
    
    return {
        url: cleanUrl,
        domain: domain,
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
        lastChecked: new Date().toISOString()
    };
}

// Save URL
function saveUrl(urlData) {
    // Check if URL already exists
    const existingUrlIndex = savedUrls.findIndex(url => url.url === urlData.url);
    
    if (existingUrlIndex !== -1) {
        // Update existing URL
        savedUrls[existingUrlIndex] = urlData;
    } else {
        // Add new URL
        savedUrls.push(urlData);
    }
    
    // Save to localStorage
    localStorage.setItem(`savedUrls_${currentUser.email}`, JSON.stringify(savedUrls));
    
    // Update dashboard
    updateDashboardStats();
    populateRecentChecks();
    populateSavedUrls();
    generateNotifications();
}

// Refresh URL data
function refreshUrl(urlToRefresh) {
    const urlIndex = savedUrls.findIndex(url => url.url === urlToRefresh);
    
    if (urlIndex === -1) {
        alert('URL not found');
        return;
    }
    
    // Generate new mock data
    const newData = generateMockUrlData(urlToRefresh);
    
    // Update URL
    savedUrls[urlIndex] = newData;
    
    // Save to localStorage
    localStorage.setItem(`savedUrls_${currentUser.email}`, JSON.stringify(savedUrls));
    
    // Update dashboard
    updateDashboardStats();
    populateRecentChecks();
    populateSavedUrls();
    generateNotifications();
}

// Delete URL
function deleteUrl(urlToDelete) {
    if (!confirm('Are you sure you want to delete this URL?')) {
        return;
    }
    
    // Filter out the URL to delete
    savedUrls = savedUrls.filter(url => url.url !== urlToDelete);
    
    // Save to localStorage
    localStorage.setItem(`savedUrls_${currentUser.email}`, JSON.stringify(savedUrls));
    
    // Update dashboard
    updateDashboardStats();
    populateRecentChecks();
    populateSavedUrls();
    generateNotifications();
}

// Refresh all data
function refreshData() {
    // Show loading state
    refreshBtn.classList.add('spinning');
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        // Update all URLs with new data
        savedUrls = savedUrls.map(url => generateMockUrlData(url.url));
        
        // Save to localStorage
        localStorage.setItem(`savedUrls_${currentUser.email}`, JSON.stringify(savedUrls));
        
        // Update dashboard
        updateDashboardStats();
        populateRecentChecks();
        populateSavedUrls();
        generateNotifications();
        
        // Reset loading state
        refreshBtn.classList.remove('spinning');
    }, 1500);
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    dashboardSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active link
    sidebarLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.parentElement.classList.add('active');
        }
    });
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Add CSS for spinning refresh button
const style = document.createElement('style');
style.textContent = `
    #refresh-btn.spinning i {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.875rem;
    }
    
    .status-badge.success {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success-color);
    }
    
    .status-badge.warning {
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--warning-color);
    }
    
    .status-badge.danger {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--danger-color);
    }
    
    .status-badge.primary {
        background-color: rgba(79, 70, 229, 0.1);
        color: var(--primary-color);
    }
    
    .empty-table {
        text-align: center;
        padding: 2rem;
        color: var(--text-light);
    }
    
    .url-details-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .url-details-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    .url-details-actions button {
        padding: 0.5rem 1rem;
    }
    
    .refresh-url-btn {
        background-color: var(--primary-color);
        color: white;
    }
    
    .delete-url-btn {
        background-color: var(--danger-color);
        color: white;
    }
    
    .last-checked {
        color: var(--text-light);
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
