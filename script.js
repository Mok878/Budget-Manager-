// ===== STATE =====
let income = [], bills = [], savings = [], emergencySavings = [], retirement401k = [], rothIRA = [];
let viewMode = 'monthly', currentUser = null, currentPeriod = 'monthly';
let goalTrackers = JSON.parse(localStorage.getItem('goalTrackers') || '[]');

// ===== THEME =====
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}
function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
}

// ===== VIEW MODE =====
function toggleViewMode() {
    viewMode = viewMode === 'monthly' ? 'yearly' : 'monthly';
    document.getElementById('viewModeBtn').textContent = viewMode === 'monthly' ? '📅 Monthly View' : '📆 Yearly View';
    renderAll();
}
function getMultiplier() { return viewMode === 'yearly' ? 12 : 1; }

// ===== NAVIGATION =====
function showSection(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
    const link = document.querySelector(`a[href="#${id}"]`);
    if (link) link.parentElement.classList.add('active');
    document.querySelector('.nav-menu').classList.remove('active');
    if (id === 'spending') renderSpendingAnalysis();
    if (id === 'advisor') renderAdvisor();
}
function goToSection(target) {
    showSection('budget');
    setTimeout(() => { const el = document.getElementById(target); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}
function toggleMenu() { document.querySelector('.nav-menu').classList.toggle('active'); }

// ===== AUTH =====
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email] && users[email].password === password) {
        currentUser = { name: users[email].name, email };
        (remember ? localStorage : sessionStorage).setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        alert(`Welcome back, ${currentUser.name}!`);
        showSection('budget');
    } else { alert('Invalid email or password.'); }
}
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (password !== confirm) { alert('Passwords do not match!'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) { alert('Account already exists. Please login.'); showSection('login'); return; }
    users[email] = { name, password, createdAt: new Date().toISOString() };
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = { name, email };
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    alert(`Welcome, ${name}! Account created.`);
    showSection('budget');
}
function socialLogin(p) { alert(`${p} login requires Firebase Auth or OAuth integration.`); }
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    updateAuthUI();
    showSection('home');
}
function updateAuthUI() {
    const show = !!currentUser;
    document.getElementById('authButtons').style.display = show ? 'none' : 'flex';
    document.getElementById('userMenu').style.display = show ? 'flex' : 'none';
    if (show) document.getElementById('userName').textContent = `👤 ${currentUser.name}`;
}
function checkAuth() {
    const u = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (u) { currentUser = JSON.parse(u); updateAuthUI(); }
}

// ===== CONTACT =====
function handleContact(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    alert(`Thank you ${name}! We'll get back to you at ${email} soon.`);
    e.target.reset();
}

// ===== PRICING =====
function selectPlan(plan) {
    if (!currentUser) { alert('Please login to select a plan.'); showSection('login'); return; }
    if (plan === 'free') { showSection('budget'); }
    else if (plan === 'pro') { alert('Pro Plan: Integrate Stripe at stripe.com for real payments.'); }
    else { alert('Enterprise: Contact sales@budgetmanager.com'); }
}

// ===== DATA =====
function loadData() {
    const saved = localStorage.getItem('budgetData');
    if (saved) {
        const d = JSON.parse(saved);
        income = d.income || []; bills = d.bills || []; savings = d.savings || [];
        emergencySavings = d.emergencySavings || []; retirement401k = d.retirement401k || []; rothIRA = d.rothIRA || [];
    }
    renderAll();
}
function saveData() {
    localStorage.setItem('budgetData', JSON.stringify({ income, bills, savings, emergencySavings, retirement401k, rothIRA }));
}

