
import {
    getTransactions,
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    loadData,
    saveData
} from './storage.js';

// Ensure seed data is loaded into localStorage before anything else
async function ensureSeedData() {
    const currentData = localStorage.getItem("app:data");

    if (!currentData || currentData === "[]") {
        console.log("No data in localStorage, loading seed.json...");
        try {
            const res = await fetch("seed.json");
            const seedData = await res.json();

            // Format seed data: add ids and numeric amounts
            const formattedSeed = seedData.map((t, i) => ({
                id: t.id || (Date.now() + i),
                description: t.description || "",
                amount: Number(t.amount) || 0,
                date: t.date || new Date().toISOString().split("T")[0],
                category: t.category || "other",
                type: t.type || "expense",
                createdAt: t.createdAt || new Date().toISOString(),
                updatedAt: t.updatedAt || new Date().toISOString()
            }));

            localStorage.setItem("app:data", JSON.stringify(formattedSeed));
            console.log("Seed data saved to localStorage:", formattedSeed.length, "records");
        } catch (err) {
            console.error("Failed to load seed.json:", err);
        }
    } else {
        console.log("LocalStorage already has data.");
    }
}

// Run immediately before anything else
await ensureSeedData();


// ---------------- MENU ----------------

const buttons = document.querySelectorAll(".menu-button");
const sections = document.querySelectorAll("main section");
let currentSection = document.querySelector(".active");
let whileAnimating = false;

function switchTo(targetId) {
    if (whileAnimating) return;
    if (currentSection.id === targetId) return;

    whileAnimating = true;
    const nextSection = document.getElementById(targetId);

    currentSection.classList.remove("active");
    currentSection.classList.add("prev");
    nextSection.classList.add("active");

    nextSection.addEventListener("transitionend", function handler() {
        currentSection.classList.remove("prev");
        currentSection = nextSection;
        nextSection.removeEventListener("transitionend", handler);
        whileAnimating = false;
    });

    updateAria();
}

buttons.forEach(btn => btn.addEventListener("click", () => switchTo(btn.dataset.target)));
document.querySelectorAll(".back-home").forEach(b => b.addEventListener("click", () => switchTo("home")));

function updateAria() {
    sections.forEach(s => s.setAttribute("aria-hidden", !s.classList.contains("active")));
}

// ---------------- CATEGORY OTHER ----------------

const categorySelect = document.getElementById("category");
const customInput = document.getElementById("customizeCategory");

if (categorySelect) {
    categorySelect.addEventListener("change", function () {
        if (categorySelect.value === "other") {
            customInput.style.display = "block";
        } else {
            customInput.style.display = "none";
            customInput.value = "";
        }
    });
}

// ---------------- SETTINGS ----------------

let currencies = {
    base: "$",
    other1: "€",
    other2: "F"
};

let rates = {
    "$": 1,
    "€": 0.93,
    "F": 600
};

let selectedCurrency = "$";

// load saved settings if exist
if (localStorage.getItem("settings")) {
    const saved = JSON.parse(localStorage.getItem("settings"));
    currencies = saved.currencies;
    rates = saved.rates;
    selectedCurrency = saved.selectedCurrency;
}

function saveSettings() {
    const settings = {
        currencies: currencies,
        rates: rates,
        selectedCurrency: selectedCurrency
    };
    localStorage.setItem("settings", JSON.stringify(settings));
}

// -------------- THEME -----------------

const themeSelect = document.getElementById("theme");

if (themeSelect) {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark-theme", savedTheme === "dark");
    themeSelect.value = savedTheme;

    themeSelect.addEventListener("change", function () {
        const selected = themeSelect.value;
        document.body.classList.toggle("dark-theme", selected === "dark");
        localStorage.setItem("theme", selected);
    });
}

// -------------- OTHER SETTINGS -----------------

