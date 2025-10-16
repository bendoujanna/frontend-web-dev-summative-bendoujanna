// Transitions 

// Select all menu buttons
const buttons = document.querySelectorAll('.menu-button');

// Select all sections
const sections = document.querySelectorAll('main section');

// Current active section
let currentSection = document.querySelector('.active');

// Prevent multiple animations at the same time
let whileAnimating = false;

// Function to switch sections
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
}

// Add click event to each menu button
buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        const targetId = button.dataset.target;
        switchTo(targetId);
    });
});

// Back to home buttons
const backButtons = document.querySelectorAll('.back-home');
backButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        switchTo('home');
    });
});

// Accessibility: aria-hidden
function updateAria() {
    sections.forEach(function(section) {
        if (section.classList.contains('active')) {
            section.setAttribute('aria-hidden', false);
        } else {
            section.setAttribute('aria-hidden', true);
        }
    });
}

// Call updateAria every time section changes
const oldSwitchTo = switchTo;
switchTo = function(targetId) {
    oldSwitchTo(targetId);
    updateAria();
};

//  Category "Other" 
const categorySelect = document.getElementById("category");
const customizeCategoryInput = document.getElementById("customizeCategory");

categorySelect.addEventListener("change", function() {
    if (categorySelect.value === "other") {
        customizeCategoryInput.style.display = "block";
        customizeCategoryInput.required = true;
    } else {
        customizeCategoryInput.style.display = "none";
        customizeCategoryInput.required = false;
        customizeCategoryInput.value = "";
    }
});



// Settings

// Multi-Currency
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

let selectedCurrency = currencies.base;

// function convertAmount(amount, targetCurrency) {
//     let baseToTarget = rates[targetCurrency] / rates[currencies.base];
//     return amount * baseToTarget;
// }



// Settings dropdown
document.addEventListener("DOMContentLoaded", function() {

    // Display Currency Selection
    const displayCurrencySelect = document.getElementById("display-currency");

    if (displayCurrencySelect) {
        displayCurrencySelect.addEventListener("change", function() {
            selectedCurrency = displayCurrencySelect.value; // Update displayed currency
            refreshDashboard();  // Refresh dashboard numbers
            applyFilters();      // Refresh records display
        });
    }


    const rate1Input = document.getElementById("rate1");
    const rate2Input = document.getElementById("rate2");

    if (rate1Input) {
        rate1Input.addEventListener("input", function() {
            const value = parseFloat(rate1Input.value);
            if (!isNaN(value)) rates[currencies.other1] = value;
            refreshDashboard();
            applyFilters();
        });
    }

    if (rate2Input) {
        rate2Input.addEventListener("input", function() {
            const value = parseFloat(rate2Input.value);
            if (!isNaN(value)) rates[currencies.other2] = value;
            refreshDashboard();
            applyFilters();
        });
    }
});


// Theme Toggle
const themeSelect = document.getElementById("theme");
if (themeSelect) {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark-theme", savedTheme === "dark");
    themeSelect.value = savedTheme;

    themeSelect.addEventListener("change", function() {
        const selectedTheme = themeSelect.value;
        document.body.classList.toggle("dark-theme", selectedTheme === "dark");
        localStorage.setItem("theme", selectedTheme);
    });
}




// Form Handling
const form = document.getElementById("transaction-form");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const selectedType = document.querySelector('input[name="type"]:checked');

    const formData = {
        description: document.getElementById("description").value.trim(),
        amount: document.getElementById("amount").value.trim(),
        date: document.getElementById("date").value,
        category: document.getElementById("category").value,
        customizeCategory: document.getElementById("customizeCategory").value.trim(),
        type: selectedType ? selectedType.value : ""
    };

    if (!validateForm(formData)) return;

    const newTransaction = saveTransaction(formData);

    alert("Transaction saved!");

    // Immediately update stats and dashboard
    displayTransactions();
    refreshDashboard();
    updateStatistics();
    form.reset();
    customizeCategoryInput.style.display = "none";
});



