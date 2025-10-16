**Finance Tracker**

Finance Tracker is a web-based personal finance management tool that helps users track income, expenses, and overall financial health. It provides a dynamic dashboard, categorized transactions, and budgeting features to support informed financial decisions.

**Table of Contents**

    Features
    
    Installation
    
    Usage
    
    Technical Details
    
    Data Management
    
    Contributing

    License


Features  

    Add, update, and delete income or expense transactions
    
    View real-time financial dashboard with total income, expenses, balance, and savings rate
    
    Set a spending cap and monitor progress
    
    Filter and sort transactions by date, category, or type
    
    Convert amounts between multiple currencies with customizable rates

    Light and dark theme selection

    Reset or import default transaction data (seed data)

**Installation**

Clone the repository:

    git clone https://github.com/yourusername/finance-tracker.git
    cd finance-tracker


Open index.html in a web browser.

(Optional) For full browser compatibility, run a local server:

    # Python 3.x
python -m http.server

**Usage**

    Open the application in your browser
    
    Use the transaction form to add income or expense records
    
    View updated metrics on the dashboard
    
    Apply filters to search or sort transactions
    
    Set a spending cap to monitor expenses
    
    Adjust currency rates and theme in settings

    Use the reset button to restore default seed data

**Technical Details**

    Languages: HTML, CSS, JavaScript
    
    Libraries: Vanilla JavaScript, LocalStorage API, JSON for seed data
    
    Architecture: Modular JS structure separating UI logic, storage, filters, and dashboard calculations
    
    Calculations: Dashboard computes total income, expenses, balance, savings rate, and spending cap dynamically

**Data Management**

    Transactions are stored locally in LocalStorage
    
    Default transactions are loaded from seed.json
    
    Currency conversions and calculations are applied to all stored and seeded transactions
    
    All operations are performed client-side with no external server required

**Demo video**
