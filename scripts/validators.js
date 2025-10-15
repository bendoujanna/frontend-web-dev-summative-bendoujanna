// // Example search patterns:

    // // Cents present: /\.\d{2}\b/

    // // Beverage keyword: /(coffee|tea)/i

    // // Duplicate word: /\b(\w+)\s+\1\b/

// Description/title: forbid leading/trailing spaces and collapse doubles (e.g., /^\S(?:.*\S)?$/)

// Numeric field (amount/duration/pages): ^(0|[1-9]\d*)(\.\d{1,2})?$

// Date (YYYY-MM-DD): ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$

// Category/tag (letters, spaces, hyphens): /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/

// Advanced regex (≥1): e.g., back-reference to catch duplicate words \b(\w+)\s+\1\b, or lookahead for password/rate strength.


function isValideDescription(text) {
    const descRegex = /^\S(?:.*\S)?$/;
    const noRepetition = \b(\w+)\s+\1\b;
    return descRegex.test(text) && noRepetition.test(text);
}

function isValidAmount(value) {
    const amountRegex = ^(0|[1-9]\d*)(\.\d{1,2})?$;
    return amountRegex.test(value);
}

function isValidDate(date) {
    const dateRgex = ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$;
    return dateRgex.test(date);
}

function isValidCategory(type) {
    const categRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return categRegex.test(type);
}

function validateForm(formData) {
    const allInput = document.querySelectorAll("form-sec");
    return {
        isValideDescription(text);
        isValidAmount(value);
        isValidDate(Date);
        isValidCategory(type);
    }

}