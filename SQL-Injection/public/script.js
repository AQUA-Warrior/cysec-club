let authToken = null;
let currentUser = null;

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        verifyToken();
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            currentUser = data;
            localStorage.setItem('authToken', authToken);

            document.querySelector('.login-container').style.display = 'none';

            if (data.role === 'admin') {
                showAdminDashboard();
            } else {
                showMemberDashboard();
            }
        } else {
            errorMsg.textContent = data.message || 'Invalid credentials';
            errorMsg.style.display = 'block';
        }
    } catch {
        errorMsg.textContent = 'Connection error. Please try again.';
        errorMsg.style.display = 'block';
    }
});

async function verifyToken() {
    try {
        const response = await fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            document.querySelector('.login-container').style.display = 'none';

            if (currentUser.role === 'admin') {
                showAdminDashboard();
            } else {
                showMemberDashboard();
            }
        } else {
            localStorage.removeItem('authToken');
        }
    } catch {
        localStorage.removeItem('authToken');
    }
}

async function showMemberDashboard() {
    document.getElementById('memberDashboard').style.display = 'block';
    document.getElementById('memberUsername').textContent = currentUser.username;

    try {
        const response = await fetch('/api/member/data', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('memberSince').textContent = new Date(data.memberSince).toLocaleDateString();
            document.getElementById('lastLogin').textContent = new Date(data.lastLogin).toLocaleString();
            document.getElementById('membershipLevel').textContent = data.membershipLevel;
            document.getElementById('points').textContent = data.points.toLocaleString();

            const achievementsList = document.getElementById('achievements');
            achievementsList.innerHTML = '';
            data.achievements.forEach(achievement => {
                const li = document.createElement('li');
                li.textContent = achievement;
                achievementsList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error loading member data:', error);
    }
}

async function showAdminDashboard() {
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminUsername').textContent = currentUser.username;

    try {
        const response = await fetch('/api/admin/system', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            const systemInfo = document.getElementById('systemInfo');
            systemInfo.innerHTML = `
                <div class="system-info-item">
                    <strong>Server Uptime</strong>
                    ${Math.floor(data.serverUptime / 60)} minutes
                </div>
                <div class="system-info-item">
                    <strong>Node Version</strong>
                    ${data.nodeVersion}
                </div>
                <div class="system-info-item">
                    <strong>Platform</strong>
                    ${data.platform}
                </div>
                <div class="system-info-item">
                    <strong>Hostname</strong>
                    ${data.hostname}
                </div>
                <div class="system-info-item">
                    <strong>CPU Cores</strong>
                    ${data.cpus}
                </div>
                <div class="system-info-item">
                    <strong>Memory Usage</strong>
                    ${Math.round((data.totalMemory - data.freeMemory) / 1024 / 1024 / 1024 * 10) / 10} GB / ${Math.round(data.totalMemory / 1024 / 1024 / 1024 * 10) / 10} GB
                </div>
                <div class="system-info-item">
                    <strong>Server Time</strong>
                    ${new Date(data.serverTime).toLocaleString()}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading system info:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const users = await response.json();
            const usersList = document.getElementById('usersList');
            const usersTable = document.getElementById('usersTable');

            usersList.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.password}</td>
                    <td><span class="role-badge ${user.role}">${user.role}</span></td>
                `;
                usersList.appendChild(tr);
            });

            usersTable.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;

    document.getElementById('memberDashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
    document.querySelector('.login-container').style.display = 'flex';

    document.getElementById('loginForm').reset();
    document.getElementById('error-message').style.display = 'none';
}