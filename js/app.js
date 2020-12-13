const SAVE_LOCATION = "bucket-list";

const modalEl = document.getElementById("itemEntryModal");
const cardEl = document.getElementById("card");
const taskEl = document.getElementById("task");
const bucketListEl = document.getElementById("bucketList");

const addItemsForm = document.getElementById("addItemsForm");
const itemsInput = document.getElementById("itemsInput");

const randomItemsButton = document.getElementById("getRandomItem");
const addItemsButton = document.getElementById("addItems");
const toggleItemsButton = document.getElementById("completeItems");
const deleteItemsButton = document.getElementById("deleteItems");

// global state
let bucketList = [], currentItem;

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

    // show the user's bucket list
    displayList();
})();

/**
 * Get a random item from the user's bucket list and show it on screen in the card element
 */
function getRandomItem() {
    // there cannot be random item access with less than two elements
    if (bucketList.length <= 1) return;

    // get the list of items that are not complete
    const filteredList = bucketList
        .filter(x => !x.complete);

    // there cannot be random item access with less than two elements
    if (filteredList.length <= 1) return;

    // prevent the same item that is being shown currnetly from being chosen randomly
    let item;
    do 
    {
        item = filteredList[Math.floor(Math.random() * filteredList.length)];
    } while (currentItem == item);

    // set the currentItem to the randomly selected item
    currentItem = item;
    
    // update the task item in the card element
    taskEl.innerHTML = currentItem.task;
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
        const cleanedItems = itemsRaw.split("\n")
            .map(x => x.trim());

        // create objects from the items
        const itemsToSave = cleanedItems
            .map(item => ({ task: item, complete: false, show: true }));

        // add new items to the bucket list array
        bucketList.push(...itemsToSave);

        // save updated bucket list array
        saveBucketList();

        // show random item
        getRandomItem();

        // show updated list
        displayList();
    }
}

/**
 * Save the user's bucket list to localStorage.
 */
function saveBucketList() {
    localStorage.setItem(SAVE_LOCATION, JSON.stringify(bucketList));
}

/**
 * Show the user's bucket list.
 */
function displayList() {
    // clear bucket list element
    bucketListEl.innerHTML = "";

    // add a message to user when they have no items in their list
    if (bucketList.length === 0)
    {
        bucketListEl.innerHTML += "<li><i>No items yet</i></li>";
    }

    // show all bucket list items
    bucketList
        .forEach((item, i) => {
            // create a list element and cross it out if the user has completed the item
            const li = document.createElement("li");
            li.className = item.complete ? "strikethrough" : "";

            // create a checkbox that is used to select items to toggle or delete
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `item${i}`;

            // add a label that can also toggle the checkbox
            const label = document.createElement("label");
            label.textContent = item.task;
            label.setAttribute("for", `item${i}`);
            
            // add both items to the list item
            li.appendChild(checkbox);
            li.appendChild(label);

            // add the list item to the bucket list element
            bucketListEl.appendChild(li);
        });
}

/**
 * Bind the onclick action to the add items button.
 */
function bindButtonActions() {
    // on add item button click, show modal
    addItemsButton.onclick = () => {
        // show modal
        modalEl.style.display = "block";

        // hide modal on close button click
        document.getElementById("close").onclick = () => modalEl.style.display = "none";
    }

    // show a random item on get random item button click
    randomItemsButton.onclick = getRandomItem;

    // toggle completion of selected list items on toggle button click
    toggleItemsButton.onclick = () => {
        // get all checkboxes from the list
        [...document.querySelectorAll("input[type=checkbox]")]
            .forEach((box, i) => {
                // if the list item is selected
                if (box.checked) 
                {
                    // get the corresponding bucket list item
                    const item = bucketList[i];

                    // toggle the completion status
                    item.complete = !item.complete;
                }
            });

        // save the changes to the bucket list
        saveBucketList();

        // render the updated list
        displayList();
    }

    // delete selected items on delete button click
    deleteItemsButton.onclick = () => {
        // get all checkboxes from the list
        [...document.querySelectorAll("input[type=checkbox]:checked")]
            // get indices of items
            .map(el => parseInt(el.id.replace("item", ""), 10))
            // get the bucket list items at previously found indices
            .map(i => bucketList[i])
            .forEach(item => {
                // find index of item since it will shift if deleting multiple items in a series
                const index = bucketList.findIndex(x => x == item);

                // delete item from bucket list array
                bucketList.splice(index, 1);
            });

        // save the changes to the bucket list
        saveBucketList();

        // render the updated list
        displayList();
    }
}