// ===== ADD / DELETE =====
function addIncome() {
    const cat = document.getElementById('incomeCategory').value;
    const src = document.getElementById('incomeSource').value.trim();
    const amt = parseFloat(document.getElementById('incomeAmount').value);
    if (!cat || !src || !(amt > 0)) return;
    income.push({ category: cat, source: src, amount: amt });
    document.getElementById('incomeCategory').value = '';
    document.getElementById('incomeSource').value = '';
    document.getElementById('incomeAmount').value = '';
    renderAll(); saveData();
}
function addBill() {
    const cat = document.getElementById('billCategory').value;
    const name = document.getElementById('billName').value.trim();
    const amt = parseFloat(document.getElementById('billAmount').value);
    if (!cat || !name || !(amt > 0)) return;
    bills.push({ category: cat, name, amount: amt });
    document.getElementById('billCategory').value = '';
    document.getElementById('billName').value = '';
    document.getElementById('billAmount').value = '';
    renderAll(); saveData();
}
function addEmergencySavings() {
    const goal = document.getElementById('emergencyGoal').value.trim();
    const amt = parseFloat(document.getElementById('emergencyAmount').value);
    if (!goal || !(amt > 0)) return;
    emergencySavings.push({ goal, amount: amt });
    document.getElementById('emergencyGoal').value = '';
    document.getElementById('emergencyAmount').value = '';
    renderAll(); saveData();
}
function add401k() {
    const goal = document.getElementById('401kGoal').value.trim();
    const amt = parseFloat(document.getElementById('401kAmount').value);
    if (!goal || !(amt > 0)) return;
    retirement401k.push({ goal, amount: amt });
    document.getElementById('401kGoal').value = '';
    document.getElementById('401kAmount').value = '';
    renderAll(); saveData();
}
function addRothIRA() {
    const goal = document.getElementById('rothGoal').value.trim();
    const amt = parseFloat(document.getElementById('rothAmount').value);
    if (!goal || !(amt > 0)) return;
    rothIRA.push({ goal, amount: amt });
    document.getElementById('rothGoal').value = '';
    document.getElementById('rothAmount').value = '';
    renderAll(); saveData();
}
function addSavings() {
    const goal = document.getElementById('savingsGoal').value.trim();
    const amt = parseFloat(document.getElementById('savingsAmount').value);
    if (!goal || !(amt > 0)) return;
    savings.push({ goal, amount: amt });
    document.getElementById('savingsGoal').value = '';
    document.getElementById('savingsAmount').value = '';
    renderAll(); saveData();
}
function deleteIncome(i) { income.splice(i, 1); renderAll(); saveData(); }
function deleteBill(i) { bills.splice(i, 1); renderAll(); saveData(); }
function deleteEmergencySavings(i) { emergencySavings.splice(i, 1); renderAll(); saveData(); }
function delete401k(i) { retirement401k.splice(i, 1); renderAll(); saveData(); }
function deleteRothIRA(i) { rothIRA.splice(i, 1); renderAll(); saveData(); }
function deleteSavings(i) { savings.splice(i, 1); renderAll(); saveData(); }

