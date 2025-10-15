/*Handles saving, reading, updating, and deleting transactions in localStorage*/

// Get all transactions from localStorage

console.log("validators.js loaded!")
function getTransactions() {
    const data = localStorage.getItem("transactions");
    return data ? JSON.parse(data) : [];
}

// Save all transactions back to localStorage
function saveTransactionsToStorage(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Create a new transaction and store it
function saveTransaction(formData) {
    const transactions = getTransactions();

    const id = "rec_" + Date.now();
    const now = new Date().toISOString();

    const newTransaction = {
        id: id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category === "other"
            ? formData.customizeCategory.trim()
            : formData.category,
        date: formData.date,
        type: formData.type,
        createdAt: now,
        updatedAt: now
    };

    transactions.push(newTransaction);
    saveTransactionsToStorage(transactions);

    console.log("Transaction saved:", newTransaction);
    return newTransaction;
}

// Update an existing transaction
function updateTransaction(id, updatedData) {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === id);

    if (index !== -1) {
        transactions[index] = {
            ...transactions[index],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        saveTransactionsToStorage(transactions);
        console.log(`Transaction ${id} updated.`);
        return true;
    } else {
        console.warn(`Transaction ${id} not found.`);
        return false;
    }
}

// Delete a transaction by ID
function deleteTransaction(id) {
    let transactions = getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    saveTransactionsToStorage(transactions);
    console.log(`Transaction ${id} deleted.`);
}

// Clear all transactions
function clearAllTransactions() {
    localStorage.removeItem("transactions");
    console.log("All transactions cleared.");
}