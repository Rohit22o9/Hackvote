// Dashboard Logic for HackVote
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

/**
 * Loads project teams from the backend.
 * Currently, this is a placeholder function for API integration.
 */
async function loadProjects() {
    console.log("Fetching projects...");
}

/**
 * Prepares and sends a vote for a specific team.
 * @param {string} team_id - The ID of the team being rated.
 * @param {string} rating - The selected rating (Best, Good, Average, Bad).
 */
async function submitVote(team_id, rating) {
    const student_name = localStorage.getItem('student_name');

    if (!student_name) {
        showToast('You must be logged in to vote.', 'error');
        window.location.href = 'login.html';
        return;
    }

    if (!rating) {
        showToast('Please select a rating before submitting.', 'error');
        return;
    }

    // JSON payload to be sent to /vote
    const payload = {
        student_name: student_name,
        team_id: team_id,
        rating: rating
    };

    console.log("Submitting Vote Payload:", payload);
    showToast(`Rating submitted for Team ${team_id}!`, 'success');

    /* 
       Later: Send POST request to /vote
       
       try {
           const response = await fetch('/api/vote', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
           });
           
           if (response.ok) {
               showToast('Vote cast successfully!', 'success');
           } else {
               showToast('Failed to submit vote.', 'error');
           }
       } catch (err) {
           console.error('Vote Error:', err);
           showToast('Connection error.', 'error');
       }
    */
}

/**
 * Helper to create a project card (to be used when dynamic rendering is implemented)
 */
function createProjectCard(team) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <span class="team-name">${team.team_name}</span>
        <h3>${team.project_name}</h3>
        
        <div class="rating-group">
            <label class="rating-option">
                <input type="radio" name="rating_${team.id}" value="Best"> Best
            </label>
            <label class="rating-option">
                <input type="radio" name="rating_${team.id}" value="Good"> Good
            </label>
            <label class="rating-option">
                <input type="radio" name="rating_${team.id}" value="Average"> Average
            </label>
            <label class="rating-option">
                <input type="radio" name="rating_${team.id}" value="Bad"> Bad
            </label>
        </div>
        
        <button class="btn btn-primary btn-submit" onclick="handleCardSubmit('${team.id}')">
            Submit Rating
        </button>
    `;
    return card;
}

/**
 * Handles the submit button click specifically for dynamic cards
 */
function handleCardSubmit(team_id) {
    const selectedRadio = document.querySelector(`input[name="rating_${team_id}"]:checked`);
    if (selectedRadio) {
        submitVote(team_id, selectedRadio.value);
    } else {
        showToast('Please select a rating.', 'error');
    }
}
