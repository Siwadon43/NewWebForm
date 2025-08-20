// 1.3.1_1_tee.js

/**
 * สร้างตาราง HTML แบบไดนามิก พร้อมฟังก์ชันค้นหา, จัดเรียง, และปุ่มจัดการ
 * @param {string} containerId - ID ของ element ที่จะใช้เป็น container ของตาราง
 * @param {Array<Object>} headers - อาร์เรย์ของอ็อบเจกต์สำหรับตั้งค่า header แต่ละคอลัมน์
 * @param {Array<Object>} data - อาร์เรย์ของข้อมูลที่จะแสดงในตาราง
 * @param {Array<string>} [actionButtons=[]] - อาร์เรย์ของปุ่มที่จะแสดง (เช่น ['edit', 'delete'])
 * @param {string} [vheight=heightDisplay()] - ความสูงของพื้นที่แสดงตาราง
 */
function createTable(
  containerId,
  headers,
  data,
  actionButtons = [],
  vheight = heightDisplay() // ตั้งค่า default vheight
) {
  headers = autoAssignHeaderKeys(headers, data);
  const borderStyleTable = "1px solid #bbb";

  // 1. เคลียร์ container เดิมก่อน
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  } else {
    console.error("Container not found:", containerId);
    return;
  }

  // ===== ส่วนค้นหา (Search) =====
  const divSearch = document.createElement("div");
  divSearch.style.display = "flex";
  divSearch.style.alignItems = "center";
  divSearch.style.marginBottom = "6px";
  divSearch.style.gap = "6px";
  divSearch.style.padding = "4px";

  const ddl = document.createElement("select");
  ddl.classList.add("ddlForm");
  ddl.style.width = "200px";
  ddl.innerHTML = '<option value="">คำค้นหา</option>'; // ปรับปรุงข้อความเริ่มต้น
  headers.forEach((h, i) => {
    // แสดงเฉพาะคอลัมน์ที่มี key และไม่ใช่ checkbox
    if (h.key && h.title !== "[]") {
      ddl.innerHTML += `<option value="${i}">${h.title}</option>`;
    }
  });

  const txt = document.createElement("input");
  txt.classList.add("ddlForm");
  txt.type = "text";
  txt.style.width = "300px";
  txt.placeholder = "พิมพ์เพื่อค้นหา...";

  divSearch.appendChild(ddl);
  divSearch.appendChild(txt);
  container.appendChild(divSearch);

  // ===== Wrapper สำหรับ Table ที่จะ scroll ได้ =====
  const wrapper = document.createElement("div");
  wrapper.style.overflowY = "auto";
  wrapper.style.border = borderStyleTable;
  wrapper.style.height = `calc(${vheight} - 40px)`;

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = "0";
  table.style.tableLayout = "fixed";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const newHeaders =
    actionButtons.length > 0 ?
      [...headers, {
        title: "จัดการ",
        width: "10%",
        align: "center"
      }] :
      [...headers];

  const sortState = {};

  newHeaders.forEach((col, colIndex) => {
    const th = document.createElement("th");
    th.style.width = col.width;
    th.style.border = borderStyleTable;
    th.style.textAlign = "center";
    th.style.position = "sticky";
    th.style.top = "-1px";
    th.style.backgroundColor = "#FED9B7";
    th.style.zIndex = "10";
    th.style.height = "35px";
    th.style.lineHeight = "35px";
    th.style.fontSize = "14px";
    th.style.padding = "0 4px";
    th.style.wordWrap = "break-word";
    th.style.whiteSpace = "normal";

    if (col.title === "[]") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        const keyToUpdate = newHeaders[colIndex].key;

        // 1. อัปเดตข้อมูลใน Source Data ที่แสดงอยู่
        const currentData = getCurrentRenderedData();
        currentData.forEach((item) => {
          item[keyToUpdate] = isChecked;
        });

        // 2. อัปเดตการแสดงผลบนหน้าจอ (เพื่อให้เห็นผลทันที)
        const checkboxesInColumn = tbody.querySelectorAll(
          `tr td:nth-child(${colIndex + 1}) input[type="checkbox"]`
        );
        checkboxesInColumn.forEach((cb) => (cb.checked = isChecked));
      });
      th.appendChild(checkbox);
    } else {
      const divHeader = document.createElement("div");
      divHeader.style.display = "flex";
      divHeader.style.alignItems = "center";
      divHeader.style.justifyContent = "center";
      divHeader.style.gap = "4px";
      divHeader.textContent = col.title;

      if (col.key) {
        // จะสร้าง icon sort ต่อเมื่อมี key เท่านั้น
        divHeader.style.cursor = "pointer";
        const sortIcon = document.createElement("span");
        sortIcon.innerHTML = "&#9650;"; // Up arrow
        sortIcon.style.fontSize = "10px";
        sortIcon.style.display = "inline-block";
        divHeader.appendChild(sortIcon);

        divHeader.addEventListener("click", () => {
          const keyName = newHeaders[colIndex].key;
          if (!keyName) return;

          const asc =
            sortState[keyName] === undefined ? true : !sortState[keyName];
          Object.keys(sortState).forEach((k) => delete sortState[k]); // Reset other columns
          sortState[keyName] = asc;

          // Reset all icons visually
          table
            .querySelectorAll("thead span")
            .forEach(
              (s) => ((s.innerHTML = "&#9650;"), (s.style.opacity = "0.3"))
            );
          // Set active icon
          sortIcon.style.opacity = "1";
          sortIcon.innerHTML = asc ? "&#9650;" : "&#9660;"; // Up or Down arrow

          const currentData = getCurrentRenderedData();
          const sorted = [...currentData].sort((a, b) => {
            const valA = a[keyName];
            const valB = b[keyName];
            const isNumeric =
              !isNaN(parseFloat(valA)) &&
              isFinite(valA) &&
              !isNaN(parseFloat(valB)) &&
              isFinite(valB);

            if (isNumeric) {
              return asc ? valA - valB : valB - valA;
            } else {
              return asc ?
                String(valA).localeCompare(String(valB)) :
                String(valB).localeCompare(String(valA));
            }
          });
          renderRows(sorted);
        });
      }
      th.appendChild(divHeader);
    }
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  function renderRows(dataToRender) {
    tbody.innerHTML = "";
    dataToRender.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f0f0f0";
      tr.addEventListener(
        "mouseover",
        () => (tr.style.backgroundColor = "#FDD241")
      );
      tr.addEventListener("mouseout", () => {
        tr.style.backgroundColor =
          rowIndex % 2 === 0 ? "#ffffff" : "#f0f0f0";
      });

      headers.forEach((header, i) => {
        const id = `Row${rowIndex}_Col${i}`;
        const cellValue = row[header.key]; // ดึงข้อมูลด้วย key
        const td = document.createElement("td");
        td.style.border = borderStyleTable;
        td.style.padding = "4px";
        td.style.fontSize = "12px";
        td.style.color = header.color ?? "black";
        td.style.textAlign = header.align || "left";
        td.style.wordWrap = "break-word";
        td.style.whiteSpace = "normal";
        td.style.verticalAlign = "top";

        const rightType = header.right ?? "";
        let element;

        if (rightType === "E") {
          element = document.createElement("input");
          element.id = id;
          element.type = "text";
          element.value = cellValue;
          element.style.width = "100%";

          element.dataset.rowIndex = rowIndex;
          element.dataset.key = header.key;

          element.addEventListener("change", (event) => {
            const inputField = event.target;
            const rowIndexToUpdate = inputField.dataset.rowIndex;
            const keyToUpdate = inputField.dataset.key;
            const newValue = inputField.value; 
            if (dataToRender[rowIndexToUpdate]) {
              dataToRender[rowIndexToUpdate][keyToUpdate] = newValue;
            }
          });
        } else if (rightType === "C") {
          element = document.createElement("input");
          element.id = id;
          element.type = "checkbox";
          element.checked = cellValue === "Y" || cellValue === true;

          element.dataset.rowIndex = rowIndex;
          element.dataset.key = header.key;

          element.addEventListener("change", (event) => {
            const checkbox = event.target;
            const rowIndexToUpdate = checkbox.dataset.rowIndex;
            const keyToUpdate = checkbox.dataset.key;
            const isChecked = checkbox.checked;
            if (dataToRender[rowIndexToUpdate]) {
              dataToRender[rowIndexToUpdate][keyToUpdate] = isChecked;
            }
          });
        } else if (rightType === "S") { // Added block for <select> element
          element = document.createElement("select");
          element.id = id;
          element.style.width = "100%";

          // Assumes header.options is an array of objects like [{ value: 'val1', text: 'Display 1' }]
          if (header.options && Array.isArray(header.options)) {
            header.options.forEach(opt => {
              const optionElement = document.createElement("option");
              optionElement.value = opt.value;
              optionElement.textContent = opt.text;
              element.appendChild(optionElement);
            });
          }

          element.value = cellValue; // Set the currently selected value

          element.dataset.rowIndex = rowIndex;
          element.dataset.key = header.key;

          element.addEventListener("change", (event) => {
            const selectField = event.target;
            const rowIndexToUpdate = selectField.dataset.rowIndex;
            const keyToUpdate = selectField.dataset.key;
            const newValue = selectField.value;
            if (dataToRender[rowIndexToUpdate]) {
              dataToRender[rowIndexToUpdate][keyToUpdate] = newValue;
            }
          });
        } else{
          element = document.createElement("label");
          element.id = id;
          element.textContent = cellValue;
          element.style.height = "auto";
          element.style.whiteSpace = "normal";
          element.style.overflowWrap = "break-word";

          element.dataset.rowIndex = rowIndex;
          element.dataset.key = header.key;

          element.addEventListener("change", (event) => {
            const labelField = event.target;
            const rowIndexToUpdate = labelField.dataset.rowIndex;
            const keyToUpdate = labelField.dataset.key;
            const newValue = labelField.value;
            if (dataToRender[rowIndexToUpdate]) {
              dataToRender[rowIndexToUpdate][keyToUpdate] = newValue;
            }
          });
        }
        td.appendChild(element);
        tr.appendChild(td);
      });

      if (actionButtons.length > 0) {
        const tdActions = document.createElement("td");
        tdActions.style.textAlign = "center";
        tdActions.style.border = borderStyleTable;

        const btnWrapper = document.createElement("div");
        btnWrapper.style.display = "flex";
        btnWrapper.style.justifyContent = "center";
        btnWrapper.style.alignItems = "center";
        btnWrapper.style.gap = "10px";

        actionButtons.forEach((btnType) => {
          const img = document.createElement("img");
          img.style.width = "20px";
          img.style.height = "20px";
          img.style.cursor = "pointer";

          if (btnType === "edit") {
            img.src = "images/edit3.png";
            img.alt = "Edit";
            img.title = "แก้ไข";
            img.classList.add("icon-edit");
          }

          if (btnType === "delete") {
            img.src = "images/delete3.png";
            img.alt = "Delete";
            img.title = "ลบ";
            img.classList.add("icon-delete");

            img.onclick = () => {
              if (confirm(`ต้องการลบแถวที่ ${rowIndex + 1} หรือไม่?`)) {
                tr.remove();
              }
            };
          }
          btnWrapper.appendChild(img);
        });

        tdActions.appendChild(btnWrapper);
        tr.appendChild(tdActions);
      }
      tbody.appendChild(tr);
    });
  }

  function getCurrentRenderedData() {
    const colIndex = parseInt(ddl.value);
    const keyword = txt.value.trim().toLowerCase();

    if (isNaN(colIndex) || keyword === "") {
      return data;
    } else {
      const keyName = headers[colIndex].key;
      if (!keyName) return data;
      return data.filter((row) =>
        String(row[keyName]).toLowerCase().includes(keyword)
      );
    }
  }

  renderRows(data);
  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper);

  txt.addEventListener("input", () => {
    const filteredData = getCurrentRenderedData();
    renderRows(filteredData);
  });
}