// ===== RENDER ALL =====
function renderAll() {
    const m = getMultiplier();
    const totalIncome = income.reduce((s, i) => s + i.amount, 0) * m;
    const totalBills = bills.reduce((s, i) => s + i.amount, 0) * m;
    const totalEmerg = emergencySavings.reduce((s, i) => s + i.amount, 0) * m;
    const totalSav = savings.reduce((s, i) => s + i.amount, 0) * m;
    const total401k = retirement401k.reduce((s, i) => s + i.amount, 0) * m;
    const totalRoth = rothIRA.reduce((s, i) => s + i.amount, 0) * m;
    const totalAllSav = totalEmerg + totalSav + total401k + totalRoth;
    const available = totalIncome - totalBills - totalAllSav;

    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalBills').textContent = `$${totalBills.toFixed(2)}`;
    document.getElementById('totalAllSavings').textContent = `$${totalAllSav.toFixed(2)}`;
    document.getElementById('emergencySavings').textContent = `$${totalEmerg.toFixed(2)}`;
    document.getElementById('regularSavings').textContent = `$${totalSav.toFixed(2)}`;
    document.getElementById('total401k').textContent = `$${total401k.toFixed(2)}`;
    document.getElementById('totalRothIRA').textContent = `$${totalRoth.toFixed(2)}`;
    document.getElementById('availableSavings').textContent = `$${available.toFixed(2)}`;

    // Income list
    if (income.length === 0) {
        document.getElementById('incomeList').innerHTML = '<p style="text-align:center;color:#999;padding:20px">No income added yet</p>';
    } else {
        const bycat = income.reduce((a, inc) => { (a[inc.category] = a[inc.category] || []).push(inc); return a; }, {});
        const order = ['Salary','Side Hustle','Freelance','Business','Investment','Rental','Pension','Other'];
        document.getElementById('incomeList').innerHTML =
            Object.keys(bycat).sort((a,b) => (order.indexOf(a)+1||999)-(order.indexOf(b)+1||999)).map(cat => {
                const items = bycat[cat];
                const catTotal = items.reduce((s,i) => s+i.amount,0)*m;
                return `<div class="category-group">
                    <div class="category-header income-header"><span>${cat}</span><span class="category-total" style="color:#10b981">$${catTotal.toFixed(2)}</span></div>
                    ${items.map((inc,_) => { const idx=income.indexOf(inc); return `<li class="item"><div class="item-info"><div class="item-name">${inc.source}</div></div><span class="item-amount" style="color:#10b981">$${(inc.amount*m).toFixed(2)}</span><button class="delete-btn" onclick="deleteIncome(${idx})">Delete</button></li>`; }).join('')}
                </div>`;
            }).join('') + `<div class="total-summary income-summary"><strong>Total Income:</strong><strong style="color:white">$${totalIncome.toFixed(2)}</strong></div>`;
    }

    // Bills list
    if (bills.length === 0) {
        document.getElementById('billsList').innerHTML = '<p style="text-align:center;color:#999;padding:20px">No expenses added yet</p>';
    } else {
        const bycat = bills.reduce((a, b) => { (a[b.category] = a[b.category] || []).push(b); return a; }, {});
        const order = ['Housing','Utilities','Transportation','Food','Insurance','Debt','Entertainment','Healthcare','Personal','Other'];
        document.getElementById('billsList').innerHTML =
            Object.keys(bycat).sort((a,b) => (order.indexOf(a)+1||999)-(order.indexOf(b)+1||999)).map(cat => {
                const items = bycat[cat];
                const catTotal = items.reduce((s,i) => s+i.amount,0)*m;
                return `<div class="category-group">
                    <div class="category-header"><span>${cat}</span><span class="category-total">$${catTotal.toFixed(2)}</span></div>
                    ${items.map((bill,_) => { const idx=bills.indexOf(bill); return `<li class="item"><div class="item-info"><div class="item-name">${bill.name}</div></div><span class="item-amount" style="color:#ef4444">$${(bill.amount*m).toFixed(2)}</span><button class="delete-btn" onclick="deleteBill(${idx})">Delete</button></li>`; }).join('')}
                </div>`;
            }).join('') + `<div class="total-summary"><strong>Total Expenses:</strong><strong style="color:#ef4444">$${totalBills.toFixed(2)}</strong></div>`;
    }

    // Savings lists
    document.getElementById('emergencySavingsList').innerHTML = emergencySavings.map((item,i) =>
        `<li class="item"><div class="item-info"><div class="item-name">${item.goal}</div></div><span class="item-amount" style="color:#f59e0b">$${(item.amount*m).toFixed(2)}</span><button class="delete-btn" onclick="deleteEmergencySavings(${i})">Delete</button></li>`).join('');
    document.getElementById('401kList').innerHTML = retirement401k.map((item,i) =>
        `<li class="item"><div class="item-info"><div class="item-name">${item.goal}</div></div><span class="item-amount" style="color:#8b5cf6">$${(item.amount*m).toFixed(2)}</span><button class="delete-btn" onclick="delete401k(${i})">Delete</button></li>`).join('');
    document.getElementById('rothIRAList').innerHTML = rothIRA.map((item,i) =>
        `<li class="item"><div class="item-info"><div class="item-name">${item.goal}</div></div><span class="item-amount" style="color:#ec4899">$${(item.amount*m).toFixed(2)}</span><button class="delete-btn" onclick="deleteRothIRA(${i})">Delete</button></li>`).join('');
    document.getElementById('savingsList').innerHTML = savings.map((item,i) =>
        `<li class="item"><div class="item-info"><div class="item-name">${item.goal}</div></div><span class="item-amount" style="color:#3b82f6">$${(item.amount*m).toFixed(2)}</span><button class="delete-btn" onclick="deleteSavings(${i})">Delete</button></li>`).join('');

    // Savings total summary box
    const box = document.querySelector('.savings-summary-box');
    const html = `<div class="total-summary savings-summary-box">
        <div style="margin-bottom:12px"><strong>Emergency:</strong> <strong style="color:white">$${totalEmerg.toFixed(2)}</strong></div>
        <div style="margin-bottom:12px"><strong>401(k):</strong> <strong style="color:white">$${total401k.toFixed(2)}</strong></div>
        <div style="margin-bottom:12px"><strong>Roth IRA:</strong> <strong style="color:white">$${totalRoth.toFixed(2)}</strong></div>
        <div style="margin-bottom:12px"><strong>Regular:</strong> <strong style="color:white">$${totalSav.toFixed(2)}</strong></div>
        <div style="border-top:2px solid rgba(255,255,255,0.3);padding-top:12px;margin-top:8px"><strong style="font-size:1.2em">Total Savings:</strong> <strong style="color:white;font-size:1.2em">$${totalAllSav.toFixed(2)}</strong></div>
    </div>`;
    if (box) box.outerHTML = html;
    else { const last = document.querySelector('.savings-section:last-of-type .item-list'); if (last) last.insertAdjacentHTML('afterend', html); }

    renderAdvisor();
    renderSpendingAnalysis();
}

