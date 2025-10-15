// PART 1

//select all the buttons
const buttons = document.querySelectorAll('.menu-button');

//select all the sections inside main
const sections=document.querySelectorAll('main section');

//keep the section currenlty visible
let currentSection=document.querySelector('.active');

//prevent from disturbing the transition
let whileAnimating = false;

function switchTo(targetId) {
    if (whileAnimating) {
        return;
    }
    if (currentSection.id === targetId) {
        return;
    }
    
    whileAnimating = true;
    const nextSection = document.getElementById(targetId);

    //make the sections moving to the left
    currentSection.classList.remove('active');
    currentSection.classList.add('prev');

    //show another (new) section on the the right
    nextSection.classList.add('active');

    //
    nextSection.addEventListener('transitionend', function handler(){
        currentSection.classList.remove('prev');
        currentSection = nextSection;
        nextSection.removeEventListener('transitionend', handler); //remove the istener to avoid repetitions
        whileAnimating = false; //end of the animation

        const firstElement = nextSection.querySelector('*');
        if (firstElement) firstElement.focus();
    });

}

//add listeners on each button'
buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const targetId=button.dataset.target;
        switchTo(targetId);  //calling the function
    });
});


//back to home buttons
const backButtons = document.querySelectorAll('.back-home');

backButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchTo('home')  //go back to Home section
    });
});


//Improving Accessibility 
function updateAria() {
    sections.forEach((section) => {
        const isVisible = section.classList.contains('active');
        section.setAttribute('aria-hidden', !isVisible)
    });
}

//calling the function at each change
const oldSwitchTo = switchTo;
switchTo = function (targetId) {
   oldSwitchTo(targetId);
   updateAria(); 
};



// PART 2

//Make the "other" category editable
const categorySelect = document.getElementById("category");
const customizeCategoryInput = document.getElementById("customizeCategory");

categorySelect.addEventListener("change", function() {
    if (categorySelect.value == "other") {
        customizeCategoryInput.style.display="block";
        customizeCategoryInput.required = true;
    }  
    else {
        customizeCategoryInput.style.display="none";
        customizeCategoryInput.required = false;
        customizeCategoryInput.value = "";
    }


})


/*Form handling - Add/Edit transactions */

// Select the form
const form = document.getElementById("transaction-form");

// Handle form submission
form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    // Get the checked radio button for "type"
    const selectedType = document.querySelector('input[name="type"]:checked');

    // Collect data from the form safely
    const formData = {
        description: document.getElementById("description").value.trim(),
        amount: document.getElementById("amount").value.trim(),
        date: document.getElementById("date").value,
        category: document.getElementById("category").value,
        customizeCategory: document.getElementById("customizeCategory").value.trim(),
        type: selectedType ? selectedType.value : "" // prevent null
    };

    // show in console
    console.log("Form data collected:", formData);

    // Validate form inputs
    if (!validateForm(formData)) {
        console.warn(" Validation failed.");
        return; // stop here if invalid
    }

    // Save transaction
    const newTransaction = saveTransaction(formData);
    console.log("Transaction saved:", newTransaction);

    alert("Transaction saved successfully!");

    // update record 
    displayTransactions();

    // Reset form and hide the custom category
    form.reset();
    document.getElementById("customizeCategory").style.display = "none";

});

// Global function to display transactions
function displayTransactions(filteredList = null) {
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

    transactions.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("record-item");

        const amountClass = t.type === "income" ? "income" : "expense";
        const formattedAmount =
            (t.type === "income" ? "+" : "-") + "$" + parseFloat(t.amount).toFixed(2);

        div.innerHTML = `
            <div class="record-date">${t.date}</div>
            <div class="record-description">${t.description}</div>
            <div class="record-category">${t.category}</div>
            <div class="record-amount ${amountClass}">${formattedAmount}</div>
        `;

        listContainer.appendChild(div);
    });
}


/*Filters and search*/

function applyFilters() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const sortByDate = document.getElementById("sortByDate").value;
    const sortByCategory = document.getElementById("sortByCategory").value;
    const sortByType = document.getElementById("sortByType").value;

    let filtered = getTransactions();

    //Search
    if (searchValue) {
        filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchValue) ||
        t.category.toLowerCase().includes(searchValue)
        );
    }

    //Category Filter
    if (sortByCategory !== "all") {
        filtered = filtered.filter(t => t.category.toLowerCase() === sortByCategory);
    }

    //Type Filter
    if (sortByType !== "all") {
        filtered = filtered.filter(t => t.type === sortByType);
    }

    //Sort by Date
    filtered.sort((a, b) => {
        const da = new Date(a.date);
        const db = new Date(b.date);
        return sortByDate === "newest" ? db - da : da - db;
    });

    displayTransactions(filtered);
    }

//Listen for changes on all filters
document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("sortByDate").addEventListener("change", applyFilters);
document.getElementById("sortByCategory").addEventListener("change", applyFilters);
document.getElementById("sortByType").addEventListener("change", applyFilters);

// Show saved transactions when the page loads
document.addEventListener("DOMContentLoaded", () => {
    displayTransactions();
});


/** export filtered transactions to csv **/

function exportToCSV() {
    // Get the current filtered transactions
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const sortByDate = document.getElementById("sortByDate").value;
    const sortByCategory = document.getElementById("sortByCategory").value;
    const sortByType = document.getElementById("sortByType").value;

    let transactions = getTransactions();

    // Apply same filters before export
    if (searchValue) {
        transactions = transactions.filter(t =>
            t.description.toLowerCase().includes(searchValue) ||
            t.category.toLowerCase().includes(searchValue)
        );
    }

    if (sortByCategory !== "all") {
        transactions = transactions.filter(t => t.category.toLowerCase() === sortByCategory);
    }

    if (sortByType !== "all") {
        transactions = transactions.filter(t => t.type === sortByType);
    }

    // Sort by date
    transactions.sort((a, b) => {
        const da = new Date(a.date);
        const db = new Date(b.date);
        return sortByDate === "newest" ? db - da : da - db;
    });

    // Stop if empty
    if (transactions.length === 0) {
        alert("No transactions to export.");
        return;
    }

    // Define CSV headers
    const headers = ["ID", "Description", "Amount", "Category", "Type", "Date", "CreatedAt", "UpdatedAt"];

    // Convert to CSV string
    const rows = transactions.map(t => [
        t.id,
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.amount,
        t.category,
        t.type,
        t.date,
        t.createdAt,
        t.updatedAt
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");

    // Create downloadable CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("CSV exported successfully!");
}

// Attach event listener
document.getElementById("exportCSV").addEventListener("click", exportToCSV);

