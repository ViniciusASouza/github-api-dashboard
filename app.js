//Section 1 — Config
const TOKEN = 'YOU_TOKEN_HERE';
const API_BASE = 'https://api.github.com';  


//Section 2 — Element references
const loginBtn    = document.querySelector('#login-btn');
const profileSec  = document.querySelector('#profile');
const reposSec    = document.querySelector('#repos');
const avatarImg   = document.querySelector('#avatar');
const usernameEl  = document.querySelector('#username');
const bioEl       = document.querySelector('#bio');
const repoCountEl = document.querySelector('#repo-count');
const repoList    = document.querySelector('#repo-list');
const errorBox    = document.querySelector('#error-box');
const jsonOutput  = document.querySelector('#json-output');
const jsonSection = document.querySelector('#json-viewer');



//Section 3 — Helper functions

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
}

function hideError() {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
}

function showJSON(data) {
    jsonOutput.textContent = JSON.stringify(data, null, 2);
    jsonSection.classList.remove('hidden');
}



//Section 4 — fetchProfile function

async function fetchProfile() {
    hideError();

    let response;

    try {
        response = await fetch(`${API_BASE}/users`, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${TOKEN}`,'Accept': 'application/vnd.github+json'}
        });    
    } catch (error) {
        showError(`Network error — could not reach the API. Check the URL and your connection. ${error.message}`);
        return;
    }

    if (response.status === 401) {
        showError('401 Unauthorized — Token is missing, invalid, or expired.');
        return;
    }
    if (response.status === 403) {
        showError('403 Forbidden — Token does not have the required permissions.');
        return;
    }
    if (response.status === 429) {
        showError('429 Too Many Requests — Rate limit exceeded. Try again later.');
        return;
    }
    if (!response.ok) {
        showError(`Unexpected error: ${response.status} — ${response.statusText}`);
        return;
    }

    const data = await response.json();

    showJSON(data);

    avatarImg.src             = data.avatar_url;
    usernameEl.textContent    = data.name || data.login;
    bioEl.textContent         = data.bio || 'No bio set';
    repoCountEl.textContent   = `Public repositories: ${data.public_repos}`;

    profileSec.classList.remove('hidden');

    fetchRepos();
}




//Section 5 — fetchRepos function

async function fetchRepos() {

    const response = await fetch(`${API_BASE}/user/repos?sort=updated&per_page=10`, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Accept': 'application/vnd.github+json'
        }
    });

    if (!response.ok) {
        showError(`Failed to load repos: ${response.status}`);
        return;
    }

    const repos = await response.json();

    showJSON(repos);

    repoList.innerHTML = '';

    repos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';

        card.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || 'No description'}</p>
            <div class='repo-meta'>
                <span>Language: ${repo.language || 'N/A'}</span>
                <span>Stars: ${repo.stargazers_count}</span>
                <span>Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
        `;

        repoList.appendChild(card);
    });

    reposSec.classList.remove('hidden');
}




//Section 6 — Event listener (very last line)

loginBtn.addEventListener('click', fetchProfile);