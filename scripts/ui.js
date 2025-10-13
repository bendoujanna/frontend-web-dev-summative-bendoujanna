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

