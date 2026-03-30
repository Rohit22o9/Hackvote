// 🗳️ HACKVOTE DASHBOARD LOGIC (Google Apps Script Version)
const GAS_URL = "https://script.google.com/macros/s/AKfycbyfL-ANFGJGF7O8ZpFrDSoa_Wmj6Kyy39DzbSEv1tQvx_BCXCj61MwgWezmCFWAFLva9Q/exec"; // Update this with your deployed URL

document.addEventListener('DOMContentLoaded', () => {
    const studentPRN = localStorage.getItem("student_prn");
    if (!studentPRN) {
        window.location.href = "login.html";
        return;
    }
    
    const displayPRN = document.getElementById('display-prn');
    if (displayPRN) displayPRN.innerText = localStorage.getItem("student_name") || studentPRN;
    
    // Display student info (Targeting direct IDs from dashboard.html)
    const branchEl = document.getElementById('displayBranch');
    const yearEl = document.getElementById('displayYear');
    if(branchEl) branchEl.innerText = `Branch: ${localStorage.getItem("student_branch") || 'N/A'}`;
    if(yearEl) yearEl.innerText = `Year: ${localStorage.getItem("student_year") || 'N/A'}`;

    // Search bar functionality
    const searchInput = document.getElementById('search-projects');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.project-card').forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(term) ? "" : "none";
            });
        });
    }

    loadTeams();
    updateVotingProgress();
});

// 📋 LOAD TEAMS FROM GOOGLE SHEETS
async function loadTeams() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    try {
        container.innerHTML = `<div class="loader-container" style="grid-column: 1/-1; text-align: center; padding: 50px;"><div class="complex-loader" style="margin: 0 auto;"></div><p style="margin-top: 15px; color: var(--text-muted);">Loading projects...</p></div>`;

        const response = await fetch(`${GAS_URL}?action=getProjects`);
        const data = await response.json();

        if (data.status === "success") {
            container.innerHTML = ""; 
            const projects = data.projects;

            if (projects.length === 0) {
                container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: var(--text-muted);">No projects found.</p>`;
                return;
            }

            projects.forEach(project => {
                // Handle different header naming (teamname vs teamName)
                project.teamName = project.teamName || project.teamname || "Unknown Team";
                project.title = project.title || "Untitled Project";
                
                const card = createProjectCard(project);
                container.appendChild(card);
            });
            
            updateProgress(projects.length);
        } else {
            showToast("Failed to load projects.", "error");
        }
    } catch (error) {
        console.error("Error loading projects:", error);
        showToast("Error connecting to Google Sheets.", "error");
    }
}

// 🗂️ CREATE PROJECT CARD
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card staggered-entry';
    card.id = `card-${project.id}`;
    
    const votedList = JSON.parse(localStorage.getItem('voted_list') || "[]");
    const hasVoted = votedList.includes(project.id.toString());
    
    card.innerHTML = `
        <div class="team-badge">Team: ${project.teamName}</div>
        <h3 style="margin-bottom: 5px;">${project.title}</h3>
        <p style="font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-bottom: 20px;">
            Theme: ${project.theme || 'General'}
        </p>
        
        <div class="vote-actions" id="actions-${project.id}">
            <button class="vote-btn best" onclick="selectRating('${project.id}', 'best', this)" title="Best">
                <i class="fas fa-crown"></i><span class="btn-label">Best</span>
            </button>
            <button class="vote-btn good" onclick="selectRating('${project.id}', 'good', this)" title="Good">
                <i class="fas fa-star"></i><span class="btn-label">Good</span>
            </button>
            <button class="vote-btn moderate" onclick="selectRating('${project.id}', 'moderate', this)" title="Moderate">
                <i class="fas fa-thumbs-up"></i><span class="btn-label">Moderate</span>
            </button>
        </div>
        
        <div id="selection-status-${project.id}" style="margin-top: 15px; text-align: center; height: 1.2rem;">
            <span class="selected-text" style="font-size: 0.8rem; font-weight: 700; color: var(--primary); display: none;">
                Selected: <span class="rating-label"></span>
            </span>
        </div>

        <button class="btn btn-primary submit-vote-btn" onclick="handleVoteSubmit('${project.id}')" style="margin-top: 15px; width: 100%; border-radius: 10px; font-weight: 700;">
            Submit Vote
        </button>
    `;

    if (hasVoted) setTimeout(() => applyVotedState(project.id), 0);
    return card;
}

const selections = {};
function selectRating(id, rating, element) {
    selections[id] = rating;
    element.parentElement.querySelectorAll('.vote-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    const statusContainer = document.getElementById(`selection-status-${id}`);
    if (statusContainer) {
        statusContainer.querySelector('.selected-text').style.display = 'inline-block';
        statusContainer.querySelector('.rating-label').innerText = rating.toUpperCase();
    }
}

async function handleVoteSubmit(id) {
    const rating = selections[id];
    if (!rating) return showToast("Please select a rating first!", "error");

    try {
        const prn = localStorage.getItem("student_prn");
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({ 
                action: "vote", 
                prn: prn, 
                projectId: id, 
                voteType: rating 
            })
        });

        const result = await response.json();
        if (result.status === "success") {
            showToast("Vote Shared Successfully!", "success");
            
            // Local persistence update
            const votedList = JSON.parse(localStorage.getItem('voted_list') || "[]");
            votedList.push(id.toString());
            localStorage.setItem('voted_list', JSON.stringify(votedList));
            
            applyVotedState(id);
            updateVotingProgress();
        } else {
            showToast(result.message, "error");
        }
    } catch (error) {
        showToast("Connection Error. Try again.", "error");
    }
}

function applyVotedState(id) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;
    const actions = card.querySelector('.vote-actions');
    const submitBtn = card.querySelector('.submit-vote-btn');
    const status = card.querySelector(`#selection-status-${id}`);
    
    if (actions) actions.innerHTML = `<div style="background: #dcfce7; color: #166534; padding: 12px; border-radius: 8px; font-weight: 700; text-align: center; width: 100%;"><i class="fas fa-check-circle"></i> Vote Recorded</div>`;
    if (submitBtn) submitBtn.remove();
    if (status) status.remove();
}

function updateProgress(total) {
    const votedList = JSON.parse(localStorage.getItem('voted_list') || "[]");
    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.innerText = `${votedList.length} / ${total} Projects Voted`;
    
    const progressBar = document.getElementById('progress-indicator');
    if (progressBar && total > 0) {
        progressBar.style.width = `${(votedList.length / total) * 100}%`;
    }
}

function updateVotingProgress() {
    fetch(`${GAS_URL}?action=getProjects`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") updateProgress(data.projects.length);
        });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Global functions for HTML access
window.handleVoteSubmit = handleVoteSubmit;
window.selectRating = selectRating;
window.filterTeams = function() {
    const filter = document.getElementById('search-projects').value.toLowerCase();
    document.querySelectorAll('.project-card').forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const team = card.querySelector('.team-badge').innerText.toLowerCase();
        card.style.display = (title.includes(filter) || team.includes(filter)) ? "" : "none";
    });
};