// ===== SAVINGS ADVISOR =====
function renderAdvisor() {
    if (!document.getElementById('healthScore')) return;
    const ti = income.reduce((s,i)=>s+i.amount,0);
    const tb = bills.reduce((s,i)=>s+i.amount,0);
    const te = emergencySavings.reduce((s,i)=>s+i.amount,0);
    const ts = savings.reduce((s,i)=>s+i.amount,0);
    const t4 = retirement401k.reduce((s,i)=>s+i.amount,0);
    const tr = rothIRA.reduce((s,i)=>s+i.amount,0);
    const totalSav = te+ts+t4+tr;
    const savRate = ti>0?(totalSav/ti)*100:0;
    const expRate = ti>0?(tb/ti)*100:0;

    // Health score
    if (ti > 0) {
        let score = 100;
        const er = tb/ti;
        if (er>0.9) score-=40; else if (er>0.7) score-=25; else if (er>0.5) score-=10;
        if (savRate<5) score-=20; else if (savRate<10) score-=10; else if (savRate>=20) score+=10;
        score = Math.max(10, Math.min(100, Math.round(score)));
        const map = score>=80?['Excellent!','great','You are in great financial shape. Consider increasing investments.']:
                    score>=60?['Good','good','Finances on track. Look for ways to reduce expenses and boost savings.']:
                    score>=40?['Fair','fair','Room for improvement. Cut unnecessary expenses and increase savings rate.']:
                              ['Needs Work','poor','Expenses are high. Focus on reducing bills and building an emergency fund.'];
        document.getElementById('healthScore').textContent = score;
        document.getElementById('scoreLabel').textContent = `Financial Health: ${map[0]}`;
        document.getElementById('scoreDescription').textContent = map[2];
        document.getElementById('scoreCircle').className = `score-circle ${map[1]}`;
    }

    // Spending breakdown
    const sbEl = document.getElementById('spendingBreakdown');
    if (bills.length === 0) { sbEl.innerHTML = '<p class="empty-state">No expenses added yet.</p>'; }
    else {
        const bycat = bills.reduce((a,b)=>{ a[b.category]=(a[b.category]||0)+b.amount; return a; },{});
        const sorted = Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
        sbEl.innerHTML = sorted.map(([cat,amt])=>{
            const pct = tb>0?((amt/tb)*100).toFixed(1):0;
            return `<div class="spending-bar"><div class="spending-bar-label"><span>${cat}</span><span>$${amt.toFixed(2)} (${pct}%)</span></div><div class="spending-bar-track"><div class="spending-bar-fill" style="width:${pct}%"></div></div></div>`;
        }).join('');
    }

    // Savings rate
    const srEl = document.getElementById('savingsRate');
    if (ti===0) { srEl.innerHTML='<p class="empty-state">Add income to see savings rate.</p>'; }
    else {
        const cls = savRate<10?'rate-low':savRate<20?'rate-ok':'rate-good';
        const msg = savRate<10?'⚠️ Aim for at least 20% savings rate.':savRate<20?'👍 Good start! Try to reach 20%.':'🎉 Excellent savings rate!';
        srEl.innerHTML = `<div class="savings-rate-display"><div class="savings-rate-number">${savRate.toFixed(1)}%</div><div class="savings-rate-label">of income saved monthly</div><div class="savings-rate-label" style="margin-top:8px">$${totalSav.toFixed(2)} / $${ti.toFixed(2)}</div></div><div class="rate-recommendation ${cls}">${msg}</div>`;
    }

    // Alerts
    const alEl = document.getElementById('budgetAlerts');
    if (ti===0) { alEl.innerHTML='<p class="empty-state">Add budget data to see alerts.</p>'; }
    else {
        const alerts=[];
        if (ti-tb-totalSav<0) alerts.push({t:'danger',m:'🚨 Spending more than you earn! Reduce expenses immediately.'});
        if (te<ti) alerts.push({t:'warning',m:`⚠️ Emergency fund below 1 month income. Aim for $${(ti*3).toFixed(0)}-$${(ti*6).toFixed(0)}.`});
        if (savRate<10) alerts.push({t:'warning',m:'💡 Savings rate below 10%. Try the 50/30/20 rule.'});
        if (tb/ti>0.7) alerts.push({t:'danger',m:'🔴 Expenses exceed 70% of income. Review spending.'});
        if (savRate>=20) alerts.push({t:'success',m:'✅ Great job! Saving 20%+ of income.'});
        if (!alerts.length) alerts.push({t:'success',m:'✅ Budget looks healthy! Keep it up.'});
        alEl.innerHTML = alerts.map(a=>`<div class="alert-item alert-${a.t}">${a.m}</div>`).join('');
    }

    // 50/30/20 rule
    const brEl = document.getElementById('budgetRule');
    if (ti===0) { brEl.innerHTML='<p class="empty-state">Add income to see the 50/30/20 breakdown.</p>'; }
    else {
        const needs=ti*0.5, wants=ti*0.3, savTarget=ti*0.2;
        const np=Math.min(100,(tb/needs*100)).toFixed(0), sp=Math.min(100,(totalSav/savTarget*100)).toFixed(0);
        brEl.innerHTML = `
            <div class="rule-bar"><div class="rule-bar-header"><span>🏠 Needs (50%)</span><span>$${tb.toFixed(2)} / $${needs.toFixed(2)}</span></div><div class="rule-bar-sub">Housing, utilities, groceries, transport</div><div class="spending-bar-track"><div class="spending-bar-fill" style="width:${np}%;background:${tb>needs?'#ef4444':'#0d9488'}"></div></div></div>
            <div class="rule-bar"><div class="rule-bar-header"><span>🎬 Wants (30%)</span><span>Target: $${wants.toFixed(2)}</span></div><div class="rule-bar-sub">Entertainment, dining, hobbies</div><div class="spending-bar-track"><div class="spending-bar-fill" style="width:30%;background:#f59e0b"></div></div></div>
            <div class="rule-bar"><div class="rule-bar-header"><span>💰 Savings (20%)</span><span>$${totalSav.toFixed(2)} / $${savTarget.toFixed(2)}</span></div><div class="rule-bar-sub">Emergency fund, retirement, goals</div><div class="spending-bar-track"><div class="spending-bar-fill" style="width:${sp}%;background:#10b981"></div></div></div>`;
    }

    // Tips
    const tips = [
        {i:'☕',t:'Cut Daily Coffee',d:'Making coffee at home saves $100+ per month.'},
        {i:'📱',t:'Review Subscriptions',d:'Cancel unused subscriptions. Most waste $50-200/month.'},
        {i:'🛒',t:'Meal Prep Weekly',d:'Prepping meals saves 30-50% on food costs.'},
        {i:'⚡',t:'Reduce Utilities',d:'Unplug devices and use LED bulbs to save $50-100/month.'},
        {i:'🚗',t:'Carpool or Transit',d:'Sharing rides cuts transportation costs by 40-60%.'},
        {i:'🏦',t:'Automate Savings',d:'Auto-transfer to savings on payday — save before you spend.'},
        {i:'💳',t:'Pay Off Debt First',d:'Paying off high-interest debt is the best guaranteed return.'},
        {i:'🛍️',t:'24-Hour Rule',d:'Wait 24 hours before any non-essential purchase over $50.'},
        {i:'📊',t:'Track Every Dollar',d:'People who track spending save 15-20% more.'},
        {i:'🎯',t:'Set Specific Goals',d:'Specific goals make you 42% more likely to save.'},
    ];
    document.getElementById('savingsTips').innerHTML = tips.slice(0,6).map(t=>`<div class="tip-card"><h4>${t.i} ${t.t}</h4><p>${t.d}</p></div>`).join('');
    renderGoalsProgress();
}

