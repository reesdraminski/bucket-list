const SAVE_LOCATION = "bucket-list";

const cardEl = document.getElementById("card");
const modalEl = document.getElementById("itemEntryModal");
const taskEl = document.getElementById("task");
const addItemsForm = document.getElementById("addItemsForm");
const itemsInput = document.getElementById("itemsInput");

const addItemsButton = document.getElementById("addItems");
const randomItemsButton = document.getElementById("getRandomItem");
const removeCurrentItemButton = document.getElementById("removeCurrentItem");

// working memory copy of the user's bucket list
let bucketList = [];
let currentItem;

/**
 * Initialize the UI.
 */
(function initUI() {
    // bind modal close to escape key
    document.onkeydown = e => {
        // if the user pressed the Escape key
        if (e.code == "Escape") 
        {
            // hide the modal
            modalEl.style.display = "none";
        }
    }

    // try to get a saved bucket list from localStorage
    const savedBucketList = localStorage.getItem(SAVE_LOCATION);

    // if a bucket list is saved, load it
    if (savedBucketList)
    {
        // parse the saved bucket list
        bucketList = JSON.parse(savedBucketList);

        // show a random item in the card
        getRandomItem();
    }
    // if no bucket list saved, prompt the user to add items
    else
    {
        // show the modal
        modalEl.style.display = "block";
    }

    // intercept form submission to create bucket list items
    overrideFormSubmitAction();

    // add functionality to the buttons on the page
    bindButtonActions();
})();

/**
 * Get a random item from the user's bucket list and show it on screen in the card element
 */
function getRandomItem() {
    // there cannot be random item access with less than two elements
    if (bucketList.length <= 1) return;

    // prevent the same item that is being shown currnetly from being chosen randomly
    let item;
    do 
    {
        item = bucketList[Math.floor(Math.random() * bucketList.length)];
    } while (currentItem == item);

    // set the currentItem to the randomly selected item
    currentItem = item;
    
    // update the task item in the card element
    taskEl.innerHTML = currentItem;
}

/**
 * Delete the current item shown in the card from the bucket list and save the changes.
 */
function removeCurrentItem() {
    // if there is no current item, exit to prevent errors
    if (!currentItem) return;

    // remove the item from the bucket list
    bucketList.splice(bucketList.indexOf(currentItem), 1);

    // save the updated bucket list to localStorage
    localStorage.setItem(SAVE_LOCATION, JSON.stringify(bucketList));

    // refresh the card element
    getRandomItem();
}

/**
 * Prevent default form submission action for the Add Items form to allow the user to
 * add items to their bucket list.
 */
function overrideFormSubmitAction() {
    addItemsForm.onsubmit = e => {
        // prevent normal form submission behavior
        e.preventDefault();

        // close modal
        modalEl.style.display = "none";

        // create form data object from submitted form
        const formData = new FormData(e.target);
        const delimiter = formData.get("delimiter");
        const itemsRaw = formData.get("items");

        // if the user did not write any items
        if (!itemsRaw) return;

        // clear items textarea
        itemsInput.value = "";

        // split items depending on delimiter and clean trailing whitespaces
        const cleanedItems = (delimiter == "lsv" ? itemsRaw.split("\n") : itemsRaw.split(","))
            .map(x => x.trim());

        // add new items to the bucket list array
        bucketList.push(...cleanedItems);

        // save updated bucket list area
        localStorage.setItem(SAVE_LOCATION, JSON.stringify(bucketList));
    }
}

/**
 * Bind the onclick action to the add items button.
 */
function bindButtonActions() {
    // show the modal on add item button click
    addItemsButton.onclick = () => {
        // show modal
        modalEl.style.display = "block";

        // hide modal on close button click
        document.getElementById("close").onclick = () => modalEl.style.display = "none";
    }

    randomItemsButton.onclick = getRandomItem;

    removeCurrentItemButton.onclick = removeCurrentItem;
}