async function loadTableDataAxios({
  url,
  body,
  auth
}) {
  let data = [];
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    headers["Authorization"] = auth;
  }

  if (url) {
    try {
      const res = await axios.post(url, body, {
        headers
      });
      if (
        res.status === 200 &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        data = res.data.data;
      } else {
        // console.warn("Axios success แต่ data ว่าง");
      }
    } catch (err) {
      // console.error("Axios error:", err);
    }
  }
  return data;
}

/**
 * กำหนด key ให้กับ headers array โดยอัตโนมัติ โดยอ้างอิงลำดับ key จากอ็อบเจกต์แรกใน data array
 * @param {Array<Object>} headers - อาร์เรย์ของ headers ที่ยังไม่มี key หรือมีไม่ครบ
 * @param {Array<Object>} data - อาร์เรย์ของข้อมูล (ใช้แค่แถวแรกเพื่อดึง keys)
 * @returns {Array<Object>} - อาร์เรย์ของ headers ที่มี key ครบถ้วน
 */
function autoAssignHeaderKeys(headers, data) {
  if (!data || data.length === 0) {
    return headers;
  }

  const dataKeys = Object.keys(data[0]);

  const updatedHeaders = headers.map((header, index) => {
    // ถ้า header นั้นยังไม่มี key และมี key ที่ตรงลำดับกันใน dataKeys
    if (header.key === undefined && dataKeys[index] !== undefined) {
      return {
        ...header,
        key: dataKeys[index],
      };
    }
    // ถ้ามี key อยู่แล้ว หรือไม่มี key ที่ตรงกัน ก็ให้ใช้ header เดิม
    return header;
  });

  return updatedHeaders;
}

