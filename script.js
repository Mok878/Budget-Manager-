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
    const multiplier = getMultiplier();
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