const baseCurrency = document.getElementById("base-currency");
const currency1 = document.getElementById("currency1");
const currency2 = document.getElementById("currency2");
const rate1 = document.getElementById("rate1");
const rate2 = document.getElementById("rate2");
const displayCurrency = document.getElementById("display-currency");
const resetBtn = document.getElementById("reset-data");

if (baseCurrency) baseCurrency.value = currencies.base;
if (currency1) currency1.value = currencies.other1;
if (currency2) currency2.value = currencies.other2;
if (displayCurrency) displayCurrency.value = selectedCurrency;
if (rate1) rate1.value = rates[currencies.other1];
if (rate2) rate2.value = rates[currencies.other2];

if (baseCurrency) {
    baseCurrency.addEventListener("change", function () {
        currencies.base = baseCurrency.value;
        rates[currencies.base] = 1;
        saveSettings();
        refreshDashboard();
    });
}

if (currency1) {
    currency1.addEventListener("change", function () {
        currencies.other1 = currency1.value;
        saveSettings();
        refreshDashboard();
    });
}

if (currency2) {
    currency2.addEventListener("change", function () {
        currencies.other2 = currency2.value;
        saveSettings();
        refreshDashboard();
    });
}

if (rate1) {
    rate1.addEventListener("input", function () {
        const val = parseFloat(rate1.value);
        if (!isNaN(val) && val > 0) {
            rates[currencies.other1] = val;
            saveSettings();
            refreshDashboard();
        }
    });
}

if (rate2) {
    rate2.addEventListener("input", function () {
        const val = parseFloat(rate2.value);
        if (!isNaN(val) && val > 0) {
            rates[currencies.other2] = val;
            saveSettings();
            refreshDashboard();
        }
    });
}

if (displayCurrency) {
    displayCurrency.addEventListener("change", function () {
        selectedCurrency = displayCurrency.value;
        saveSettings();
        refreshDashboard();
        applyFilters();
    });
}

// -------------- RESET DATA -----------------

if (resetBtn) {
    resetBtn.addEventListener("click", async function () {
        const confirmReset = confirm("Do you really want to reset all data?");
        if (!confirmReset) return;

        clearAllTransactions();

        const res = await fetch("seed.json");
        const seedData = await res.json();

        // Make sure each transaction has proper numeric amount and an ID
        const formattedSeed = seedData.map((t, i) => ({
        id: t.id || Date.now() + i,
        description: t.description || "",
        amount: parseFloat(t.amount) || 0,
        date: t.date || new Date().toISOString().split("T")[0],
        category: t.category || "other",
        type: t.type || "expense"
        }));

        await saveData(formattedSeed);


        currencies = { base: "$", other1: "€", other2: "F" };
        rates = { "$": 1, "€": 0.93, "F": 600 };
        selectedCurrency = "$";
        saveSettings();

        alert("Data has been reset!");
        displayTransactions(formattedSeed);
        updateDashboard();
        updateStats();
        checkCapStatus();
        // location.reload();
    });
}


// ---------------- LOAD INITIAL DATA ----------------

document.addEventListener("DOMContentLoaded", async function () {
    let data = await loadData();

    // If no data in localStorage, load from seed.json
    if (!data || data.length === 0) {
        try {
            const res = await fetch("seed.json");
            const seedData = await res.json();

            // Make sure every seed item has proper structure
            const formattedSeed = seedData.map((t, i) => ({
                id: t.id || Date.now() + i,
                description: t.description || "",
                amount: parseFloat(t.amount) || 0,
                date: t.date || new Date().toISOString().split("T")[0],
                category: t.category || "other",
                type: t.type || "expense"
            }));

            // Save formatted seed to localStorage
            await saveData(formattedSeed);
            data = formattedSeed;
            console.log("Seed data loaded into localStorage");
        } catch (err) {
            console.error("Failed to load seed.json:", err);
            data = [];
        }
    }

    // Always reload data from localStorage for dashboard accuracy
    const allData = getTransactions();
    displayTransactions(allData);
    updateDashboard();
    updateStats();
});


