
const STORAGE_KEY = "app:data";

// Load data (from localStorage or seed.json if empty)
export async function loadData() {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (dataStr) {
        try {
            const data = JSON.parse(dataStr);
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.error("Error parsing localStorage data:", err);
            return [];
        }
    } else {
        try {
            const response = await fetch("seed.json");
            const seedData = await response.json();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
            return seedData;
        } catch (err) {
            console.error("Failed to load seed.json:", err);
            return [];
        }
    }
}

// Save array to localStorage
export function saveData(data) {
    if (!Array.isArray(data)) return console.error("saveData expects an array");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get transactions synchronously
export function getTransactions() {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return [];
    try {
        const data = JSON.parse(dataStr);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Error parsing localStorage data:", err);
        return [];
    }
}


// Add new transaction
export function saveTransaction(transaction) {
    if (!transaction) return null;
    const transactions = getTransactions();

    const now = new Date().toISOString(); 
    transaction.id = Date.now();
    transaction.createdAt = now; 
    transaction.updatedAt = now;

    transactions.push(transaction);
    saveData(transactions);
    return transaction;
}

// Update transaction
export function updateTransaction(updated) {
    if (!updated?.id) return null;
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === updated.id);
    if (index === -1) return null;

    // Preserve createdAt, update updatedAt
    updated.createdAt = transactions[index].createdAt;
    updated.updatedAt = new Date().toISOString();

    transactions[index] = updated;
    saveData(transactions);
    return updated;
}


// Delete transaction
export function deleteTransaction(id) {
    const transactions = getTransactions();
    const newTransactions = transactions.filter(t => t.id !== id);
    saveData(newTransactions);
}

// Clear all transactions
export function clearAllTransactions() {
    localStorage.removeItem(STORAGE_KEY);
}