function openPopupCalendar(ObjReturn) {
  if (!ObjReturn) {
    alert("ต้องระบุ objReturn");
    return;
  }

  let url = domainname + "/Utilities/UTCalendar.aspx";
  url += "?CalendarObjReturn=" + encodeURIComponent(ObjReturn);

  // ฟังก์ชัน callback หลังปิด popup
  window.popupCallback = function (values) {
    if (!values || values.length === 0) return;
    const el = document.getElementById(ObjReturn);
    if (el) el.value = values[0]; // ใส่ค่าตัวแรกที่เลือก
  };

  window.open(url, "_blank", "width=250,height=250,scrollbars=yes");
}

function openPopupList(popupName = "", ...args) {
  if (args.length < 2 || !args[0] || !args[1]) {
    alert("ต้องระบุอย่างน้อย sRetKey และ objReturn");
    return;
  }

  let url = domainname + "/Utilities/UTList.aspx";
  const params = [];

  if (popupName) params.push("PopupName=" + popupName);

  // รับ sRetKey และ objReturn ทีละคู่
  for (let i = 0; i < args.length; i += 2) {
    const sRetKey = args[i];
    const objReturn = args[i + 1];
    if (!sRetKey || !objReturn) continue;

    const index = i / 2 + 1;
    const suffix = index === 1 ? "" : index; // ตัวแรกไม่มีเลขต่อท้าย
    params.push("sRetKey" + suffix + "=" + encodeURIComponent(sRetKey));
    params.push("ObjReturn" + suffix + "=" + encodeURIComponent(objReturn));
  }

  params.push("Summit=Y");
  url += "?" + params.join("&");

  window.popupCallback = function (values) {
    for (let i = 0; i < values.length; i++) {
      const objReturn = args[i * 2 + 1];
      const el = document.getElementById(objReturn);
      if (el) el.value = values[i];
    }
  };

  window.open(url, "_blank", "width=650,height=500,scrollbars=yes");
}

