// Admin Dashboard JavaScript for Expirely

// DOM Elements
const adminNameElement = document.getElementById('admin-name');
const adminEmailElement = document.getElementById('admin-email');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminRefreshBtn = document.getElementById('admin-refresh-btn');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const totalUsersElement = document.getElementById('total-users');
const newUsersElement = document.getElementById('new-users');
const adminTotalUrlsElement = document.getElementById('admin-total-urls');
const checksTodayElement = document.getElementById('checks-today');
const recentActivityBody = document.getElementById('recent-activity-body');
const systemAlerts = document.getElementById('system-alerts');
const usersTableBody = document.getElementById('users-table-body');
const userSearch = document.getElementById('user-search');
const userSearchBtn = document.getElementById('user-search-btn');
const userDetailsModal = document.getElementById('user-details-modal');
const userDetailsContent = document.getElementById('user-details-content');
const closeModalBtns = document.querySelectorAll('.close');

// Admin data
let adminUser = null;
let users = [];
let allUrls = [];
let userActivity = [];

// Initialize the admin dashboard
function init() {
    // Check if admin is logged in
    checkAdminStatus();
    
    // Event listeners
    adminLogoutBtn.addEventListener('click', handleLogout);
    adminRefreshBtn.addEventListener('click', refreshData);
    userSearchBtn.addEventListener('click', searchUsers);
    
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
            userDetailsModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === userDetailsModal) {
            userDetailsModal.style.display = 'none';
        }
    });
    
    // Load admin data
    loadAdminData();
}

// Check if admin is logged in
function checkAdminStatus() {
    adminUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!adminUser || !adminUser.isAdmin) {
        // Redirect to login page if not admin
        window.location.href = 'index.html';
        return;
    }
    
    // Update admin info in sidebar
    adminNameElement.textContent = adminUser.name;
    adminEmailElement.textContent = adminUser.email;
}

// Load admin data
function loadAdminData() {
    // Load users
    users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Load all URLs for all users
    allUrls = [];
    users.forEach(user => {
        const userUrls = JSON.parse(localStorage.getItem(`savedUrls_${user.email}`)) || [];
        allUrls = [...allUrls, ...userUrls];
    });
    
    // Generate mock user activity
    generateMockUserActivity();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Populate tables and lists
    populateRecentActivity();
    populateSystemAlerts();
    populateUsersTable();
    
    // Initialize charts
    initializeCharts();
}

// Generate mock user activity
function generateMockUserActivity() {
    userActivity = [];
    
    // Get random users
    const activityUsers = users.length > 0 ? users : [{ name: 'Demo User', email: 'demo@example.com' }];
    
    // Generate activities
    const activities = [
        'logged in',
        'added a new URL',
        'updated profile',
        'checked URL expiry',
        'deleted a URL',
        'changed password'
    ];
    
    // Generate random timestamps for today
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
        const user = activityUsers[Math.floor(Math.random() * activityUsers.length)];
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const hours = Math.floor(Math.random() * 12);
        const minutes = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(today);
        timestamp.setHours(today.getHours() - hours);
        timestamp.setMinutes(today.getMinutes() - minutes);
        
        userActivity.push({
            user: user.name,
            email: user.email,
            action: activity,
            timestamp: timestamp.toISOString()
        });
    }
    
    // Sort by timestamp (most recent first)
    userActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Update dashboard stats
function updateDashboardStats() {
    // Count total users
    totalUsersElement.textContent = users.length;
    
    // Count new users in the last 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const newUsers = users.filter(user => {
        return new Date(user.registeredOn) > last24Hours;
    }).length;
    
    newUsersElement.textContent = newUsers;
    
    // Count total URLs
    adminTotalUrlsElement.textContent = allUrls.length;
    
    // Count checks today (mock data)
    checksTodayElement.textContent = Math.floor(Math.random() * 50) + 10;
}

