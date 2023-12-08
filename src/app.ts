// Sélectionne toutes les classes 'items-container' du document
const itemsContainer = document.querySelectorAll(
  ".items-container"
) as NodeListOf<HTMLDivElement>;
// Event listener à tout les containners
itemsContainer.forEach((container: HTMLDivElement) => {
  addContainerListeners(container);
});

function addContainerListeners(currentContainer: HTMLDivElement) {
  const currentContainerDeletionBtn = currentContainer.querySelector( ".delete-container-btn" ) as HTMLButtonElement;
  const currentAddItemBtn = currentContainer.querySelector( ".add-item-btn" ) as HTMLButtonElement;
  const currentCloseFormBtn = currentContainer.querySelector( ".close-form-btn" ) as HTMLButtonElement;
  const currentForm = currentContainer.querySelector( "form" ) as HTMLFormElement;

  deleteBtnListeners(currentContainerDeletionBtn);
  addItemBtnListeners(currentAddItemBtn);
  closingFormBtnListeners(currentCloseFormBtn);
  addFormSubmitListeners(currentForm);
  addDDListeners(currentContainer); /*add drag and drop*/
}
function deleteBtnListeners(btn: HTMLButtonElement) {
  btn.addEventListener("click", handleContainerDeletion);
}
function addItemBtnListeners(btn: HTMLButtonElement) {
  btn.addEventListener("click", handleAddItem);
}
function addFormSubmitListeners(form: HTMLFormElement) {
  form.addEventListener("submit", createNewItem);
}
function addDDListeners(element: HTMLElement) {
  element.addEventListener('dragstart', handleDragStart);
  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('drop', handleDrop);
  element.addEventListener('dragend', handleDragEnd);
} 

function handleContainerDeletion(e: MouseEvent) {
  const btn = e.target as HTMLButtonElement;
  const btnsArray = [
    ...document.querySelectorAll(".delete-container-btn"),
  ] as HTMLButtonElement[];
  const containers = [
    ...document.querySelectorAll(".items-container"),
  ] as HTMLDivElement[];

  containers[btnsArray.indexOf(btn)].remove();
}

let actualContainer: HTMLDivElement,
  actualBtn: HTMLButtonElement,
  actualUL: HTMLUListElement,
  actualForm: HTMLFormElement,
  actualTextInput: HTMLInputElement,
  actualValidation: HTMLSpanElement;

function setContainerItems(btn: HTMLButtonElement) {
  actualBtn = btn;
  actualContainer = btn.parentElement as HTMLDivElement;
  actualUL = actualContainer.querySelector("ul") as HTMLUListElement;
  actualForm = actualContainer.querySelector("form") as HTMLFormElement;
  actualTextInput = actualContainer.querySelector("input") as HTMLInputElement;
  actualValidation = actualContainer.querySelector(
    ".validation-msg"
  ) as HTMLSpanElement;
}

function handleAddItem(e: MouseEvent) {
  const btn = e.target as HTMLButtonElement;

  if (actualContainer) toggleForm(actualBtn, actualForm, false);
  setContainerItems(btn);
  toggleForm(actualBtn, actualForm, true);
}
function toggleForm(
  btn: HTMLButtonElement,
  form: HTMLFormElement,
  action: Boolean
) {
  if (!action) {
    form.style.display = "none";
    btn.style.display = "block";
  } else if (action) {
    form.style.display = "block";
    btn.style.display = "none";
  }
}

function closingFormBtnListeners(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => toggleForm(actualBtn, actualForm, false));
}

function createNewItem(e: Event) {
  e.preventDefault(); /*Evite le reflesh de la page */
  // Validation
  if (actualTextInput.value.length === 0) {
    actualValidation.textContent = "Must be at least 1 character long";
    return;
  } else {
    actualValidation.textContent = "";
  }
  //Création Item
  const itemContent = actualTextInput.value;
  const li = `<li class="item" draggable="true">
  <p>${itemContent}</p>
  <button>X</button>
  </li>`;
  actualUL.insertAdjacentHTML("beforeend", li);

  const item = actualUL.lastChild as HTMLElement;
  const liBtn = item.querySelector("button") as HTMLButtonElement;
  handleItemDeletion(liBtn); /*Ajoute event listener sur lastChild */
  addDDListeners(item);  /*Ajoute event listener sur le drag and drop */
  actualTextInput.value = "";
}
function handleItemDeletion(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => {
    const elToRemove = btn.parentElement as HTMLLIElement;
    elToRemove.remove();
  });
}

