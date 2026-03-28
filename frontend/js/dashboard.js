// Student dashboard logic (dashboard.js)
const projectsGrid = document.getElementById('projects-grid');
const searchInput = document.getElementById('search-projects');
const progressIndicator = document.getElementById('progress-indicator');
const progressText = document.getElementById('progress-text');
const displayPrn = document.getElementById('display-prn');

let allProjects = [];
let votedProjectsIds = [];

const getHost = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
           ? 'http://127.0.0.1:5000' : '';
};

// Initialize dashboard
async function init() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const prn = localStorage.getItem('prn');

    if (!token || role !== 'student') {
        window.location.href = 'login.html';
        return;
    }

    displayPrn.textContent = prn;

    // Fetch user votes and all projects in parallel
    try {
        const [votesRes, projectsRes] = await Promise.all([
            fetch(`${getHost()}/api/votes/my-votes`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${getHost()}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (votesRes.ok) votedProjectsIds = await votesRes.json();
        if (projectsRes.ok) allProjects = await projectsRes.json();

        renderProjects(allProjects);
        updateProgress();
    } catch (err) {
        showToast('Failed to load dashboard data. Check your connection.', 'error');
    }
}

// Render dynamic project cards with staggered animation
function renderProjects(projects) {
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="staggered-entry" style="grid-column: 1/-1; padding: 80px; text-align: center; background: white; border: 1px solid var(--border-color); border-radius: 24px; box-shadow: var(--surface-shadow);">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 20px; opacity: 0.2;"></i>
                <h3 style="color: var(--text-main); font-weight: 800;">No projects found</h3>
                <p style="color: var(--text-muted);">Try different keywords or browse all teams.</p>
            </div>`;
        return;
    }

    projectsGrid.innerHTML = projects.map((project, index) => {
        const hasVoted = votedProjectsIds.includes(project._id);
        const delay = (index % 12) * 0.05; // Stagger effect
        
        return `
            <div class="project-card staggered-entry ${hasVoted ? 'voted' : ''}" 
                 id="project-${project._id}" 
                 style="animation-delay: ${delay}s">
                <div class="team-badge"><i class="fas fa-users" style="margin-right: 6px;"></i> ${project.teamName || 'Team Unknown'}</div>
                <h3>${project.title}</h3>
                <p class="project-desc">${project.description.substring(0, 140)}${project.description.length > 140 ? '...' : ''}</p>
                
                <div class="vote-actions" id="actions-${project._id}">
                    <button class="vote-btn best ${hasVoted ? 'disabled' : ''}" 
                            onclick="handleVote('${project._id}', 'best')" ${hasVoted ? 'disabled' : ''}>
                        <i class="fas fa-award"></i>
                        <span class="btn-label">Best</span>
                    </button>
                    <button class="vote-btn good ${hasVoted ? 'disabled' : ''}" 
                            onclick="handleVote('${project._id}', 'good')" ${hasVoted ? 'disabled' : ''}>
                        <i class="fas fa-thumbs-up"></i>
                        <span class="btn-label">Good</span>
                    </button>
                    <button class="vote-btn moderate ${hasVoted ? 'disabled' : ''}" 
                            onclick="handleVote('${project._id}', 'moderate')" ${hasVoted ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                        <span class="btn-label">Moderate</span>
                    </button>
                </div>
                ${hasVoted ? `
                    <div class="voted-msg">
                        <i class="fas fa-check-circle"></i> VOTE RECORDED
                    </div>` : ''}
            </div>
        `;
    }).join('');
}

// Handle project voting
async function handleVote(projectId, voteType) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${getHost()}/api/votes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ projectId, voteType })
        });

        const data = await res.json();
        if (res.ok) {
            showToast(`Vote recorded as "${voteType.toUpperCase()}"!`, 'success');
            
            // UI State Update
            votedProjectsIds.push(projectId);
            updateVoteUI(projectId, voteType);
            updateProgress();
        } else {
            showToast(data.message || 'Error submitting vote', 'error');
        }
    } catch (err) {
        showToast('Connection error during voting.', 'error');
    }
}

// Update specific project UI after vote
function updateVoteUI(projectId, voteType) {
    const actionsDiv = document.getElementById(`actions-${projectId}`);
    const card = document.getElementById(`project-${projectId}`);
    
    if (actionsDiv && card) {
        card.classList.add('voted');
        actionsDiv.innerHTML = `
            <button class="vote-btn best disabled" disabled><i class="fas fa-award"></i><span class="btn-label">Best</span></button>
            <button class="vote-btn good disabled" disabled><i class="fas fa-thumbs-up"></i><span class="btn-label">Good</span></button>
            <button class="vote-btn moderate disabled" disabled><i class="fas fa-check"></i><span class="btn-label">Moderate</span></button>
        `;
        const votedMsg = document.createElement('div');
        votedMsg.className = "voted-msg";
        votedMsg.innerHTML = `<i class="fas fa-check-circle"></i> VOTE RECORDED`;
        card.appendChild(votedMsg);
    }
}

// Update voting progress bar with percentage animation
function updateProgress() {
    const total = 70; // Hardcoded requirement
    const voted = votedProjectsIds.length;
    const percent = Math.round((voted / total) * 100);
    
    progressIndicator.style.width = `${percent}%`;
    progressText.innerText = `${voted} / ${total} teams supported`;
    
    const percentEl = document.getElementById('progress-percent-text');
    if (percentEl) {
        percentEl.innerText = `${percent}%`;
    }
}

// Search filtering logic
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allProjects.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.teamName.toLowerCase().includes(query)
    );
    renderProjects(filtered);
});

// Logout handler (inherited via main but we redefine for safety)
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

// Initialize
init();