// Populate recent activity
function populateRecentActivity() {
    if (userActivity.length === 0) {
        recentActivityBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-table">No recent activity</td>
            </tr>
        `;
        return;
    }
    
    recentActivityBody.innerHTML = '';
    
    // Show only the 5 most recent activities
    const recentActivities = userActivity.slice(0, 5);
    
    recentActivities.forEach(activity => {
        const row = document.createElement('tr');
        const timestamp = new Date(activity.timestamp);
        
        row.innerHTML = `
            <td>${activity.user}</td>
            <td>${activity.action}</td>
            <td>${timestamp.toLocaleTimeString()}</td>
        `;
        
        recentActivityBody.appendChild(row);
    });
}

// Populate system alerts
function populateSystemAlerts() {
    // Generate mock system alerts
    const mockAlerts = [
        {
            title: 'System Update Scheduled',
            message: 'A system update is scheduled for tomorrow at 2:00 AM UTC. Expect brief downtime.',
            time: '2 hours ago',
            type: 'info'
        },
        {
            title: 'High CPU Usage Detected',
            message: 'The system detected unusually high CPU usage. Monitoring the situation.',
            time: '1 day ago',
            type: 'warning'
        }
    ];
    
    if (mockAlerts.length === 0) {
        systemAlerts.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>No system alerts</p>
            </div>
        `;
        return;
    }
    
    systemAlerts.innerHTML = '';
    
    mockAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alert.type}`;
        
        alertItem.innerHTML = `
            <div class="alert-header">
                <div class="alert-title">
                    ${alert.type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' : 
                      alert.type === 'danger' ? '<i class="fas fa-exclamation-circle"></i>' : 
                      '<i class="fas fa-info-circle"></i>'}
                    ${alert.title}
                </div>
                <div class="alert-time">${alert.time}</div>
            </div>
            <div class="alert-message">${alert.message}</div>
        `;
        
        systemAlerts.appendChild(alertItem);
    });
}

// Populate users table
function populateUsersTable() {
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">No users registered</td>
            </tr>
        `;
        return;
    }
    
    usersTableBody.innerHTML = '';
    
    users.forEach((user, index) => {
        const userUrls = JSON.parse(localStorage.getItem(`savedUrls_${user.email}`)) || [];
        const registeredDate = new Date(user.registeredOn || new Date()).toLocaleDateString();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${registeredDate}</td>
            <td>${userUrls.length}</td>
            <td><span class="status-badge active">Active</span></td>
            <td>
                <div class="table-actions">
                    <button class="view-btn" data-email="${user.email}"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" data-email="${user.email}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-email="${user.email}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addTableButtonListeners();
}

// Add event listeners to table buttons
function addTableButtonListeners() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userEmail = btn.getAttribute('data-email');
            viewUserDetails(userEmail);
        });
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userEmail = btn.getAttribute('data-email');
            editUser(userEmail);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userEmail = btn.getAttribute('data-email');
            deleteUser(userEmail);
        });
    });
}

// View user details
function viewUserDetails(userEmail) {
    const user = users.find(u => u.email === userEmail);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    const userUrls = JSON.parse(localStorage.getItem(`savedUrls_${user.email}`)) || [];
    const registeredDate = new Date(user.registeredOn || new Date()).toLocaleDateString();
    
    userDetailsContent.innerHTML = `
        <div class="user-details-header">
            <div class="user-details-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details-info">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
                <p>Registered: ${registeredDate}</p>
            </div>
            <div class="user-details-actions">
                <button class="suspend-btn">Suspend User</button>
                <button class="delete-btn" data-email="${user.email}">Delete User</button>
            </div>
        </div>
        
        <div class="user-details-content">
            <div class="user-details-card">
                <h4><i class="fas fa-link"></i> URLs (${userUrls.length})</h4>
                ${userUrls.length > 0 ? `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>URL</th>
                                    <th>Status</th>
                                    <th>Last Checked</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userUrls.map(url => `
                                    <tr>
                                        <td>${url.domain}</td>
                                        <td>${getStatusBadge(getUrlStatus(url))}</td>
                                        <td>${new Date(url.lastChecked).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-link"></i>
                        <p>No URLs saved</p>
                    </div>
                `}
            </div>
            
            <div class="user-details-card">
                <h4><i class="fas fa-history"></i> Recent Activity</h4>
                ${getUserActivity(user.email).length > 0 ? `
                    <div class="activity-list">
                        ${getUserActivity(user.email).map(activity => `
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-circle"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-action">${activity.action}</div>
                                    <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>No recent activity</p>
                    </div>
                `}
            </div>
        </div>
    `;
    
    // Add event listener to delete button
    const deleteBtn = userDetailsContent.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        deleteUser(userEmail);
        userDetailsModal.style.display = 'none';
    });
    
    // Add event listener to suspend button
    const suspendBtn = userDetailsContent.querySelector('.suspend-btn');
    suspendBtn.addEventListener('click', () => {
        alert('User suspension feature not implemented in this demo');
    });
    
    // Show modal
    userDetailsModal.style.display = 'block';
}

// Get user activity
function getUserActivity(userEmail) {
    return userActivity.filter(activity => activity.email === userEmail);
}

