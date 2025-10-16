
import { 
    getTransactions, 
    saveTransaction, 
    updateTransaction, 
    deleteTransaction,
    clearAllTransactions,
    loadData,
    saveData
} from './storage.js';

// ------------------- MENU -------------------

const buttons = document.querySelectorAll('.menu-button');
const sections = document.querySelectorAll('main section');
let currentSection = document.querySelector('.active');
let whileAnimating = false;

function switchTo(targetId) {
    if (whileAnimating) return;
    if (currentSection.id === targetId) return;

    whileAnimating = true;
    const nextSection = document.getElementById(targetId);

    currentSection.classList.remove('active');
    currentSection.classList.add('prev');

    nextSection.classList.add('active');

    nextSection.addEventListener('transitionend', function handler() {
        currentSection.classList.remove('prev');
        currentSection = nextSection;
        nextSection.removeEventListener('transitionend', handler);
        whileAnimating = false;

        const firstElement = nextSection.querySelector('*');
        if (firstElement) firstElement.focus();
    });

    updateAria();
}

buttons.forEach(button => button.addEventListener('click', () => switchTo(button.dataset.target)));
document.querySelectorAll('.back-home').forEach(b => b.addEventListener('click', () => switchTo('home')));

function updateAria() {
    sections.forEach(s => s.setAttribute('aria-hidden', !s.classList.contains('active')));
}

// ------------------- CATEGORY "OTHER" -------------------

const categorySelect = document.getElementById("category");
const customizeCategoryInput = document.getElementById("customizeCategory");

categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "other") {
        customizeCategoryInput.style.display = "block";
        customizeCategoryInput.required = true;
    } else {
        customizeCategoryInput.style.display = "none";
        customizeCategoryInput.required = false;
        customizeCategoryInput.value = "";
    }
});

// ------------------- SETTINGS -------------------

let currencies = { base: "$", other1: "€", other2: "F" };
let rates = { "$": 1, "€": 0.93, "F": 600 };
let selectedCurrency = currencies.base;

// ------------------- INITIALIZATION -------------------

document.addEventListener("DOMContentLoaded", async () => {

    // Load seed + localStorage
    let transactions = await loadData();
    if (!transactions || transactions.length === 0) {
        const res = await fetch('seed.json');
        const seedData = await res.json();
        await saveData(seedData);
        transactions = seedData;
    }

    await displayTransactions(transactions);
    await refreshDashboard();
    await updateStatistics();

    // Currency selection
    const displayCurrencySelect = document.getElementById("display-currency");
    if (displayCurrencySelect) {
        displayCurrencySelect.value = selectedCurrency;
        displayCurrencySelect.addEventListener("change", async () => {
            selectedCurrency = displayCurrencySelect.value;
            await refreshDashboard();
            await applyFilters();
        });
    }

    // Theme toggle
    const themeSelect = document.getElementById("theme");
    if (themeSelect) {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.body.classList.toggle("dark-theme", savedTheme === "dark");
        themeSelect.value = savedTheme;
        themeSelect.addEventListener("change", () => {
            const sel = themeSelect.value;
            document.body.classList.toggle("dark-theme", sel === "dark");
            localStorage.setItem("theme", sel);
        });
    }

    // Reset data
    const resetBtn = document.getElementById("reset-data");
    if (resetBtn) {
        resetBtn.addEventListener("click", async () => {
            if (!confirm("Reset all transactions?")) return;
            clearAllTransactions();
            const res = await fetch('seed.json');
            const seedData = await res.json();
            await saveData(seedData);
            alert("Transactions reset!");
            location.reload();
        });
    }

    // Filters
    ["searchInput", "sortByDate", "sortByCategory", "sortByType"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", applyFilters);
            el.addEventListener("change", applyFilters);
        }
    });
});

// ------------------- FORM -------------------

const form = document.getElementById("transaction-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedType = document.querySelector('input[name="type"]:checked');
    const formData = {
        description: document.getElementById("description").value.trim(),
        amount: document.getElementById("amount").value.trim(),
        date: document.getElementById("date").value,
        category: categorySelect.value,
        customizeCategory: customizeCategoryInput.value.trim(),
        type: selectedType ? selectedType.value : ""
    };
    if (!validateForm(formData)) return;
    await saveTransaction(formData);
    alert("Transaction saved!");
    await displayTransactions();
    await refreshDashboard();
    await updateStatistics();
    form.reset();
    customizeCategoryInput.style.display = "none";
});

// ------------------- DISPLAY -------------------

