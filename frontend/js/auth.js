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

// Student Signup logic
async function signupStudent(event) {
    if (event) event.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const branch = document.getElementById('branch').value;
    const year = document.getElementById('year').value;
    const prn = document.getElementById('prn').value;
    const confirmPrn = document.getElementById('confirmPrn').value;

    let isValid = true;

    // Reset error messages and alerts
    const generalErr = document.getElementById('general-error');
    if (generalErr) generalErr.style.display = 'none';

    // Validation
    if (!fullName || !branch || !year || !prn || !confirmPrn) {
        if (generalErr) {
            generalErr.innerText = "All fields must be filled";
            generalErr.style.display = 'block';
        } else {
            showToast('All fields must be filled', 'error');
        }
        isValid = false;
    } else if (prn !== confirmPrn) {
        if (generalErr) {
            generalErr.innerText = "PRNs do not match";
            generalErr.style.display = 'block';
        } else {
            showToast('PRN and Confirm PRN must match', 'error');
        }
        isValid = false;
    }

    if (!isValid) return;

    // Store student information temporarily in localStorage
    localStorage.setItem("student_name", fullName);
    localStorage.setItem("student_branch", branch);
    localStorage.setItem("student_year", year);
    
    showToast('Account created! Please login.', 'success');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Student Login logic for the login page
async function loginStudent(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('fullName');
    const prnInput = document.getElementById('prn');
    const name = nameInput ? nameInput.value.trim() : "";
    const prn = prnInput ? prnInput.value.trim() : "";

    // Reset error messages and alerts
    const generalErr = document.getElementById('general-error');
    if (generalErr) generalErr.style.display = 'none';

    // Validation
    if (!name || !prn) {
        if (generalErr) {
            generalErr.innerText = "Please enter both name and PRN";
            generalErr.style.display = 'block';
        } else {
            showToast('Please enter both name and PRN', 'error');
        }
        return;
    }

    // Store the student name in localStorage if not already stored
    if (!localStorage.getItem("student_name")) {
        localStorage.setItem("student_name", name);
    }

    // Mock successful login and redirect
    showToast('Login Successful!', 'success');
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
}

// Expose signupStudent and loginStudent globally
window.signupStudent = signupStudent;
window.loginStudent = loginStudent;