//Display Transactions 
function displayTransactions(filteredList) {
    const listContainer = document.querySelector(".records-list");
    const transactions = filteredList || getTransactions();

    listContainer.innerHTML = "";

    if (transactions.length === 0) {
        listContainer.innerHTML = "<p>No transactions found.</p>";
        return;
    }

    const headerDiv = document.createElement("div");
    headerDiv.classList.add("record-item", "record-header");
    headerDiv.innerHTML = `
        <div class="record-date">Date</div>
        <div class="record-description">Description</div>
        <div class="record-category">Category</div>
        <div class="record-amount">Amount</div>
    `;
    listContainer.appendChild(headerDiv);

    transactions.forEach(function(t) {
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



// Filters
function applyFilters() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const sortByDate = document.getElementById("sortByDate").value;
    const sortByCategory = document.getElementById("sortByCategory").value;
    const sortByType = document.getElementById("sortByType").value;

    let filtered = getTransactions();

    if (searchValue) {
        filtered = filtered.filter(function(t) {
            return t.description.toLowerCase().includes(searchValue) ||
                   t.category.toLowerCase().includes(searchValue);
        });
    }

    if (sortByCategory !== "all") {
        filtered = filtered.filter(function(t) {
            return t.category.toLowerCase() === sortByCategory;
        });
    }

    if (sortByType !== "all") {
        filtered = filtered.filter(function(t) {
            return t.type === sortByType;
        });
    }

    filtered.sort(function(a, b) {
        const da = new Date(a.date);
        const db = new Date(b.date);
        return sortByDate === "newest" ? db - da : da - db;
    });

    displayTransactions(filtered);
}

// Listen to filter changes
document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("sortByDate").addEventListener("change", applyFilters);
document.getElementById("sortByCategory").addEventListener("change", applyFilters);
document.getElementById("sortByType").addEventListener("change", applyFilters);



// Dashboard 

function getCurrencySymbol() {
    return selectedCurrency;
}

function updateDashboard() {

    const transactions = getTransactions();
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function(t) {
        const amount = parseFloat(t.amount);
        if (!isNaN(amount)) {
            if (t.type === "income") totalIncome += amount;
            if (t.type === "expense") totalExpenses += amount;
        }
    });

    const totalBalance = totalIncome - totalExpenses;
    const savings = totalIncome > 0 ? (totalBalance / totalIncome) * 100 : 0;

    // Conversion according to the currency slected
    const baseRate = rates[currencies.base] || 1;
    const selectedRate = rates[selectedCurrency] || 1;

    const convertedIncome = (totalIncome / baseRate) * selectedRate;
    const convertedExpenses = (totalExpenses / baseRate) * selectedRate;
    const convertedBalance = (totalBalance / baseRate) * selectedRate;

    const symbol = getCurrencySymbol();

    document.getElementById("income-amount").textContent = symbol + convertedIncome.toFixed(2);
    document.getElementById("expense-amount").textContent = symbol + convertedExpenses.toFixed(2);
    document.getElementById("balance-amount").textContent = symbol + convertedBalance.toFixed(2);
    document.querySelector(".savings-amount").textContent = savings.toFixed(1) + "%";

}



//Cap Tracker 
let spendingCap = 0;

document.getElementById("set-cap").addEventListener("click", function() {
    spendingCap = parseFloat(document.getElementById("cap-input").value);
    if (isNaN(spendingCap) || spendingCap <= 0) {
        alert("Please enter a valid cap amount.");
        return;
    }
    checkCapStatus();
});

function checkCapStatus() {
    const transactions = getTransactions();
    let totalExpenses = 0;
    transactions.forEach(function(t) {
        if (t.type === "expense") totalExpenses += parseFloat(t.amount);
    });

    const convertedTotalExpenses = (totalExpenses / rates[currencies.base]) * rates[selectedCurrency];
    const convertedCap = (spendingCap / rates[currencies.base]) * rates[selectedCurrency];

    const capStatus = document.getElementById("cap-status");
    if (convertedTotalExpenses > convertedCap) {
        capStatus.textContent = "You've exceeded your cap by " + (convertedTotalExpenses - convertedCap).toFixed(2) + "!";
        capStatus.className = "over";
    } else {
        capStatus.textContent = "You have " + (convertedCap - convertedTotalExpenses).toFixed(2) + " remaining.";
        capStatus.className = "ok";
    }
}



// Refresh 
function refreshDashboard() {
    updateDashboard();
    checkCapStatus();
    applyFilters();
}

// Load dashboard on page load
document.addEventListener("DOMContentLoaded", function() {
    displayTransactions();
    refreshDashboard();
});




// stats section

function updateStatistics() {
    const transactions = getTransactions();
    const totalRecords = transactions.length;

    // Total Records
    const totalRecordsEl = document.getElementById("total-records");
    if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;

    // Top Category
    const topCategoryEl = document.getElementById("top-category");
    if (transactions.length > 0) {
        const categoryCount = {};
        transactions.forEach(t => {
            const cat = t.category.toLowerCase();
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        const topCategory = Object.keys(categoryCount).reduce((a, b) =>
            categoryCount[a] > categoryCount[b] ? a : b
        );
        topCategoryEl.textContent = topCategory;
    } else {
        topCategoryEl.textContent = "N/A";
    }

    // Trend (last 7 days)
    const trendContainer = document.getElementById("trend-chart");
    if (trendContainer) {
        const today = new Date();
        const last7 = Array(7).fill(0);

        transactions.forEach(t => {
            const diffDays = Math.floor((today - new Date(t.date)) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                last7[6 - diffDays]++; // most recent on the right
            }
        });

        trendContainer.innerHTML = "";
        last7.forEach(val => {
            const bar = document.createElement("div");
            bar.classList.add("trend-bar");
            bar.style.height = `${val * 20}px`; // each record = 20px tall
            trendContainer.appendChild(bar);
        });
    }
}


// load correctly dahsborad, records and stats when the page opens
document.addEventListener("DOMContentLoaded", function() {
    displayTransactions();
    refreshDashboard();
    updateStatistics();

    // Reset Data button
    const resetBtn = document.getElementById("reset-data");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
                localStorage.clear();
                alert("All data has been reset!");
                location.reload();
            }
        });
    }
});


