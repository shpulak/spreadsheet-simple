let defaultRowCount = 15; // No of rows
let defaultColCount = 12; // No of cols
const SPREADSHEET_DB = "spreadsheet_db";

initializeData = () => {
  // console.log("initializeData");
  const data = [];
  for (let i = 0; i <= defaultRowCount; i++) {
    const child = [];
    for (let j = 0; j <= defaultColCount; j++) {
      child.push("");
    }
    data.push(child);
  }
  return data;
};

getData = () => {
  let data = localStorage.getItem(SPREADSHEET_DB);
  if (data === undefined || data === null) {
    return initializeData();
  }
  return JSON.parse(data);
};

saveData = data => {
  localStorage.setItem(SPREADSHEET_DB, JSON.stringify(data));
};

resetData = data => {
  localStorage.removeItem(SPREADSHEET_DB);
  this.createSpreadsheet();
};

createHeaderRow = () => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", "h-0");
  for (let i = 0; i <= defaultColCount; i++) {
    const th = document.createElement("th");
    th.setAttribute("id", `h-0-${i}`);
    th.setAttribute("class", `${i === 0 ? "" : "column-header"}`);
    // th.innerHTML = i === 0 ? `` : `Col ${i}`;
    if (i !== 0) {
      const span = document.createElement("span");
      span.innerHTML = `Col ${i}`;
      span.setAttribute("class", "column-header-span");
      const dropDownDiv = document.createElement("div");
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropbtn" id="col-dropbtn-${i}">+</button>
        <div id="col-dropdown-${i}" class="dropdown-content">
          <p class="col-insert-left">Insert 1 column left</p>
          <p class="col-insert-right">Insert 1 column right</p>
          <p class="col-delete">Delete column</p>
        </div>`;
      th.appendChild(span);
      th.appendChild(dropDownDiv);
    }
    tr.appendChild(th);
  }
  return tr;
};

createTableBodyRow = rowNum => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", `r-${rowNum}`);
  for (let i = 0; i <= defaultColCount; i++) {
    const cell = document.createElement(`${i === 0 ? "th" : "td"}`);
    if (i === 0) {
      cell.contentEditable = false;
      const span = document.createElement("span");
      const dropDownDiv = document.createElement("div");
      span.innerHTML = rowNum;
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropbtn" id="row-dropbtn-${rowNum}">+</button>
        <div id="row-dropdown-${rowNum}" class="dropdown-content">
          <p class="row-insert-top">Insert 1 row above</p>
          <p class="row-insert-bottom">Insert 1 row below</p>
          <p class="row-delete">Delete row</p>
        </div>`;
      cell.appendChild(span);
      cell.appendChild(dropDownDiv);
      cell.setAttribute("class", "row-header");
    } else {
      cell.contentEditable = true;
    }
    cell.setAttribute("id", `r-${rowNum}-${i}`);
    // cell.id = `${rowNum}-${i}`;
    tr.appendChild(cell);
  }
  return tr;
};

createTableBody = tableBody => {
  for (let rowNum = 1; rowNum <= defaultRowCount; rowNum++) {
    tableBody.appendChild(this.createTableBodyRow(rowNum));
  }
};

// Fill Data in created table from localstorage
populateTable = () => {
  const data = this.getData();
  if (data === undefined || data === null) return;

  for (let i = 1; i < data.length; i++) {
    for (let j = 1; j < data[i].length; j++) {
      const cell = document.getElementById(`r-${i}-${j}`);
      cell.innerHTML = data[i][j];
    }
  }
};

