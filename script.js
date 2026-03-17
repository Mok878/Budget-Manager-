let income = [];
let bills = [];
let savings = [];
let emergencySavings = [];
let retirement401k = [];
let rothIRA = [];
let viewMode = 'monthly'; // 'monthly' or 'yearly'
let currentUser = null;

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleViewMode() {
    viewMode = viewMode === 'monthly' ? 'yearly' : 'monthly';
    document.getElementById('viewModeBtn').textContent = viewMode === 'monthly' ? '📅 Monthly View' : '📆 Yearly View';
    renderAll();
}

function getMultiplier() {
    return viewMode === 'yearly' ? 12 : 1;
}

function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'spending') renderSpendingAnalysis();
    if (sectionId === 'advisor') renderAdvisor();
    
    // Update active menu item
    document.querySelectorAll('.nav-menu li').forEach(item => {
        item.classList.remove('active');
    });
    const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.parentElement.classList.add('active');
    }
    
    // Close mobile menu if open
    document.querySelector('.nav-menu').classList.remove('active');
}

function goToSection(targetSection) {
    showSection('budget');
    setTimeout(() => {
        const element = document.getElementById(targetSection);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

function toggleMenu() {
    document.querySelector('.nav-menu').classList.toggle('active');
}

function handleContact(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    alert(`Thank you ${name}! Your message has been received. We'll get back to you at ${email} soon.`);
    
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
}

function selectPlan(plan) {
    if (!currentUser) {
        alert('Please login or create an account to select a plan.');
        showSection('login');
        return;
    }
    
    if (plan === 'free') {
        alert('Welcome to Budget Manager! You can start using all basic features right away.');
        showSection('budget');
    } else if (plan === 'pro') {
        alert('Pro Plan Selected!\n\nTo integrate real payments, you would connect:\n\n• Stripe (stripe.com)\n• PayPal (paypal.com)\n• Square (squareup.com)\n\nFor now, enjoy exploring the features!');
    } else if (plan === 'enterprise') {
        alert('Thank you for your interest in Enterprise!\n\nPlease contact us at:\nsales@budgetmanager.com\n\nOr call: (555) 123-4567');
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[email] && users[email].password === password) {
        currentUser = {
            name: users[email].name,
            email: email
        };
        
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        updateAuthUI();
        alert(`Welcome back, ${currentUser.name}!`);
        showSection('budget');
    } else {
        alert('Invalid email or password. Please try again.');
    }
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[email]) {
        alert('An account with this email already exists. Please login.');
        showSection('login');
        return;
    }
    
    // Save new user
    users[email] = {
        name: name,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = { name, email };
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateAuthUI();
    alert(`Welcome, ${name}! Your account has been created successfully.`);
    showSection('budget');
}

function socialLogin(provider) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would be integrated here.\n\nTo implement:\n• Google: Firebase Auth or Google OAuth\n• Facebook: Facebook Login SDK\n\nFor now, please use email registration.`);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    updateAuthUI();
    alert('You have been logged out successfully.');
    showSection('home');
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = `👤 ${currentUser.name}`;
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

function loadData() {
    const saved = localStorage.getItem('budgetData');
    if (saved) {
        const data = JSON.parse(saved);
        income = data.income || [];
        bills = data.bills || [];
        savings = data.savings || [];
        emergencySavings = data.emergencySavings || [];
        retirement401k = data.retirement401k || [];
        rothIRA = data.rothIRA || [];
        renderAll();
    }
}

function saveData() {
    localStorage.setItem('budgetData', JSON.stringify({ income, bills, savings, emergencySavings, retirement401k, rothIRA }));
}

function addIncome() {
    const category = document.getElementById('incomeCategory').value;
    const source = document.getElementById('incomeSource').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    
    if (category && source && amount > 0) {
        income.push({ category, source, amount });
        document.getElementById('incomeCategory').value = '';
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
        renderAll();
        saveData();
    }
}

function addBill() {
    const category = document.getElementById('billCategory').value;
    const name = document.getElementById('billName').value.trim();
    const amount = parseFloat(document.getElementById('billAmount').value);
    
    if (category && name && amount > 0) {
        bills.push({ category, name, amount });
        document.getElementById('billCategory').value = '';
        document.getElementById('billName').value = '';
        document.getElementById('billAmount').value = '';
        renderAll();
        saveData();
    }
}

function add401k() {
    const goal = document.getElementById('401kGoal').value.trim();
    const amount = parseFloat(document.getElementById('401kAmount').value);
    
    if (goal && amount > 0) {
        retirement401k.push({ goal, amount });
        document.getElementById('401kGoal').value = '';
        document.getElementById('401kAmount').value = '';
        renderAll();
        saveData();
    }
}

function addRothIRA() {
    const goal = document.getElementById('rothGoal').value.trim();
    const amount = parseFloat(document.getElementById('rothAmount').value);
    
    if (goal && amount > 0) {
        rothIRA.push({ goal, amount });
        document.getElementById('rothGoal').value = '';
        document.getElementById('rothAmount').value = '';
        renderAll();
        saveData();
    }
}

function delete401k(index) {
    retirement401k.splice(index, 1);
    renderAll();
    saveData();
}

function deleteRothIRA(index) {
    rothIRA.splice(index, 1);
    renderAll();
    saveData();
}

function addEmergencySavings() {
    const goal = document.getElementById('emergencyGoal').value.trim();
    const amount = parseFloat(document.getElementById('emergencyAmount').value);
    
    if (goal && amount > 0) {
        emergencySavings.push({ goal, amount });
        document.getElementById('emergencyGoal').value = '';
        document.getElementById('emergencyAmount').value = '';
        renderAll();
        saveData();
    }
}

function addSavings() {
    const goal = document.getElementById('savingsGoal').value.trim();
    const amount = parseFloat(document.getElementById('savingsAmount').value);
    
    if (goal && amount > 0) {
        savings.push({ goal, amount });
        document.getElementById('savingsGoal').value = '';
        document.getElementById('savingsAmount').value = '';
        renderAll();
        saveData();
    }
}

function deleteEmergencySavings(index) {
    emergencySavings.splice(index, 1);
    renderAll();
    saveData();
}

function deleteIncome(index) {
    income.splice(index, 1);
    renderAll();
    saveData();
}

function deleteBill(index) {
    bills.splice(index, 1);
    renderAll();
    saveData();
}

function deleteSavings(index) {
    savings.splice(index, 1);
    renderAll();
    saveData();
}

function renderAll() {
    renderAdvisor();
    renderSpendingAnalysis();    const multiplier = getMultiplier();
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0) * multiplier;
    const totalBills = bills.reduce((sum, item) => sum + item.amount, 0) * multiplier;
    const totalEmergencySavings = emergencySavings.reduce((sum, item) => sum + item.amount, 0) * multiplier;
    const totalSavings = savings.reduce((sum, item) => sum + item.amount, 0) * multiplier;
    const total401k = retirement401k.reduce((sum, item) => sum + item.amount, 0) * multiplier;
    const totalRothIRA = rothIRA.reduce((sum, item) => sum + item.amount, 0) * multiplier;
    const totalAllSavings = totalEmergencySavings + totalSavings + total401k + totalRothIRA;
    const available = totalIncome - totalBills - totalAllSavings;
    
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalBills').textContent = `$${totalBills.toFixed(2)}`;
    document.getElementById('totalAllSavings').textContent = `$${totalAllSavings.toFixed(2)}`;
    document.getElementById('emergencySavings').textContent = `$${totalEmergencySavings.toFixed(2)}`;
    document.getElementById('regularSavings').textContent = `$${totalSavings.toFixed(2)}`;
    document.getElementById('total401k').textContent = `$${total401k.toFixed(2)}`;
    document.getElementById('totalRothIRA').textContent = `$${totalRothIRA.toFixed(2)}`;
    document.getElementById('availableSavings').textContent = `$${available.toFixed(2)}`;
    
    // Render income
    if (income.length === 0) {
        document.getElementById('incomeList').innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No income sources added yet</p>';
    } else {
        const incomeByCategory = income.reduce((acc, inc) => {
            const cat = inc.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(inc);
            return acc;
        }, {});
        
        const categoryOrder = ['Salary', 'Side Hustle', 'Freelance', 'Business', 'Investment', 'Rental', 'Pension', 'Other'];
        const sortedCategories = Object.keys(incomeByCategory).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        document.getElementById('incomeList').innerHTML = sortedCategories.map(category => {
            const categoryIncome = incomeByCategory[category];
            const categoryTotal = categoryIncome.reduce((sum, inc) => sum + inc.amount, 0) * multiplier;
            
            return `
                <div class="category-group">
                    <div class="category-header income-header">
                        <span>${category}</span>
                        <span class="category-total" style="color: #10b981;">$${categoryTotal.toFixed(2)}</span>
                    </div>
                    ${categoryIncome.map(inc => {
                        const index = income.indexOf(inc);
                        return `
                            <li class="item">
                                <div class="item-info">
                                    <div class="item-name">${inc.source}</div>
                                </div>
                                <span class="item-amount" style="color: #10b981;">$${(inc.amount * multiplier).toFixed(2)}</span>
                                <button class="delete-btn" onclick="deleteIncome(${index})">Delete</button>
                            </li>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('') + `
            <div class="total-summary income-summary">
                <strong>Total Income:</strong>
                <strong style="color: white;">$${totalIncome.toFixed(2)}</strong>
            </div>
        `;
    }
    
    // Render bills
    if (bills.length === 0) {
        document.getElementById('billsList').innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No expenses added yet</p>';
    } else {
        const billsByCategory = bills.reduce((acc, bill) => {
            const cat = bill.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(bill);
            return acc;
        }, {});
        
        const categoryOrder = ['Housing', 'Utilities', 'Transportation', 'Food', 'Insurance', 'Debt', 'Entertainment', 'Healthcare', 'Personal', 'Other'];
        const sortedCategories = Object.keys(billsByCategory).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        document.getElementById('billsList').innerHTML = sortedCategories.map(category => {
            const categoryBills = billsByCategory[category];
            const categoryTotal = categoryBills.reduce((sum, bill) => sum + bill.amount, 0) * multiplier;
            
            return `
                <div class="category-group">
                    <div class="category-header">
                        <span>${category}</span>
                        <span class="category-total">$${categoryTotal.toFixed(2)}</span>
                    </div>
                    ${categoryBills.map(bill => {
                        const index = bills.indexOf(bill);
                        return `
                            <li class="item">
                                <div class="item-info">
                                    <div class="item-name">${bill.name}</div>
                                </div>
                                <span class="item-amount" style="color: #ef4444;">$${(bill.amount * multiplier).toFixed(2)}</span>
                                <button class="delete-btn" onclick="deleteBill(${index})">Delete</button>
                            </li>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('') + `
            <div class="total-summary">
                <strong>Total Expenses:</strong>
                <strong style="color: #ef4444;">$${totalBills.toFixed(2)}</strong>
            </div>
        `;
    }
    
    // Render savings
    document.getElementById('emergencySavingsList').innerHTML = emergencySavings.map((item, i) => `
        <li class="item">
            <div class="item-info">
                <div class="item-name">${item.goal}</div>
            </div>
            <span class="item-amount" style="color: #f59e0b;">$${(item.amount * multiplier).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteEmergencySavings(${i})">Delete</button>
        </li>
    `).join('');
    
    document.getElementById('401kList').innerHTML = retirement401k.map((item, i) => `
        <li class="item">
            <div class="item-info">
                <div class="item-name">${item.goal}</div>
            </div>
            <span class="item-amount" style="color: #8b5cf6;">$${(item.amount * multiplier).toFixed(2)}</span>
            <button class="delete-btn" onclick="delete401k(${i})">Delete</button>
        </li>
    `).join('');
    
    document.getElementById('rothIRAList').innerHTML = rothIRA.map((item, i) => `
        <li class="item">
            <div class="item-info">
                <div class="item-name">${item.goal}</div>
            </div>
            <span class="item-amount" style="color: #ec4899;">$${(item.amount * multiplier).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteRothIRA(${i})">Delete</button>
        </li>
    `).join('');
    
    document.getElementById('savingsList').innerHTML = savings.map((item, i) => `
        <li class="item">
            <div class="item-info">
                <div class="item-name">${item.goal}</div>
            </div>
            <span class="item-amount" style="color: #3b82f6;">$${(item.amount * multiplier).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteSavings(${i})">Delete</button>
        </li>
    `).join('');
    
    // Add total savings summary
    const savingsSummaryHTML = `
        <div class="total-summary savings-summary-box">
            <div style="margin-bottom: 15px;">
                <strong>Emergency Savings:</strong>
                <strong style="color: white;">$${totalEmergencySavings.toFixed(2)}</strong>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>401(k):</strong>
                <strong style="color: white;">$${total401k.toFixed(2)}</strong>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Roth IRA:</strong>
                <strong style="color: white;">$${totalRothIRA.toFixed(2)}</strong>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Regular Savings:</strong>
                <strong style="color: white;">$${totalSavings.toFixed(2)}</strong>
            </div>
            <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
                <strong style="font-size: 1.2em;">Total Savings:</strong>
                <strong style="color: white; font-size: 1.2em;">$${totalAllSavings.toFixed(2)}</strong>
            </div>
        </div>
    `;
    
    // Append to the last savings section
    const lastSavingsSection = document.querySelector('.savings-section:last-of-type .item-list');
    if (lastSavingsSection && !document.querySelector('.savings-summary-box')) {
        lastSavingsSection.insertAdjacentHTML('afterend', savingsSummaryHTML);
    } else if (document.querySelector('.savings-summary-box')) {
        document.querySelector('.savings-summary-box').outerHTML = savingsSummaryHTML;
    }
}

loadData();
loadTheme();
checkAuth();
renderAdvisor();

// ===== SAVINGS ADVISOR =====
let goalTrackers = JSON.parse(localStorage.getItem('goalTrackers') || '[]');

function renderAdvisor() {
    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    const totalBills = bills.reduce((s, i) => s + i.amount, 0);
    const totalEmergency = emergencySavings.reduce((s, i) => s + i.amount, 0);
    const totalSavings = savings.reduce((s, i) => s + i.amount, 0);
    const total401kAmt = retirement401k.reduce((s, i) => s + i.amount, 0);
    const totalRothAmt = rothIRA.reduce((s, i) => s + i.amount, 0);
    const totalAllSavings = totalEmergency + totalSavings + total401kAmt + totalRothAmt;
    const savingsRate = totalIncome > 0 ? (totalAllSavings / totalIncome) * 100 : 0;
    const expenseRate = totalIncome > 0 ? (totalBills / totalIncome) * 100 : 0;

    renderHealthScore(totalIncome, totalBills, totalAllSavings, savingsRate);
    renderSpendingBreakdown(totalBills);
    renderSavingsRate(savingsRate, totalIncome, totalAllSavings);
    renderAlerts(totalIncome, totalBills, totalAllSavings, savingsRate, totalEmergency);
    renderBudgetRule(totalIncome, totalBills, totalAllSavings);
    renderTips(savingsRate, expenseRate, totalEmergency, totalIncome);
    renderGoalsProgress();
}

function renderHealthScore(income, bills, savings, savingsRate) {
    if (income === 0) return;
    const expenseRatio = bills / income;
    let score = 100;
    if (expenseRatio > 0.9) score -= 40;
    else if (expenseRatio > 0.7) score -= 25;
    else if (expenseRatio > 0.5) score -= 10;
    if (savingsRate < 5) score -= 20;
    else if (savingsRate < 10) score -= 10;
    else if (savingsRate >= 20) score += 10;
    score = Math.max(10, Math.min(100, Math.round(score)));

    let label, desc, cls;
    if (score >= 80) { label = 'Excellent!'; cls = 'great'; desc = 'You are in great financial shape. Keep it up and consider increasing your investments.'; }
    else if (score >= 60) { label = 'Good'; cls = 'good'; desc = 'Your finances are on track. Look for small ways to reduce expenses and boost savings.'; }
    else if (score >= 40) { label = 'Fair'; cls = 'fair'; desc = 'There is room for improvement. Try to cut unnecessary expenses and increase your savings rate.'; }
    else { label = 'Needs Work'; cls = 'poor'; desc = 'Your expenses are high relative to income. Focus on reducing bills and building an emergency fund first.'; }

    document.getElementById('healthScore').textContent = score;
    document.getElementById('scoreLabel').textContent = `Financial Health: ${label}`;
    document.getElementById('scoreDescription').textContent = desc;
    const circle = document.getElementById('scoreCircle');
    circle.className = `score-circle ${cls}`;
}

function renderSpendingBreakdown(totalBills) {
    const el = document.getElementById('spendingBreakdown');
    if (bills.length === 0) { el.innerHTML = '<p class="empty-state">No expenses added yet.</p>'; return; }
    const byCategory = bills.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.amount;
        return acc;
    }, {});
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    el.innerHTML = sorted.map(([cat, amt]) => {
        const pct = totalBills > 0 ? ((amt / totalBills) * 100).toFixed(1) : 0;
        return `
            <div class="spending-bar">
                <div class="spending-bar-label"><span>${cat}</span><span>$${amt.toFixed(2)} (${pct}%)</span></div>
                <div class="spending-bar-track"><div class="spending-bar-fill" style="width:${pct}%"></div></div>
            </div>`;
    }).join('');
}

function renderSavingsRate(rate, income, totalSavings) {
    const el = document.getElementById('savingsRate');
    if (income === 0) { el.innerHTML = '<p class="empty-state">Add income to see your savings rate.</p>'; return; }
    let recClass, recText;
    if (rate < 10) { recClass = 'rate-low'; recText = '⚠️ Aim for at least 20% savings rate. Try cutting one expense category.'; }
    else if (rate < 20) { recClass = 'rate-ok'; recText = '👍 Good start! Try to reach 20% for long-term financial security.'; }
    else { recClass = 'rate-good'; recText = '🎉 Excellent savings rate! You are building strong financial security.'; }
    el.innerHTML = `
        <div class="savings-rate-display">
            <div class="savings-rate-number">${rate.toFixed(1)}%</div>
            <div class="savings-rate-label">of income saved monthly</div>
            <div class="savings-rate-label" style="margin-top:8px;">$${totalSavings.toFixed(2)} / $${income.toFixed(2)}</div>
        </div>
        <div class="rate-recommendation ${recClass}">${recText}</div>`;
}

function renderAlerts(income, bills, savings, savingsRate, emergency) {
    const el = document.getElementById('budgetAlerts');
    if (income === 0) { el.innerHTML = '<p class="empty-state">Add budget data to see alerts.</p>'; return; }
    const alerts = [];
    const remaining = income - bills - savings;
    if (remaining < 0) alerts.push({ type: 'danger', icon: '🚨', text: 'You are spending more than you earn! Reduce expenses immediately.' });
    if (emergency < income) alerts.push({ type: 'warning', icon: '⚠️', text: `Emergency fund is below 1 month of income. Aim for 3-6 months ($${(income * 3).toFixed(0)} - $${(income * 6).toFixed(0)}).` });
    if (savingsRate < 10 && income > 0) alerts.push({ type: 'warning', icon: '💡', text: 'Savings rate is below 10%. Try the 50/30/20 rule to improve.' });
    if (bills / income > 0.7) alerts.push({ type: 'danger', icon: '🔴', text: 'Expenses exceed 70% of income. Review your spending categories.' });
    if (savings > 0 && savingsRate >= 20) alerts.push({ type: 'success', icon: '✅', text: 'Great job! You are saving 20%+ of your income.' });
    if (alerts.length === 0) alerts.push({ type: 'success', icon: '✅', text: 'Your budget looks healthy! Keep maintaining good habits.' });
    el.innerHTML = alerts.map(a => `<div class="alert-item alert-${a.type}">${a.icon} ${a.text}</div>`).join('');
}

function renderBudgetRule(income, bills, savings) {
    const el = document.getElementById('budgetRule');
    if (income === 0) { el.innerHTML = '<p class="empty-state">Add income to see the 50/30/20 breakdown.</p>'; return; }
    const needs = income * 0.50, wants = income * 0.30, savingsTarget = income * 0.20;
    const needsPct = Math.min(100, (bills / needs * 100)).toFixed(0);
    const savingsPct = Math.min(100, (savings / savingsTarget * 100)).toFixed(0);
    el.innerHTML = `
        <div class="rule-bar">
            <div class="rule-bar-header"><span>🏠 Needs (50%)</span><span>$${bills.toFixed(2)} / $${needs.toFixed(2)}</span></div>
            <div class="rule-bar-sub">Housing, utilities, groceries, transportation</div>
            <div class="spending-bar-track"><div class="spending-bar-fill" style="width:${needsPct}%;background:${bills>needs?'#ef4444':'#667eea'}"></div></div>
        </div>
        <div class="rule-bar">
            <div class="rule-bar-header"><span>🎬 Wants (30%)</span><span>Target: $${wants.toFixed(2)}</span></div>
            <div class="rule-bar-sub">Entertainment, dining out, hobbies</div>
            <div class="spending-bar-track"><div class="spending-bar-fill" style="width:30%;background:#f59e0b"></div></div>
        </div>
        <div class="rule-bar">
            <div class="rule-bar-header"><span>💰 Savings (20%)</span><span>$${savings.toFixed(2)} / $${savingsTarget.toFixed(2)}</span></div>
            <div class="rule-bar-sub">Emergency fund, retirement, goals</div>
            <div class="spending-bar-track"><div class="spending-bar-fill" style="width:${savingsPct}%;background:#10b981"></div></div>
        </div>`;
}

function renderTips(savingsRate, expenseRate, emergency, income) {
    const allTips = [
        { icon: '☕', title: 'Cut Daily Coffee', text: 'Making coffee at home instead of buying daily can save $100+ per month.' },
        { icon: '📱', title: 'Review Subscriptions', text: 'Cancel unused streaming, gym, or app subscriptions. Most people waste $50-200/month.' },
        { icon: '🛒', title: 'Meal Prep Weekly', text: 'Planning and prepping meals saves 30-50% on food costs compared to eating out.' },
        { icon: '⚡', title: 'Reduce Utility Bills', text: 'Unplug devices, use LED bulbs, and adjust your thermostat to save $50-100/month.' },
        { icon: '🚗', title: 'Carpool or Use Transit', text: 'Sharing rides or using public transport can cut transportation costs by 40-60%.' },
        { icon: '🏦', title: 'Automate Savings', text: 'Set up automatic transfers to savings on payday so you save before you spend.' },
        { icon: '💳', title: 'Pay Off High-Interest Debt', text: 'Paying off credit card debt (20%+ interest) is the best guaranteed return on your money.' },
        { icon: '🛍️', title: '24-Hour Rule', text: 'Wait 24 hours before any non-essential purchase over $50 to avoid impulse buying.' },
        { icon: '📊', title: 'Track Every Dollar', text: 'People who track spending save 15-20% more than those who don\'t.' },
        { icon: '🎯', title: 'Set Specific Goals', text: 'Having a specific savings goal (e.g., $5,000 emergency fund) makes you 42% more likely to save.' },
    ];
    const tips = savingsRate < 10
        ? allTips
        : expenseRate > 70
        ? allTips.slice(0, 6)
        : allTips.slice(4);
    document.getElementById('savingsTips').innerHTML = tips.slice(0, 6).map(t => `
        <div class="tip-card">
            <h4>${t.icon} ${t.title}</h4>
            <p>${t.text}</p>
        </div>`).join('');
}

function addGoalTracker() {
    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    if (!name || !target || target <= 0) return;
    goalTrackers.push({ name, target, current });
    localStorage.setItem('goalTrackers', JSON.stringify(goalTrackers));
    document.getElementById('goalName').value = '';
    document.getElementById('goalTarget').value = '';
    document.getElementById('goalCurrent').value = '';
    renderGoalsProgress();
}

function deleteGoalTracker(index) {
    goalTrackers.splice(index, 1);
    localStorage.setItem('goalTrackers', JSON.stringify(goalTrackers));
    renderGoalsProgress();
}

function renderGoalsProgress() {
    const el = document.getElementById('goalsProgress');
    if (!el) return;
    if (goalTrackers.length === 0) {
        el.innerHTML = '<p class="empty-state" style="padding:20px 0;">No goals tracked yet. Add a goal below.</p>';
        return;
    }
    el.innerHTML = goalTrackers.map((g, i) => {
        const pct = Math.min(100, (g.current / g.target) * 100).toFixed(1);
        const remaining = Math.max(0, g.target - g.current);
        return `
            <div class="goal-progress-item">
                <div class="goal-progress-header">
                    <span>🎯 ${g.name}</span>
                    <button class="delete-btn" onclick="deleteGoalTracker(${i})" style="font-size:0.8em;padding:5px 12px;">Remove</button>
                </div>
                <div class="goal-progress-bar-track">
                    <div class="goal-progress-bar-fill" style="width:${pct}%"></div>
                </div>
                <div class="goal-progress-footer">
                    <span>$${g.current.toFixed(2)} saved of $${g.target.toFixed(2)}</span>
                    <span>${pct}% — $${remaining.toFixed(2)} to go</span>
                </div>
            </div>`;
    }).join('');
}

// ===== SPENDING ANALYSIS =====
let currentPeriod = 'monthly';

const periodMultipliers = {
    weekly:    1 / 4.33,
    monthly:   1,
    quarterly: 3,
    yearly:    12
};

const periodLabels = {
    weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly'
};

const catColors = [
    '#667eea','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'
];

function switchPeriod(period, btn) {
    currentPeriod = period;
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderSpendingAnalysis();
}

function renderSpendingAnalysis() {
    const m = periodMultipliers[currentPeriod];
    const totalIncome   = income.reduce((s, i) => s + i.amount, 0) * m;
    const totalBills    = bills.reduce((s, i) => s + i.amount, 0) * m;
    const totalEmerg    = emergencySavings.reduce((s, i) => s + i.amount, 0) * m;
    const totalSav      = savings.reduce((s, i) => s + i.amount, 0) * m;
    const total401k     = retirement401k.reduce((s, i) => s + i.amount, 0) * m;
    const totalRoth     = rothIRA.reduce((s, i) => s + i.amount, 0) * m;
    const totalAllSav   = totalEmerg + totalSav + total401k + totalRoth;
    const remaining     = totalIncome - totalBills - totalAllSav;

    // Summary cards
    document.getElementById('spendingSummaryRow').innerHTML = [
        { label: 'Total Income',   value: totalIncome,   color: '#10b981' },
        { label: 'Total Expenses', value: totalBills,    color: '#ef4444' },
        { label: 'Total Savings',  value: totalAllSav,   color: '#667eea' },
        { label: 'Remaining',      value: remaining,     color: remaining >= 0 ? '#10b981' : '#ef4444' },
    ].map(s => `
        <div class="summary-stat-card">
            <div class="stat-label">${periodLabels[currentPeriod]} ${s.label}</div>
            <div class="stat-value" style="color:${s.color}">$${s.value.toFixed(2)}</div>
        </div>`).join('');

    // Category chart
    const byCategory = bills.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.amount * m;
        return acc;
    }, {});
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const maxAmt = sorted.length ? sorted[0][1] : 1;

    document.getElementById('categoryChart').innerHTML = sorted.length === 0
        ? '<p class="empty-state">No expenses added yet.</p>'
        : sorted.map(([cat, amt], i) => {
            const pct = ((amt / maxAmt) * 100).toFixed(1);
            const ofIncome = totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(1) : 0;
            return `
                <div class="cat-bar-row">
                    <div class="cat-bar-name">${cat}</div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width:${pct}%;background:${catColors[i % catColors.length]}">
                            ${pct > 15 ? ofIncome + '% of income' : ''}
                        </div>
                    </div>
                    <div class="cat-bar-amount">$${amt.toFixed(2)}</div>
                </div>`;
        }).join('');

    // Income vs Expenses vs Savings
    const maxBar = Math.max(totalIncome, totalBills, totalAllSav, 1);
    document.getElementById('incomeExpenseChart').innerHTML = [
        { label: 'Income',   value: totalIncome,  color: '#10b981' },
        { label: 'Expenses', value: totalBills,   color: '#ef4444' },
        { label: 'Savings',  value: totalAllSav,  color: '#667eea' },
        { label: 'Remaining',value: Math.max(0, remaining), color: '#f59e0b' },
    ].map(b => `
        <div class="iev-bar">
            <div class="iev-label"><span>${b.label}</span><span>$${b.value.toFixed(2)}</span></div>
            <div class="iev-track">
                <div class="iev-fill" style="width:${((b.value/maxBar)*100).toFixed(1)}%;background:${b.color}">
                    ${((b.value/maxBar)*100).toFixed(0)}%
                </div>
            </div>
        </div>`).join('');

    // Detailed breakdown
    const savingsRate = totalIncome > 0 ? ((totalAllSav / totalIncome) * 100).toFixed(1) : 0;
    const expenseRate = totalIncome > 0 ? ((totalBills / totalIncome) * 100).toFixed(1) : 0;
    document.getElementById('detailedBreakdown').innerHTML = [
        { label: 'Income',            value: `$${totalIncome.toFixed(2)}` },
        { label: 'Fixed Expenses',    value: `$${totalBills.toFixed(2)}` },
        { label: 'Emergency Savings', value: `$${totalEmerg.toFixed(2)}` },
        { label: '401(k)',            value: `$${total401k.toFixed(2)}` },
        { label: 'Roth IRA',          value: `$${totalRoth.toFixed(2)}` },
        { label: 'Regular Savings',   value: `$${totalSav.toFixed(2)}` },
        { label: 'Savings Rate',      value: `${savingsRate}%` },
        { label: 'Expense Rate',      value: `${expenseRate}%` },
        { label: 'Net Remaining',     value: `$${remaining.toFixed(2)}` },
    ].map(r => `
        <div class="breakdown-row">
            <span class="breakdown-label">${r.label}</span>
            <span class="breakdown-value">${r.value}</span>
        </div>`).join('');

    // Period comparison
    const periods = ['weekly', 'monthly', 'quarterly', 'yearly'];
    document.getElementById('periodComparison').innerHTML = periods.map(p => {
        const pm = periodMultipliers[p];
        const inc = income.reduce((s, i) => s + i.amount, 0) * pm;
        const exp = bills.reduce((s, i) => s + i.amount, 0) * pm;
        const sav = (emergencySavings.concat(savings, retirement401k, rothIRA)).reduce((s, i) => s + i.amount, 0) * pm;
        const rem = inc - exp - sav;
        return `
            <div class="comparison-col">
                <h4>${periodLabels[p]}</h4>
                <div class="comparison-item">
                    <div class="comparison-item-label">Income</div>
                    <div class="comparison-item-value" style="color:#10b981">$${inc.toFixed(2)}</div>
                </div>
                <div class="comparison-item">
                    <div class="comparison-item-label">Expenses</div>
                    <div class="comparison-item-value" style="color:#ef4444">$${exp.toFixed(2)}</div>
                </div>
                <div class="comparison-item">
                    <div class="comparison-item-label">Savings</div>
                    <div class="comparison-item-value" style="color:#667eea">$${sav.toFixed(2)}</div>
                </div>
                <div class="comparison-item">
                    <div class="comparison-item-label">Remaining</div>
                    <div class="comparison-item-value" style="color:${rem>=0?'#10b981':'#ef4444'}">$${rem.toFixed(2)}</div>
                </div>
            </div>`;
    }).join('');
}

