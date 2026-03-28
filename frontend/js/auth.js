const getHost = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
           ? 'http://127.0.0.1:5000' : '';
};

const studentLoginForm = document.getElementById('student-login-form');
const adminLoginForm = document.getElementById('admin-login-form');

// Student Login logic
if (studentLoginForm) {
    studentLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prn = document.getElementById('prn').value;

        try {
            const res = await fetch(`${getHost()}/api/auth/student-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prn })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('prn', data.user.prn);
                localStorage.setItem('role', 'student');
                
                showToast('Login Successful! Welcome back.', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1000);
            } else {
                showToast(data.message || 'Login failed', 'error');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            showToast('Connection error connecting to server.', 'error');
        }
    });
}

// Admin Login logic
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${getHost()}/api/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', 'admin');
                localStorage.setItem('adminEmail', data.admin.email);
                
                showToast('Admin Access Granted! Loading Dashboard...', 'success');
                setTimeout(() => window.location.href = 'admin.html', 1000);
            } else {
                showToast(data.message || 'Invalid admin credentials', 'error');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            showToast('Server connection failed.', 'error');
        }
    });
}

// Reuse main.js utility since it might not be loaded in these login pages yet
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
    }, 3000);
}
