// 🗳️ HACKVOTE AUTH LOGIC (Google Apps Script Version)
const GAS_URL = "https://script.google.com/macros/s/AKfycbz8R7p-ktGo-l5aAwC-GlkZTmWXqa68IzE_tOj7fjAfBkvYzibPbiRP2lx9NhtT85fz7w/exec"; // Update this with your deployed URL

// Multi-step signup state
let isOtpSent = false;

// Toast Utility
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

// 📧 SEND OTP FLOW
async function sendOtp() {
    const email = document.getElementById('email').value.trim();
    if (!email) return showToast("Email is required!", "error");
    
    const sendBtn = document.getElementById('send-otp-btn');
    if(sendBtn) sendBtn.innerText = "Sending...";

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "sendOtp", email: email })
        });
        const data = await response.json();
        
        if (data.status === "success") {
            showToast("OTP sent to your email!", "success");
            isOtpSent = true;
            const signupBtn = document.getElementById('signup-submit-btn');
            if(signupBtn) signupBtn.disabled = false;
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Error sending OTP. Please try again.", "error");
    } finally {
        if(sendBtn) sendBtn.innerText = "Send OTP";
    }
}

// 👤 STUDENT SIGNUP
async function signupStudent(event) {
    if (event) event.preventDefault();
    if (!isOtpSent) return showToast("Please verify OTP first!", "error");

    const payload = {
        action: "signup",
        name: document.getElementById('fullName').value.trim(),
        branch: document.getElementById('branch').value.trim(),
        year: document.getElementById('year').value.trim(),
        prn: document.getElementById('prn').value.trim(),
        email: document.getElementById('email').value.trim(),
        otp: document.getElementById('otp-input').value.trim()
    };

    try {
        const res = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === "success") {
            showToast("Account created successfully!", "success");
            setTimeout(() => window.location.href = '../login.html', 1500);
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Signup failed. Server error.", "error");
    }
}

// 🔑 STUDENT LOGIN
async function loginStudent(event) {
    if (event) event.preventDefault();
    const prnEl = document.getElementById('prn');
    if(!prnEl) return;
    const prn = prnEl.value.trim();

    try {
        const res = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "login", prn: prn })
        });
        const data = await res.json();

        if (data.status === "success") {
            localStorage.setItem('student_prn', data.prn);
            localStorage.setItem('student_name', data.name);
            localStorage.setItem('student_branch', data.branch);
            localStorage.setItem('student_year', data.year);
            localStorage.setItem('voted_list', JSON.stringify(data.votedProjects));
            
            showToast("Login Successful!", "success");
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Login failed. Check connection.", "error");
    }
}

// Global Exports
window.sendOtp = sendOtp;
window.signupStudent = signupStudent;
window.loginStudent = loginStudent;