// Utility function to add row
addRow = (currentRow, direction) => {
  let data = this.getData();
  const colCount = data[0].length;
  const newRow = new Array(colCount).fill("");
  if (direction === "top") {
    data.splice(currentRow, 0, newRow);
  } else if (direction === "bottom") {
    data.splice(currentRow + 1, 0, newRow);
  }
  defaultRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to delete row
deleteRow = currentRow => {
  let data = this.getData();
  data.splice(currentRow, 1);
  defaultRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to add columns
addColumn = (currentCol, direction) => {
  let data = this.getData();
  for (let i = 0; i <= defaultRowCount; i++) {
    if (direction === "left") {
      data[i].splice(currentCol, 0, "");
    } else if (direction === "right") {
      data[i].splice(currentCol + 1, 0, "");
    }
  }
  defaultColCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to delete column
deleteColumn = currentCol => {
  let data = this.getData();
  for (let i = 0; i <= defaultRowCount; i++) {
    data[i].splice(currentCol, 1);
  }
  defaultColCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Map for storing the sorting history of every column;
const sortingHistory = new Map();

// Utility function to sort columns
sortColumn = currentCol => {
  let spreadSheetData = this.getData();
  let data = spreadSheetData.slice(1);
  if (!data.some(a => a[currentCol] !== "")) return;
  if (sortingHistory.has(currentCol)) {
    const sortOrder = sortingHistory.get(currentCol);
    switch (sortOrder) {
      case "desc":
        data.sort(ascSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "asc");
        break;
      case "asc":
        data.sort(dscSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "desc");
        break;
    }
  } else {
    data.sort(ascSort.bind(this, currentCol));
    sortingHistory.set(currentCol, "asc");
  }
  data.splice(0, 0, new Array(data[0].length).fill(""));
  saveData(data);
  this.createSpreadsheet();
};

// Compare Functions for sorting - ascending
const ascSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  // Check for strings and numbers
  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return -1;
    if (_a > _b) return 1;
    return 0;
  }
  return _a - _b;
};

// Descending compare function
const dscSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  // Check for strings and numbers
  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return 1;
    if (_a > _b) return -1;
    return 0;
  }
  return _b - _a;
};

createSpreadsheet = () => {
  const spreadsheetData = this.getData();
  defaultRowCount = spreadsheetData.length - 1 || defaultRowCount;
  defaultColCount = spreadsheetData[0].length - 1 || defaultColCount;

  const tableHeaderElement = document.getElementById("table-headers");
  const tableBodyElement = document.getElementById("table-body");

  const tableBody = tableBodyElement.cloneNode(true);
  tableBodyElement.parentNode.replaceChild(tableBody, tableBodyElement);
  const tableHeaders = tableHeaderElement.cloneNode(true);
  tableHeaderElement.parentNode.replaceChild(tableHeaders, tableHeaderElement);

  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  tableHeaders.appendChild(createHeaderRow(defaultColCount));
  createTableBody(tableBody, defaultRowCount, defaultColCount);

  populateTable();

  // attach focusout event listener to whole table body container
  tableBody.addEventListener("focusout", function(e) {
    if (e.target && e.target.nodeName === "TD") {
      let item = e.target;
      const indices = item.id.split("-");
      let spreadsheetData = getData();
      spreadsheetData[indices[1]][indices[2]] = item.innerHTML;
      saveData(spreadsheetData);
    }
  });

  // Attach click event listener to table body
  tableBody.addEventListener("click", function(e) {
    if (e.target) {
      if (e.target.className === "dropbtn") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`row-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "row-insert-top") {
        const indices = e.target.parentNode.id.split("-");
        addRow(parseInt(indices[2]), "top");
      }
      if (e.target.className === "row-insert-bottom") {
        const indices = e.target.parentNode.id.split("-");
        addRow(parseInt(indices[2]), "bottom");
      }
      if (e.target.className === "row-delete") {
        const indices = e.target.parentNode.id.split("-");
        deleteRow(parseInt(indices[2]));
      }
    }
  });

  // Attach click event listener to table headers
  tableHeaders.addEventListener("click", function(e) {
    if (e.target) {
      if (e.target.className === "column-header-span") {
        sortColumn(parseInt(e.target.parentNode.id.split("-")[2]));
      }
      if (e.target.className === "dropbtn") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`col-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "col-insert-left") {
        const indices = e.target.parentNode.id.split("-");
        addColumn(parseInt(indices[2]), "left");
      }
      if (e.target.className === "col-insert-right") {
        const indices = e.target.parentNode.id.split("-");
        addColumn(parseInt(indices[2]), "right");
      }
      if (e.target.className === "col-delete") {
        const indices = e.target.parentNode.id.split("-");
        deleteColumn(parseInt(indices[2]));
      }
    }
  });
};

createSpreadsheet();

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

document.getElementById("reset").addEventListener("click", e => {
  if (
    confirm("This will erase all data and set default configs. Are you sure?")
  ) {
    this.resetData();
  }
});