// ---------------- FORM SUBMIT ----------------

const form = document.getElementById("transaction-form");
const defaultFormSubmit = form.onsubmit;

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const selectedType = document.querySelector('input[name="type"]:checked');
        const newData = {
            description: document.getElementById("description").value.trim(),
            amount: document.getElementById("amount").value.trim(),
            date: document.getElementById("date").value,
            category: categorySelect.value,
            customizeCategory: customInput.value.trim(),
            type: selectedType ? selectedType.value : ""
        };

        await saveTransaction(newData);
        alert("Transaction saved!");
        displayTransactions();
        refreshDashboard();
        updateStats();
        form.reset();
        customInput.style.display = "none";
    });
}

// ---------------- DISPLAY TRANSACTIONS ----------------

async function displayTransactions(filtered) {
    const list = document.querySelector(".records-list");
    const all = filtered || await loadData();

    list.innerHTML = "";

    if (all.length === 0) {
        list.innerHTML = "<p>No transactions yet.</p>";
        return;
    }

    const header = document.createElement("div");
    header.classList.add("record-item", "record-header");
    header.innerHTML = `
        <div class="record-date">Date</div>
        <div class="record-description">Description</div>
        <div class="record-category">Category</div>
        <div class="record-amount">Amount</div>
    `;
    list.appendChild(header);

    all.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("record-item");

        const converted = (parseFloat(t.amount) / rates[currencies.base]) * rates[selectedCurrency];
        const symbol = selectedCurrency;
        const sign = t.type === "income" ? "+" : "-";

        div.innerHTML = `
            <div class="record-date">${t.date}</div>
            <div class="record-description">${t.description}</div>
            <div class="record-category">${t.category}</div>
            <div class="record-amount ${t.type}">${sign}${symbol}${converted.toFixed(2)}</div>
        `;
        list.appendChild(div);

        // Add Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");
        editBtn.addEventListener("click", () => openEditForm(t.id));
        div.appendChild(editBtn);
    });

}
async function openEditForm(id) {
    const transactions = await loadData();
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Prefill the form
    document.getElementById("description").value = transaction.description;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("date").value = transaction.date;
    document.getElementById("category").value = transaction.category;

    if (transaction.category === "other") {
        document.getElementById("customizeCategory").style.display = "block";
        document.getElementById("customizeCategory").value = transaction.customizeCategory;
    } else {
        document.getElementById("customizeCategory").style.display = "none";
        document.getElementById("customizeCategory").value = "";
    }

    const typeRadio = document.querySelector(`input[name="type"][value="${transaction.type}"]`);
    if (typeRadio) typeRadio.checked = true;

    // Change form submit behavior
    form.onsubmit = async function (e) {
        e.preventDefault();

        const selectedType = document.querySelector('input[name="type"]:checked');
        const updated = {
            id: transaction.id,
            description: document.getElementById("description").value.trim(),
            amount: document.getElementById("amount").value.trim(),
            date: document.getElementById("date").value,
            category: document.getElementById("category").value,
            customizeCategory: document.getElementById("customizeCategory").value.trim(),
            type: selectedType ? selectedType.value : ""
        };

        await updateTransaction(updated);

        alert("Transaction updated!");
        form.reset();
        document.getElementById("customizeCategory").style.display = "none";

        // Restore default submit behavior
        form.onsubmit = defaultFormSubmit;

        // Refresh UI
        displayTransactions();
        refreshDashboard();
        updateStats();
    };
}

// ---------------- FILTERS ----------------

