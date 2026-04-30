let players = JSON.parse(localStorage.getItem('gamePlayers')) || ["Thắng", "Thùy", "Hiệp", "Kiên", "Hồng"];
let roundsHistory = JSON.parse(localStorage.getItem('gameScores')) || [];

function init() {
    renderInputForm();
    renderHistoryHeader();
    renderSettingsForm();
    updateResults();
    updateHistoryTable();
}

function renderInputForm() {
    const container = document.getElementById("input-form");
    container.innerHTML = "";
    players.forEach(player => {
        const div = document.createElement("div");
        div.className = "input-group";
        div.innerHTML = `
            <label>${player}</label>
            <div class="stepper">
                <button type="button" class="btn-step" onclick="changeScore('${player}', -1)">-</button>
                <input type="number" id="score-${player}" value="0">
                <button type="button" class="btn-step" onclick="changeScore('${player}', 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    });
    document.getElementById("round-number").innerText = roundsHistory.length + 1;
}

function changeScore(player, amount) {
    const input = document.getElementById(`score-${player}`);
    let currentVal = parseInt(input.value) || 0;
    input.value = currentVal + amount;
}

function renderHistoryHeader() {
    const header = document.getElementById("history-header");
    if (!header) return;
    header.innerHTML = "<th>Vòng</th>";
    players.forEach(player => {
        const th = document.createElement("th");
        th.innerText = player;
        header.appendChild(th);
    });
}

function renderSettingsForm() {
    const container = document.getElementById("settings-form");
    container.innerHTML = "";
    players.forEach((player, index) => {
        const div = document.createElement("div");
        div.className = "settings-group";
        div.innerHTML = `<input type="text" id="player-name-${index}" value="${player}" placeholder="Nhập tên người chơi ${index + 1}">`;
        container.appendChild(div);
    });
}

function savePlayers() {
    const newPlayers = [];
    for (let i = 0; i < players.length; i++) {
        const inputEl = document.getElementById(`player-name-${i}`);
        let val = inputEl.value.trim();
        if (val === "") val = players[i];
        newPlayers.push(val);
    }

    const newHistory = roundsHistory.map(round => {
        const newRound = {};
        for (let i = 0; i < players.length; i++) {
            newRound[newPlayers[i]] = round[players[i]] || 0;
        }
        return newRound;
    });

    players = newPlayers;
    roundsHistory = newHistory;

    localStorage.setItem('gamePlayers', JSON.stringify(players));
    localStorage.setItem('gameScores', JSON.stringify(roundsHistory));

    renderInputForm();
    renderHistoryHeader();
    updateResults();
    updateHistoryTable();
    alert("Đã cập nhật tên người chơi!");
}

function switchTab(tabId, btnElement) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');

    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabId === 'result-page') tabBtns[1].classList.add('active');
        if (tabId === 'history-page') tabBtns[2].classList.add('active');
        if (tabId === 'settings-page') tabBtns[3].classList.add('active');
    }

    if (tabId === 'result-page') updateResults();
    if (tabId === 'history-page') updateHistoryTable();
}

function submitRound() {
    let currentScores = {};
    let sum = 0;

    players.forEach(player => {
        const inputEl = document.getElementById(`score-${player}`);
        let val = parseInt(inputEl.value) || 0;
        currentScores[player] = val;
        sum += val;
    });

    const errorMsg = document.getElementById("error-msg");
    if (sum !== 0) {
        errorMsg.innerText = `Tổng phải bằng 0. Hiện tại là: ${sum}`;
        return;
    }

    errorMsg.innerText = "";
    roundsHistory.push(currentScores);
    
    localStorage.setItem('gameScores', JSON.stringify(roundsHistory));
    
    renderInputForm();
    updateResults();
    updateHistoryTable();
    alert("Đã lưu điểm!");
}

function clearAllData() {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả lịch sử và điểm số không?")) {
        localStorage.removeItem('gameScores');
        localStorage.removeItem('gamePlayers');
        roundsHistory = [];
        players = ["Thắng", "Thùy", "Hiệp", "Kiên", "Hồng"];
        renderSettingsForm();
        renderInputForm();
        updateResults();
        updateHistoryTable();
        alert("Đã xóa sạch dữ liệu.");
        switchTab('input-page', document.querySelectorAll('.tab-btn')[0]);
    }
}

function updateResults(sortOrder = 'none') {
    let totals = {};
    players.forEach(p => totals[p] = 0);
    roundsHistory.forEach(round => {
        players.forEach(p => totals[p] += round[p]);
    });

    let resultsArray = players.map(p => ({ name: p, score: totals[p] }));

    if (sortOrder === 'asc') {
        resultsArray.sort((a, b) => a.score - b.score);
    } else if (sortOrder === 'desc') {
        resultsArray.sort((a, b) => b.score - a.score);
    }

    const container = document.getElementById("result-list");
    if (!container) return;
    container.innerHTML = "";
    
    resultsArray.forEach(item => {
        const div = document.createElement("div");
        div.className = "result-item";
        let scoreColor = "#2d3748";
        if (item.score > 0) scoreColor = "#38a169";
        if (item.score < 0) scoreColor = "#e53e3e";
        div.innerHTML = `<span>${item.name}</span> <span style="color: ${scoreColor}">${item.score > 0 ? '+' : ''}${item.score}</span>`;
        container.appendChild(div);
    });
}

function updateHistoryTable() {
    const tbody = document.getElementById("history-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    roundsHistory.forEach((round, index) => {
        const tr = document.createElement("tr");
        let tdRound = document.createElement("td");
        tdRound.innerText = index + 1;
        tr.appendChild(tdRound);
        players.forEach(player => {
            let td = document.createElement("td");
            const score = round[player];
            td.innerText = score > 0 ? `+${score}` : score;
            if (score > 0) td.style.color = "#38a169";
            if (score < 0) td.style.color = "#e53e3e";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

window.onload = init;