// Get URL status
function getUrlStatus(url) {
    if (url.ssl.daysRemaining < 0 || url.domain.daysRemaining < 0) {
        return 'expired';
    } else if (url.ssl.daysRemaining < 30 || url.domain.daysRemaining < 60) {
        return 'expiring-soon';
    } else {
        return 'valid';
    }
}

// Generate status badge HTML
function getStatusBadge(status) {
    let badgeClass = '';
    let text = '';
    let icon = '';
    
    switch (status) {
        case 'valid':
            badgeClass = 'success';
            text = 'Healthy';
            icon = 'check-circle';
            break;
        case 'expiring-soon':
            badgeClass = 'warning';
            text = 'Expiring Soon';
            icon = 'exclamation-triangle';
            break;
        case 'expired':
            badgeClass = 'danger';
            text = 'Expired';
            icon = 'times-circle';
            break;
        case 'active':
            badgeClass = 'active';
            text = 'Active';
            icon = 'check-circle';
            break;
        case 'inactive':
            badgeClass = 'inactive';
            text = 'Inactive';
            icon = 'times-circle';
            break;
        default:
            badgeClass = 'primary';
            text = status;
            icon = 'info-circle';
    }
    
    return `<span class="status-badge ${badgeClass}"><i class="fas fa-${icon}"></i> ${text}</span>`;
}

// Edit user
function editUser(userEmail) {
    alert('User editing feature not implemented in this demo');
}

// Delete user
function deleteUser(userEmail) {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
        return;
    }
    
    // Remove user from users array
    users = users.filter(user => user.email !== userEmail);
    
    // Save updated users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Remove user's saved URLs
    localStorage.removeItem(`savedUrls_${userEmail}`);
    
    // Update dashboard
    loadAdminData();
    
    alert('User deleted successfully');
}

// Search users
function searchUsers() {
    const searchTerm = userSearch.value.trim().toLowerCase();
    
    if (!searchTerm) {
        populateUsersTable();
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">No users match your search</td>
            </tr>
        `;
        return;
    }
    
    usersTableBody.innerHTML = '';
    
    filteredUsers.forEach((user, index) => {
        const userUrls = JSON.parse(localStorage.getItem(`savedUrls_${user.email}`)) || [];
        const registeredDate = new Date(user.registeredOn || new Date()).toLocaleDateString();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${registeredDate}</td>
            <td>${userUrls.length}</td>
            <td><span class="status-badge active">Active</span></td>
            <td>
                <div class="table-actions">
                    <button class="view-btn" data-email="${user.email}"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" data-email="${user.email}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-email="${user.email}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addTableButtonListeners();
}

// Initialize charts
function initializeCharts() {
    // This is a placeholder for chart initialization
    // In a real application, you would use a library like Chart.js
    
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="mock-chart">
                <div class="mock-chart-bars">
                    <div class="mock-chart-bar" style="height: 30%"></div>
                    <div class="mock-chart-bar" style="height: 50%"></div>
                    <div class="mock-chart-bar" style="height: 70%"></div>
                    <div class="mock-chart-bar" style="height: 60%"></div>
                    <div class="mock-chart-bar" style="height: 80%"></div>
                    <div class="mock-chart-bar" style="height: 40%"></div>
                    <div class="mock-chart-bar" style="height: 60%"></div>
                </div>
                <div class="mock-chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        `;
    });
    
    // Add CSS for mock charts
    if (!document.getElementById('chart-styles')) {
        const style = document.createElement('style');
        style.id = 'chart-styles';
        style.textContent = `
            .mock-chart {
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 1rem;
            }
            
            .mock-chart-bars {
                flex: 1;
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                margin-bottom: 1rem;
            }
            
            .mock-chart-bar {
                width: 30px;
                background: linear-gradient(to top, var(--primary-color), var(--primary-light));
                border-radius: 4px 4px 0 0;
            }
            
            .mock-chart-labels {
                display: flex;
                justify-content: space-between;
                color: var(--text-light);
                font-size: 0.75rem;
            }
            
            .activity-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .activity-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .activity-item:last-child {
                border-bottom: none;
            }
            
            .activity-icon {
                color: var(--primary-color);
                font-size: 0.5rem;
                padding-top: 0.5rem;
            }
            
            .activity-content {
                flex: 1;
            }
            
            .activity-time {
                font-size: 0.875rem;
                color: var(--text-light);
            }
        `;
        document.head.appendChild(style);
    }
}

// Refresh all data
function refreshData() {
    // Show loading state
    adminRefreshBtn.classList.add('spinning');
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        // Reload admin data
        loadAdminData();
        
        // Reset loading state
        adminRefreshBtn.classList.remove('spinning');
    }, 1000);
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
    #admin-refresh-btn.spinning i {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize the admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