async function applyFilters() {
    let all = await loadData();

    const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const sortDate = document.getElementById("sortByDate")?.value || "newest";
    const sortCat = document.getElementById("sortByCategory")?.value || "all";
    const sortType = document.getElementById("sortByType")?.value || "all";

    if (search) {
        all = all.filter(t =>
            t.description.toLowerCase().includes(search) ||
            t.category.toLowerCase().includes(search)
        );
    }

    if (sortCat !== "all") {
        all = all.filter(t => t.category.toLowerCase() === sortCat);
    }

    if (sortType !== "all") {
        all = all.filter(t => t.type === sortType);
    }

    all.sort((a, b) =>
        sortDate === "newest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

    displayTransactions(all);
}

// ---------------- DASHBOARD ----------------

async function updateDashboard() {
    const data = await loadData();

    let income = 0;
    let expense = 0;

    data.forEach(t => {
        const amount = parseFloat(t.amount);
        if (t.type === "income") income += amount;
        if (t.type === "expense") expense += amount;
    });

    const balance = income - expense;
    const savings = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

    const symbol = selectedCurrency;
    const rateBase = rates[currencies.base];
    const rateSelected = rates[selectedCurrency];

    document.getElementById("income-amount").textContent = symbol + ((income / rateBase) * rateSelected).toFixed(2);
    document.getElementById("expense-amount").textContent = symbol + ((expense / rateBase) * rateSelected).toFixed(2);
    document.getElementById("balance-amount").textContent = symbol + ((balance / rateBase) * rateSelected).toFixed(2);
    document.querySelector(".savings-amount").textContent = savings + "%";
}

// ---------------- CAP ----------------

let spendingCap = 0;
const setCapBtn = document.getElementById("set-cap");

if (setCapBtn) {
    setCapBtn.addEventListener("click", async function () {
        spendingCap = parseFloat(document.getElementById("cap-input").value);
        if (isNaN(spendingCap) || spendingCap <= 0) {
            alert("Please enter a valid cap.");
            return;
        }
        checkCapStatus();
    });
}

async function checkCapStatus() {
    const data = await loadData();
    const totalExpenses = data.filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const capStatus = document.getElementById("cap-status");
    if (!capStatus) return;

    if (totalExpenses > spendingCap) {
        capStatus.textContent = "You exceeded your cap by $" + (totalExpenses - spendingCap).toFixed(2);
        capStatus.className = "over";
    } else {
        capStatus.textContent = "Remaining $" + (spendingCap - totalExpenses).toFixed(2);
        capStatus.className = "ok";
    }
}

// ---------------- STATS ----------------

async function updateStats() {
    const data = await loadData();
    document.getElementById("total-records").textContent = data.length;

    const categories = {};
    data.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });

    const top = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("top-category").textContent = top ? top[0] : "N/A";

    const trend = document.getElementById("trend-chart");
    trend.innerHTML = "";

    const today = new Date();
    const last7 = Array(7).fill(0);

    data.forEach(t => {
        const diff = Math.floor((today - new Date(t.date)) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) last7[6 - diff]++;
    });

    last7.forEach(v => {
        const bar = document.createElement("div");
        bar.classList.add("trend-bar");
        bar.style.height = (v * 20) + "px";
        trend.appendChild(bar);
    });
}

// ---------------- REFRESH ----------------

function refreshDashboard() {
    updateDashboard();
    checkCapStatus();
    applyFilters();
}

// ---------------- FILTER LISTENERS ----------------

document.addEventListener("DOMContentLoaded", function () {
    const filterIds = ["searchInput", "sortByDate", "sortByCategory", "sortByType"];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", applyFilters);
            el.addEventListener("change", applyFilters);
        }
    });
});

// ---------------- EXPORT CSV ----------------
const exportBtn = document.getElementById("exportCSV");

if (exportBtn) {
    exportBtn.addEventListener("click", async function () {
        const data = await loadData();
        if (!data || data.length === 0) {
            alert("No transactions to export!");
            return;
        }

        const headers = ["ID", "Description", "Amount", "Category", "Type", "Date", "CreatedAt", "UpdatedAt"];
        const rows = data.map(t => [
            t.id || "",
            t.description || "",
            t.amount || "",
            t.category || t.customizeCategory || "",
            t.type || "",
            t.date || "",
            t.createdAt || "",
            t.updatedAt || ""
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();
        URL.revokeObjectURL(url);
    });
}