function heightDisplay() {
  const pnlTitle = document.getElementById("pnlTitle");
  const pnlDocno = document.getElementById("pnlDocno");
  const divSearch = document.getElementById("divSearch");
  const statusbarElements = document.getElementsByClassName("status-bar");

  const heightTitle = pnlTitle ? pnlTitle.getBoundingClientRect().height : 0;
  const heightDocno = pnlDocno ? pnlDocno.getBoundingClientRect().height : 0;
  const heightSearch = divSearch ? divSearch.getBoundingClientRect().height : 0;
  const heightStatusbar =
    statusbarElements.length > 0 ?
      statusbarElements[0].getBoundingClientRect().height :
      0;
  const heightViewport = window.innerHeight;

  const heightGrid =
    heightViewport -
    (heightTitle * 2 + heightDocno + heightSearch + heightStatusbar);

  console.log("statusbar", heightStatusbar);
  console.log("pnlTitle", heightTitle);
  console.log("pnlDocno", heightDocno);
  console.log("divSearch", heightSearch);
  console.log("Viewport", heightViewport);
  console.log("Grid", heightGrid);

  return heightGrid + "px";
}

async function apiCall(endpoint, payload = {}) {
  const url = domainname + endpoint;
  console.log("Sending payload:", payload); // Good for debugging

  try {
    const response = await axios.post(
      url,
      payload, // Correct: Pass the payload object directly as the request body
      {
        withCredentials: true, // The config object is the third argument
      }
    );
    return response.data?.d ?? response.data;
  } catch (error) {
    console.error(
      `API call failed: ${endpoint}`,
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
* Converts a date string from 'dd/mm/yyyy' to 'yyyy-MM-ddTHH:mm:ss' format.
* @param {string} inputDate - The date string to format (e.g., "19/08/2025").
* @returns {string} The formatted date string or an empty string if input is empty.
*/
function formatDate(inputDate) {
  if (!inputDate) {
    return "";
  }

  // Parse the input date string 'dd/mm/yyyy'
  const parts = inputDate.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const year = parseInt(parts[2], 10);

  const dt = new Date(year, month, day);

  // Format to 'yyyy-MM-ddTHH:mm:ss'
  const formatted = `${dt.getFullYear()}-` +
    `${String(dt.getMonth() + 1).padStart(2, '0')}-` +
    `${String(dt.getDate()).padStart(2, '0')}T` +
    `${String(dt.getHours()).padStart(2, '0')}:` +
    `${String(dt.getMinutes()).padStart(2, '0')}:` +
    `${String(dt.getSeconds()).padStart(2, '0')}`;

  return formatted;
}