function addGoalTracker() {
    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    if (!name || !(target>0)) return;
    goalTrackers.push({ name, target, current });
    localStorage.setItem('goalTrackers', JSON.stringify(goalTrackers));
    document.getElementById('goalName').value=''; document.getElementById('goalTarget').value=''; document.getElementById('goalCurrent').value='';
    renderGoalsProgress();
}
function deleteGoalTracker(i) { goalTrackers.splice(i,1); localStorage.setItem('goalTrackers',JSON.stringify(goalTrackers)); renderGoalsProgress(); }
function renderGoalsProgress() {
    const el = document.getElementById('goalsProgress'); if (!el) return;
    if (!goalTrackers.length) { el.innerHTML='<p class="empty-state" style="padding:20px 0">No goals yet. Add one below.</p>'; return; }
    el.innerHTML = goalTrackers.map((g,i)=>{
        const pct=Math.min(100,(g.current/g.target)*100).toFixed(1);
        return `<div class="goal-progress-item"><div class="goal-progress-header"><span>🎯 ${g.name}</span><button class="delete-btn" onclick="deleteGoalTracker(${i})" style="font-size:.8em;padding:5px 12px">Remove</button></div><div class="goal-progress-bar-track"><div class="goal-progress-bar-fill" style="width:${pct}%"></div></div><div class="goal-progress-footer"><span>$${g.current.toFixed(2)} of $${g.target.toFixed(2)}</span><span>${pct}% — $${Math.max(0,g.target-g.current).toFixed(2)} to go</span></div></div>`;
    }).join('');
}

