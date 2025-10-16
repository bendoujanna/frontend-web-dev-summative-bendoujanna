/*Handle regular expressions and form validation*/


//Regex 
function isValidDescription(text) {
    const descRegex = /^\S(?:.*\S)?$/;  
    const noRepetition = /\b(\w+)\s+\1\b/;  
    return descRegex.test(text) && !noRepetition.test(text);
}

function isValidAmount(value) {
    const amountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
    return amountRegex.test(value);
}

function isValidDate(date) {
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return dateRegex.test(date);
}

function isValidCategory(type) {
    const categRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return categRegex.test(type);
}

function hasTwoCents(value) {
  const centsRegex = /\.\d{2}\b/;
  return centsRegex.test(value);
}

function containsBeverage(text) {
  const beverageRegex = /(coffee|tea)/i;
  return beverageRegex.test(text);
}

//  main validation function
function validateForm(formData) {
    const {description, amount, date, category, customizeCategory, type} = formData;
    
    // check for empty required fields 
    if (!description || !amount || !date || !category || !type) {
        alert("Please fill in all required fields.");
        return false;
    }

    // customizeCategory must be filled if the user chose 'other'
    if( category === "other" && !customizeCategory) {
        alert("Please specify your custom category.");
        return false;
    }

    // No repeated words and useless spaces
    if (!isValidDescription(description)) {
        alert("Description cannot start or end with space and contain repeated words");
        return false;
    }
    
    // No negative number
    if (!isValidAmount(amount)) {
        alert("Must be positive");
        return false;
    }

    if (hasTwoCents(amount)) {
        console.log(" Amount includes cents.");
    }

    if (containsBeverage(description)) {
        console.log(" Beverage-related transaction detected!");
    }

    // date validation
    if (!isValidDate(date)) {
        alert("Date format is not valid");
        return false;
    }

    // validate category and customizeCategory
    if (category === "other") {
        if (!isValidCategory(customizeCategory)) {
            alert("Must contain only letters, spaces or hyphens");
            return false;
        }
    } else {
        if (!isValidCategory(category)) {
            alert("Must enter a category.")
            return false;
        }
    }

    //  validate type
     if (type !== "income" && type !== "expense") {
        alert ("Please choose a valid transaction type.")
        return false;
     }

    //  return true if everything passed
     return true; 

}