//Drag and drop

let dragSrcEl: HTMLElement;

function handleDragStart(this: HTMLElement, e:DragEvent) {
  e.stopPropagation() /* Bloque les evenement du parent du container */

  if(actualContainer) toggleForm(actualBtn, actualForm, false);
  dragSrcEl = this;
  e.dataTransfer?.setData('text/html', this.innerHTML) /* .dataTransfer est une méthide qui permet de sélectionner ce qui est soulevé */ /* .setData permet de copier */
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
} /*Obligé de faire ça*/

function handleDrop(this: HTMLElement, e: DragEvent) {
  e.stopPropagation()
  const receptionEl = this; /*this est ce que je vais droper*/

  if(dragSrcEl.nodeName === "LI" && receptionEl.classList.contains("items-container")) {
    (receptionEl.querySelector('ul') as HTMLUListElement).appendChild(dragSrcEl);
    addDDListeners(dragSrcEl)
    handleItemDeletion(dragSrcEl.querySelector('button') as HTMLButtonElement);
  }
  /*Si on veut echanger les places de deux items */
  if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer?.getData('text/html') as string;
    if(this.classList.contains("items-container")) {
      addContainerListeners(this as HTMLDivElement)

      this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
        handleItemDeletion(li.querySelector('button') as HTMLButtonElement);
        addDDListeners(li);
      })
    } else {
      addDDListeners(this)
      handleItemDeletion(this.querySelector("button") as HTMLButtonElement);
    }
  }
}

function handleDragEnd(this: HTMLElement, e: DragEvent){
  e.stopPropagation()
  if(this.classList.contains('items-container')) {
    addContainerListeners(this as HTMLDivElement)
    this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
      handleItemDeletion(li.querySelector('button') as HTMLButtonElement);
      addDDListeners(li);
    })
  } else {
    addDDListeners(this)
  }
}

// Add new container

const addContainerBtn = document.querySelector(
  ".add-container-btn"
) as HTMLButtonElement;
const addContainerForm = document.querySelector(
  ".add-new-container form"
) as HTMLFormElement;
const addContainerFormInput = document.querySelector(
  ".add-new-container input"
) as HTMLInputElement; /* designe un enfant <input> de la class add-container*/
const validationNewContainer = document.querySelector(
  ".add-new-container .validation-msg"
) as HTMLSpanElement;
const addContainerCloseBtn = document.querySelector(
  ".close-add-list"
) as HTMLButtonElement;
const addNewContainer = document.querySelector(
  ".add-new-container"
) as HTMLDivElement;
const containersList = document.querySelector(
  ".main-content"
) as HTMLDivElement;

addContainerBtn.addEventListener("click", () => {
  toggleForm(addContainerBtn, addContainerForm, true);
});

addContainerCloseBtn.addEventListener("click", () => {
  toggleForm(addContainerBtn, addContainerForm, false);
});

addContainerForm.addEventListener("submit", createNewContainer);
function createNewContainer(e: Event) {
  e.preventDefault();
  if (addContainerFormInput.value.length === 0) {
    validationNewContainer.textContent = "Must be at least 1 character long";
    return;
  } else {
    validationNewContainer.textContent = "";
  }

  const itemsContainer = document.querySelector(
    ".items-container"
  ) as HTMLDivElement;
  const newContainer =
    itemsContainer.cloneNode() as HTMLDivElement; /* .cloneNode() est une méthode pour cloner un noeud */
  const newContainerContent = `
  <div class="top-container">
  <h2>${addContainerFormInput.value}</h2>
  <button class="delete-container-btn">X</button>
  </div>
  <ul></ul>
  <button class="add-item-btn">Add an item</button>
  <form autocomplete="off">
  <div class="top-form-container">
    <label for="item">Add a new item</label>
    <button type="button" class="close-form-btn">X</button>
  </div>
  <input type="text" id="item" />
  <span class="validation-msg"></span>
  <button type="submit">Submit</button>
  </form>
  `;
  newContainer.innerHTML = newContainerContent;
  containersList.insertBefore(newContainer, addNewContainer);
  addContainerFormInput.value = "";
  addContainerListeners(newContainer); /* On rappelle cette fonction pour ajouter tous les eventListeners */
}