// ===== SPENDING ANALYSIS =====
const periodMultipliers = { weekly: 1/4.33, monthly: 1, quarterly: 3, yearly: 12 };
const periodLabels = { weekly:'Weekly', monthly:'Monthly', quarterly:'Quarterly', yearly:'Yearly' };
const catColors = ['#0d9488','#10b981','#f59e0b','#ef4444','#6366f1','#ec4899','#06b6d4','#84cc16','#f97316','#8b5cf6'];

function switchPeriod(period, btn) {
    currentPeriod = period;
    document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    renderSpendingAnalysis();
}

function renderSpendingAnalysis() {
    if (!document.getElementById('spendingSummaryRow')) return;
    const m = periodMultipliers[currentPeriod];
    const ti = income.reduce((s,i)=>s+i.amount,0)*m;
    const tb = bills.reduce((s,i)=>s+i.amount,0)*m;
    const te = emergencySavings.reduce((s,i)=>s+i.amount,0)*m;
    const ts = savings.reduce((s,i)=>s+i.amount,0)*m;
    const t4 = retirement401k.reduce((s,i)=>s+i.amount,0)*m;
    const tr = rothIRA.reduce((s,i)=>s+i.amount,0)*m;
    const totalSav = te+ts+t4+tr;
    const remaining = ti-tb-totalSav;

    // Summary cards
    document.getElementById('spendingSummaryRow').innerHTML = [
        {label:'Total Income',value:ti,color:'#10b981'},
        {label:'Total Expenses',value:tb,color:'#ef4444'},
        {label:'Total Savings',value:totalSav,color:'#0d9488'},
        {label:'Remaining',value:remaining,color:remaining>=0?'#10b981':'#ef4444'},
    ].map(s=>`<div class="summary-stat-card"><div class="stat-label">${periodLabels[currentPeriod]} ${s.label}</div><div class="stat-value" style="color:${s.color}">$${s.value.toFixed(2)}</div></div>`).join('');

    // Category chart
    const bycat = bills.reduce((a,b)=>{ a[b.category]=(a[b.category]||0)+b.amount*m; return a; },{});
    const sorted = Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
    const maxAmt = sorted.length?sorted[0][1]:1;
    document.getElementById('categoryChart').innerHTML = sorted.length===0
        ? '<p class="empty-state">No expenses added yet.</p>'
        : sorted.map(([cat,amt],i)=>{
            const pct=((amt/maxAmt)*100).toFixed(1);
            const ofInc=ti>0?((amt/ti)*100).toFixed(1):0;
            return `<div class="cat-bar-row"><div class="cat-bar-name">${cat}</div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%;background:${catColors[i%catColors.length]}">${pct>20?ofInc+'% of income':''}</div></div><div class="cat-bar-amount">$${amt.toFixed(2)}</div></div>`;
        }).join('');

    // Income vs Expenses chart
    const maxBar = Math.max(ti,tb,totalSav,1);
    document.getElementById('incomeExpenseChart').innerHTML = [
        {label:'Income',value:ti,color:'#10b981'},
        {label:'Expenses',value:tb,color:'#ef4444'},
        {label:'Savings',value:totalSav,color:'#0d9488'},
        {label:'Remaining',value:Math.max(0,remaining),color:'#f59e0b'},
    ].map(b=>`<div class="iev-bar"><div class="iev-label"><span>${b.label}</span><span>$${b.value.toFixed(2)}</span></div><div class="iev-track"><div class="iev-fill" style="width:${((b.value/maxBar)*100).toFixed(1)}%;background:${b.color}">${((b.value/maxBar)*100).toFixed(0)}%</div></div></div>`).join('');

    // Detailed breakdown
    const savRate = ti>0?((totalSav/ti)*100).toFixed(1):0;
    const expRate = ti>0?((tb/ti)*100).toFixed(1):0;
    document.getElementById('detailedBreakdown').innerHTML = [
        {l:'Income',v:`$${ti.toFixed(2)}`},
        {l:'Fixed Expenses',v:`$${tb.toFixed(2)}`},
        {l:'Emergency Savings',v:`$${te.toFixed(2)}`},
        {l:'401(k)',v:`$${t4.toFixed(2)}`},
        {l:'Roth IRA',v:`$${tr.toFixed(2)}`},
        {l:'Regular Savings',v:`$${ts.toFixed(2)}`},
        {l:'Savings Rate',v:`${savRate}%`},
        {l:'Expense Rate',v:`${expRate}%`},
        {l:'Net Remaining',v:`$${remaining.toFixed(2)}`},
    ].map(r=>`<div class="breakdown-row"><span class="breakdown-label">${r.l}</span><span class="breakdown-value">${r.v}</span></div>`).join('');

    // Period comparison
    document.getElementById('periodComparison').innerHTML = ['weekly','monthly','quarterly','yearly'].map(p=>{
        const pm=periodMultipliers[p];
        const inc=income.reduce((s,i)=>s+i.amount,0)*pm;
        const exp=bills.reduce((s,i)=>s+i.amount,0)*pm;
        const sav=[...emergencySavings,...savings,...retirement401k,...rothIRA].reduce((s,i)=>s+i.amount,0)*pm;
        const rem=inc-exp-sav;
        return `<div class="comparison-col"><h4>${periodLabels[p]}</h4>
            <div class="comparison-item"><div class="comparison-item-label">Income</div><div class="comparison-item-value" style="color:#10b981">$${inc.toFixed(2)}</div></div>
            <div class="comparison-item"><div class="comparison-item-label">Expenses</div><div class="comparison-item-value" style="color:#ef4444">$${exp.toFixed(2)}</div></div>
            <div class="comparison-item"><div class="comparison-item-label">Savings</div><div class="comparison-item-value" style="color:#0d9488">$${sav.toFixed(2)}</div></div>
            <div class="comparison-item"><div class="comparison-item-label">Remaining</div><div class="comparison-item-value" style="color:${rem>=0?'#10b981':'#ef4444'}">$${rem.toFixed(2)}</div></div>
        </div>`;
    }).join('');
}

// ===== INIT =====
loadData();
loadTheme();
checkAuth();






