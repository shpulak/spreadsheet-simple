let defaultRowCount = 5; // No of rows
let defaultColCount = 6; // No of cols
const SPREADSHEET_DB = "spreadsheet_db";

initializeData = () => {
  console.log("initializeData");

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

createHeaderRow = () => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", 0);
  for (let i = 0; i <= defaultColCount; i++) {
    const th = document.createElement("th");
    th.setAttribute("id", `0-${i}`);
    th.innerHTML = i === 0 ? `` : `Col ${i}`;
    tr.appendChild(th);
  }
  return tr;
};

createTableBodyRow = rowNum => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", rowNum);
  for (let i = 0; i <= defaultColCount; i++) {
    const cell = document.createElement(`${i === 0 ? "th" : "td"}`);
    if (i === 0) {
      cell.contentEditable = false;
      cell.innerHTML = rowNum;
      cell.setAttribute("class", "row-header");
    } else {
      cell.contentEditable = true;
    }
    cell.setAttribute("id", `${rowNum}-${i}`);
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

populateTable = () => {
  //   console.log("called once populateTable");
  const data = this.getData();
  if (data === undefined || data === null) return;

  for (let i = 1; i < data.length; i++) {
    for (let j = 1; j < data[i].length; j++) {
      const cell = document.getElementById(`${i}-${j}`);
      cell.innerHTML = data[i][j];
    }
  }
};

addRow = (currentRow, direction) => {
  // Change data in storage from current Row;
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

createSpreadsheet = () => {
  //   const table = document.getElementById("table-main");
  const spreadsheetData = this.getData();
  defaultRowCount = spreadsheetData.length - 1 || defaultRowCount;
  defaultColCount = spreadsheetData[0].length - 1 || defaultColCount;

  const tableHeaders = document.getElementById("table-headers");
  const tableBodyElement = document.getElementById("table-body");

  const tableBody = tableBodyElement.cloneNode(true);
  tableBodyElement.parentNode.replaceChild(tableBody, tableBodyElement);

  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  tableHeaders.appendChild(createHeaderRow(defaultColCount));
  createTableBody(tableBody, defaultRowCount, defaultColCount);

  populateTable();

  // attach event listener to whole container
  tableBody.addEventListener("focusout", function(e) {
    if (e.target && e.target.nodeName === "TD") {
      let item = e.target;
      const indices = item.id.split("-");
      let spreadsheetData = getData();
      spreadsheetData[indices[0]][indices[1]] = item.innerHTML;
      saveData(spreadsheetData);
      //   console.log("on blur", spreadsheetData[indices[0]][indices[1]]);
    }
  });
  tableBody.addEventListener("click", function(e) {
    if (e.target && e.target.className === "row-header") {
      // if (e.target && e.target.nodeName === "TH") {
      console.log("click", e.target.id);
      addRow(parseInt(e.target.id.split("-")[0]), "bottom");
    }
  });
};

createSpreadsheet();