async function displayTransactions(filteredList) {
    const listContainer = document.querySelector(".records-list");
    const transactions = filteredList || await loadData();
    listContainer.innerHTML = "";
    if (!transactions.length) return listContainer.innerHTML = "<p>No transactions found.</p>";

    const headerDiv = document.createElement("div");
    headerDiv.classList.add("record-item", "record-header");
    headerDiv.innerHTML = `
        <div class="record-date">Date</div>
        <div class="record-description">Description</div>
        <div class="record-category">Category</div>
        <div class="record-amount">Amount</div>
    `;
    listContainer.appendChild(headerDiv);

    transactions.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("record-item");
        const amountClass = t.type === "income" ? "income" : "expense";
        const baseAmount = parseFloat(t.amount);
        const convertedAmount = (baseAmount / rates[currencies.base]) * rates[selectedCurrency];
        const formattedAmount = (t.type === "income" ? "+" : "-") + selectedCurrency + convertedAmount.toFixed(2);
        div.innerHTML = `
            <div class="record-date">${t.date}</div>
            <div class="record-description">${t.description}</div>
            <div class="record-category">${t.category}</div>
            <div class="record-amount ${amountClass}">${formattedAmount}</div>
        `;
        listContainer.appendChild(div);
    });
}

// ------------------- FILTERS -------------------

async function applyFilters() {
    let filtered = await loadData();
    const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const sortByDate = document.getElementById("sortByDate")?.value || "newest";
    const sortByCategory = document.getElementById("sortByCategory")?.value || "all";
    const sortByType = document.getElementById("sortByType")?.value || "all";

    if (searchValue) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchValue) || t.category.toLowerCase().includes(searchValue));
    if (sortByCategory !== "all") filtered = filtered.filter(t => t.category.toLowerCase() === sortByCategory);
    if (sortByType !== "all") filtered = filtered.filter(t => t.type === sortByType);

    filtered.sort((a,b) => sortByDate === "newest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    await displayTransactions(filtered);
}

// ------------------- DASHBOARD -------------------

async function updateDashboard() {
    const transactions = await loadData();
    let totalIncome = 0, totalExpenses = 0;
    transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        if (!isNaN(amount)) {
            if (t.type === "income") totalIncome += amount;
            if (t.type === "expense") totalExpenses += amount;
        }
    });
    const totalBalance = totalIncome - totalExpenses;
    const savings = totalIncome > 0 ? (totalBalance / totalIncome) * 100 : 0;
    const baseRate = rates[currencies.base] || 1;
    const selectedRate = rates[selectedCurrency] || 1;
    document.getElementById("income-amount").textContent = selectedCurrency + ((totalIncome / baseRate) * selectedRate).toFixed(2);
    document.getElementById("expense-amount").textContent = selectedCurrency + ((totalExpenses / baseRate) * selectedRate).toFixed(2);
    document.getElementById("balance-amount").textContent = selectedCurrency + ((totalBalance / baseRate) * selectedRate).toFixed(2);
    document.querySelector(".savings-amount").textContent = savings.toFixed(1) + "%";
}

// ------------------- CAP -------------------

let spendingCap = 0;
document.getElementById("set-cap")?.addEventListener("click", async () => {
    spendingCap = parseFloat(document.getElementById("cap-input")?.value);
    if (isNaN(spendingCap) || spendingCap <= 0) return alert("Enter valid cap.");
    await checkCapStatus();
});

async function checkCapStatus() {
    const transactions = await loadData();
    let totalExpenses = 0;
    transactions.forEach(t => { if (t.type === "expense") totalExpenses += parseFloat(t.amount); });

    const convertedTotalExpenses = (totalExpenses / rates[currencies.base]) * rates[selectedCurrency];
    const convertedCap = (spendingCap / rates[currencies.base]) * rates[selectedCurrency];

    const capStatus = document.getElementById("cap-status");
    if (!capStatus) return;

    if (convertedTotalExpenses > convertedCap) {
        capStatus.textContent = "Exceeded by " + (convertedTotalExpenses - convertedCap).toFixed(2);
        capStatus.className = "over";
    } else {
        capStatus.textContent = "Remaining " + (convertedCap - convertedTotalExpenses).toFixed(2);
        capStatus.className = "ok";
    }
}

// ------------------- REFRESH -------------------

async function refreshDashboard() {
    await updateDashboard();
    await checkCapStatus();
    await applyFilters();
}

// ------------------- STATISTICS -------------------

async function updateStatistics() {
    const transactions = await loadData();
    document.getElementById("total-records").textContent = transactions.length;

    const topCategoryEl = document.getElementById("top-category");
    if (transactions.length === 0) {
        topCategoryEl.textContent = "N/A";
    } else {
        const categoryCount = {};
        transactions.forEach(t => categoryCount[t.category.toLowerCase()] = (categoryCount[t.category.toLowerCase()] || 0) + 1);
        const topCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
        topCategoryEl.textContent = topCategory;
    }

    const trendContainer = document.getElementById("trend-chart");
    if (!trendContainer) return;
    const today = new Date();
    const last7 = Array(7).fill(0);

    transactions.forEach(t => {
        const diffDays = Math.floor((today - new Date(t.date)) / (1000*60*60*24));
        if (diffDays >=0 && diffDays < 7) last7[6 - diffDays]++;
    });

    trendContainer.innerHTML = "";
    last7.forEach(val => {
        const bar = document.createElement("div");
        bar.classList.add("trend-bar");
        bar.style.height = `${val*20}px`;
        trendContainer.appendChild(bar);
    });
}
