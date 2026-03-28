// Common utilities for the HackVote app
const API_BASE = '/api';

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// Check logged in status for students
function checkStudentAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'student') {
        window.location.href = 'login.html';
    }
    return token;
}

// Check logged in status for admins
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
        window.location.href = 'admin-login.html';
    }
    return token;
}

// Handle Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// Expose globally
window.showToast = showToast;
window.API_BASE = API_BASE;
window.checkStudentAuth = checkStudentAuth;
window.checkAdminAuth = checkAdminAuth;
