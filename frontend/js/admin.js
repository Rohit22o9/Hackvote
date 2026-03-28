// Admin dashboard logic (admin.js)
const projectsTable = document.getElementById('admin-projects-table');
const leaderboardList = document.getElementById('leaderboard-list');
const totalProjectsCount = document.getElementById('total-projects');
const totalVotesCount = document.getElementById('total-votes');
const bestVotesCount = document.getElementById('best-votes');
const leaderTitle = document.getElementById('top-project-title');

// Modal Elements
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');

let allProjects = [];
let votingChart = null;

const getHost = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
           ? 'http://127.0.0.1:5000' : '';
};

// Initialize admin dashboard
async function init() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        await Promise.all([
            fetchProjects(),
            fetchLeaderboard()
        ]);
        
        // Initial Chart loading after we have projects data
        renderAnalytics();
    } catch (err) {
        showToast('Error loading admin data.', 'error');
    }
}

// Fetch all projects for management table
async function fetchProjects() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${getHost()}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
        allProjects = await res.json();
        renderProjectsTable(allProjects);
        updateStats(allProjects);
    }
}

// Fetch leaderboard data for top 5/leader list
async function fetchLeaderboard() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${getHost()}/api/projects/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
        const stats = await res.json();
        renderLeaderboard(stats.slice(0, 5));
        if (stats.length > 0) {
            leaderTitle.textContent = `#1 ${stats[0].title.substring(0, 20)}...`;
        }
    }
}

// Render the project list for management
function renderProjectsTable(projects) {
    projectsTable.innerHTML = projects.map(p => {
        const total = p.votes.best + p.votes.good + p.votes.moderate;
        return `
            <tr style="border-bottom: 1px solid var(--glass-border); font-size: 0.95rem;">
                <td style="padding: 15px;">
                    <strong>${p.title}</strong><br>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">${p.teamName}</span>
                </td>
                <td style="padding: 15px; color: #22c55e;">${p.votes.best}</td>
                <td style="padding: 15px; color: #eab308;">${p.votes.good}</td>
                <td style="padding: 15px; color: #ef4444;">${p.votes.moderate}</td>
                <td style="padding: 15px; font-weight: 700;">${total}</td>
                <td style="padding: 15px;">
                  <button onclick="editProject('${p._id}')" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.75rem; border-color: #38bdf8; color: #38bdf8">Edit</button>
                  <button onclick="deleteProject('${p._id}')" class="btn btn-outline" style="padding: 5px 12px; font-size: 0.75rem; border-color: #f87171; color: #f87171">Del</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Render top leaderboard entries
function renderLeaderboard(topProjects) {
    leaderboardList.innerHTML = topProjects.map((p, index) => {
        const trophy = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index+1}`;
        return `
            <div class="leaderboard-item">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.2rem; font-weight: 900; width: 30px;">${trophy}</span>
                    <div>
                        <div style="font-weight: 600;">${p.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.teamName}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #22c55e; font-weight: 700; font-size: 1.1rem;">${p.bestCount}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">BEST VOTES</div>
                </div>
            </div>
        `;
    }).join('');
}

// Analytics and Charts (Chart.js)
function renderAnalytics() {
    const ctx = document.getElementById('votingChart').getContext('2d');
    
    // Aggregated votes across all projects
    const totals = allProjects.reduce((acc, p) => ({
        best: acc.best + p.votes.best,
        good: acc.good + p.votes.good,
        moderate: acc.moderate + p.votes.moderate
    }), { best: 0, good: 0, moderate: 0 });

    if (votingChart) votingChart.destroy();

    votingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Best', 'Good', 'Moderate'],
            datasets: [{
                data: [totals.best, totals.good, totals.moderate],
                backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                hoverOffset: 15,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 14 } } }
            }
        }
    });

    totalVotesCount.textContent = totals.best + totals.good + totals.moderate;
    bestVotesCount.textContent = totals.best;
}

// Stats summary bar
function updateStats(projects) {
    totalProjectsCount.textContent = projects.length;
}

// Project Management CRUD Functions
function editProject(id) {
    const project = allProjects.find(p => p._id === id);
    if (!project) return;
    
    document.getElementById('project-id').value = project._id;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-team').value = project.teamName;
    document.getElementById('project-description').value = project.description;
    
    modalTitle.textContent = "Edit Project Entry";
    projectModal.style.display = "flex";
}

async function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project? This will remove all associated votes.")) return;
    
    const token = localStorage.getItem('token');
    const res = await fetch(`${getHost()}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        showToast('Project deleted successfully.', 'success');
        fetchProjects();
    }
}

// Modal Handlers
document.getElementById('add-project-btn').addEventListener('click', () => {
    projectForm.reset();
    document.getElementById('project-id').value = "";
    modalTitle.textContent = "Add New Hackathon Entry";
    projectModal.style.display = "flex";
});

closeModal.onclick = () => projectModal.style.display = "none";
window.onclick = (e) => { if (e.target === projectModal) projectModal.style.display = "none"; };

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('project-id').value;
    const projectData = {
        title: document.getElementById('project-title').value,
        teamName: document.getElementById('project-team').value,
        description: document.getElementById('project-description').value
    };

    const url = id ? `${getHost()}/api/projects/${id}` : `${getHost()}/api/projects`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });

        if (res.ok) {
            showToast(id ? 'Project updated!' : 'Project added successfully!', 'success');
            projectModal.style.display = "none";
            fetchProjects();
        } else {
            showToast('Failed to save project data.', 'error');
        }
    } catch (err) {
        showToast('Connection failed during save.', 'error');
    }
});

// Logout handler
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// Helper for UI
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Run init
init();
