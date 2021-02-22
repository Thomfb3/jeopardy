// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
//Array to capture categories
let categories = [];
//Array that represents game board
let jeopardyBoard = [];
//Variable for number of categories
const NUM_CATEGORIES = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    //Reset categories array
    categories = [];

    //Create an array of unique random numbers from 1 to the length of categories in API. the Set is to remove duplicates
    let catIds = _.uniq(Array.from({ length: 50 }, () => Math.floor((Math.random() * 1100))));

    //Turn Set back into an array with the length of "number of categories"
    catIds = _.chunk(catIds, NUM_CATEGORIES)[0];

    //Use array of random numbers to call categories by ID from API 
    for (cat of catIds) {
        try {
            //Save each category as response
            const response = await axios.get(`http://jservice.io/api/category?id=${cat}`);
            //push categories to categories array
            categories.push({ id: response.data.id, title: response.data.title });
        } catch (e) {
            //If category is not there catch the error
            alert("OOPS, try again!");
        }
    }
}



//Helper function to remove objects with empty strings
function objectFilter(obj) {

    for (let value of Object.values(obj)) {
        if (value === "" || value === "=" || value === "[audio]") {
            return false;
        }
    }
    return true;
}



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    //Create clues Object to structure clue data
    const cluesObj = {};
    //Create the clues array that will be the array of clues for every category
    const cluesArray = []

    //Call the API for the clues to catID
    const response = await axios.get(`http://jservice.io/api/clues?category=${catId}`);
    //Save the response data
    let clues = response.data;
 
    //filter clues object to remove clue with empty strings
    clues = clues.filter(obj => objectFilter(obj) === true);

    //if there are less than 5 clues, the function call itself again moving up one category id;
    if (clues.length < 5) {
       return await getCategory(catId + 1);
    }

    //set the category title in cluesObj
    cluesObj.title = clues[0].category.title;

    //if there only five clues, shuffle them add them to cluesArray
    if (clues.length <  6) {
        //For each index
        for (const idx of _.shuffle([0, 1, 2, 3, 4])) {
            //Push to clues Array  
            cluesArray.push({ question: clues[idx].question, answer: clues[idx].answer, showing: null });
        }
    } else {
        //if there are more than 5 clues 
        //Create an array of unique random numbers with the length of "number of clues" found in the API's category
        let clueIndices = _.uniq(Array.from({ length: clues.length }, () => Math.floor((Math.random() * clues.length))));
 
        //Shorten the array length to five
        clueIndices = _.chunk(clueIndices, 5)[0];

        //For each index
        for (const idx of clueIndices) {
            //Push to clues Array
            cluesArray.push({ question: clues[idx].question, answer: clues[idx].answer, showing: null });
        }
    }
    //Save the clues Array to the cluesObject 
    cluesObj.clues = cluesArray;
    
    //return clues object
    return cluesObj;
}



/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    //call getCategoryIds, adds categories to categories array
    await getCategoryIds();

    //Get game board element and clear it
    const jeopardyTable = document.getElementById("jeopardy");
    jeopardyTable.innerText = "";

    //Add event listener to game board
    jeopardyTable.addEventListener("click", handleClick);

    //create table header
    const jeopardyTableHead = document.createElement("THEAD")
    const jeopardyTableHeadRow = document.createElement("TR")

    //For each category in the categories array
    for (const category of categories) {
        //Create a table cell
        const jeopardyCategoryTitle = document.createElement("TD")
        //Add category name to the cell
        jeopardyCategoryTitle.innerText = category.title;
        //Append cell to the header row
        jeopardyTableHeadRow.append(jeopardyCategoryTitle);
        //Run getCategory with the category id
        jeopardyBoard.push(await getCategory(category.id));
    }

    //Append header row to table header
    jeopardyTableHead.append(jeopardyTableHeadRow);
    //Append table header to table
    jeopardyTable.append(jeopardyTableHead);

    //Save table body
    const jeopardyTableBody = document.createElement("TBODY");
    //Append table body to the table
    jeopardyTable.append(jeopardyTableBody);

    //Loop through jeopardy board 
    for (let y = 0; y < jeopardyBoard.length; y++) {
        //Create row
        const jeopardyCluesRow = document.createElement("TR");

        //loop to create cells
        for (let x = 0; x < jeopardyBoard.length; x++) {
            //create td element
            const jeopardyClue = document.createElement("TD");
            //Set innerText to "?""
            jeopardyClue.innerText = "?";
            //Assign id with X and Y coordinates
            jeopardyClue.setAttribute("id", `${y}-${x}`)
            //Append td (clue/cell) to tr (row)
            jeopardyCluesRow.append(jeopardyClue);

        }
        //Append row to table body
        jeopardyTableBody.append(jeopardyCluesRow);
    }

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    //collect the row number form target id
    const cluePositionRow = [...evt.target.id][0];
    //collect the column number form target id
    const cluePositionColumn = [...evt.target.id][2];

    //If the showing property is null...
    if (!jeopardyBoard[cluePositionColumn].clues[cluePositionRow].showing) {
        //the target innerHTML is set to clue.question
        evt.target.innerHTML = jeopardyBoard[cluePositionColumn].clues[cluePositionRow].question;
        //the clue.showing property is set to "question"
        jeopardyBoard[cluePositionColumn].clues[cluePositionRow].showing = "question";
        //If the showing property is not null set it to "answer"
        evt.target.classList.add("question")
    } else {
        //the target innerHTML is set to clue.answer
        evt.target.innerHTML = jeopardyBoard[cluePositionColumn].clues[cluePositionRow].answer;
        //the clue.showing property is set to "answer"
        jeopardyBoard[cluePositionColumn].clues[cluePositionRow].showing = "answer";
        evt.target.classList.add("answer")
    }

}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    //save the loading screen parent element
    const load = document.getElementById("load");
    //set the style display to flex
    load.style.display = "flex";
    //remove fade class making the element visible
    load.classList.remove("fade");

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    //save the loading screen parent element
    const load = document.getElementById("load");

    //timeout for loading screen display
    setTimeout(function () {
        //hide the element after 3 seconds
        load.style.display = "none";
    }, 3000);

    setTimeout(function () {
        //fade the opacity in 2.5 seconds
        load.classList.add("fade");
    }, 2500);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    //Empty game array
    jeopardyBoard = [];
    //Show the load screen
    showLoadingView();
    //Run fill table
    fillTable();
    //hide the load screen
    hideLoadingView();
}

/** On click of start / restart button, set up game. */

// TODO
//Restart button event listener
const restart = document.getElementById("restart");
//On click run setupAndStart
restart.addEventListener("click", setupAndStart)


/** On page load, add event handler for clicking clues */
// TODO
//ON page load run hideLoadingView
window.addEventListener("load", hideLoadingView);
//Run FillTable to start the game the first time
fillTable();




