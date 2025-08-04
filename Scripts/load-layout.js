async function loadHeader() {
  const res = await fetch("components/header.html");
  const text = await res.text();
  document.getElementById("pnlTitle").innerHTML = text;

  // รอให้ DOM ของ header โหลดเข้าแล้วค่อย set ค่า
  const programName = window.AppConfig?.programName ?? "";
  const programID = window.AppConfig?.programID ?? "";

  // แก้ข้อความหลัง header โหลดเข้า
  document.querySelector("#lblPrgName").textContent = programName;
  document.querySelector("#lblPrgID").textContent = programID;
}

async function loadGridList() {
  const res = await fetch("components/gridlist.html");
  const text = await res.text();
  document.getElementById("divGrid").innerHTML = text;
}

/**
 * สร้างตารางแสดงข้อมูลพร้อมคอลัมน์ปุ่มจัดการที่กำหนดเองได้
 * @param {string} containerId - id ของ container ที่จะฝังตารางลงไป
 * @param {Array} headers - array ของ object กำหนดหัวตาราง เช่น {title, width, align}
 * @param {Array} data - array ของ array ข้อมูลแต่ละแถว
 * @param {Array} actionButtons - array ของปุ่มที่จะเพิ่มในคอลัมน์จัดการ เช่น ["open", "delete"]
 */
function createTable(
  containerId,
  headers,
  data,
  actionButtons = [],
  vheight = "55vh"
) {
  const wrapper = document.createElement("div");
  wrapper.style.height = vheight;
  wrapper.style.overflowY = "auto";
  wrapper.style.border = "1px solid #000";

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = "0";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  // เพิ่มคอลัมน์จัดการ ถ้ามีปุ่มอย่างน้อย 1 ปุ่ม
  const newHeaders =
    actionButtons.length > 0
      ? [...headers, { title: "จัดการ", width: "15%", align: "center" }]
      : [...headers];

  newHeaders.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.title;
    th.style.width = col.width;
    th.style.border = "1px solid #000";
    th.style.textAlign = "center";
    th.style.position = "sticky";
    th.style.top = "0";
    th.style.backgroundColor = "#fff";
    th.style.zIndex = "10";
    th.style.height = "40px";
    th.style.lineHeight = "40px"; // จัดให้ข้อความตรงกลางแนวตั้ง
    th.style.backgroundColor = "#FED9B7"; // จัดให้ข้อความตรงกลางแนวตั้ง
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    tr.style.height = "40px";

    tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f0f0f0";

    row.forEach((cell, i) => {
      const td = document.createElement("td");
      td.textContent = cell;
      td.style.textAlign = headers[i].align;
      td.style.border = "1px solid #000";
      td.style.padding = "6px 4px";
      td.style.fontSize = "14px";
      tr.appendChild(td);
    });

    if (actionButtons.length > 0) {
      const tdActions = document.createElement("td");
      tdActions.style.textAlign = "center";
      tdActions.style.border = "1px solid #000";

      // ✅ สร้าง wrapper ให้ปุ่มภาพเรียงกันแนวนอน
      const btnWrapper = document.createElement("div");
      btnWrapper.style.display = "flex";
      btnWrapper.style.justifyContent = "center"; // หรือ "space-between", "flex-start"
      btnWrapper.style.alignItems = "center";
      btnWrapper.style.gap = "10px"; // ระยะห่างระหว่างไอคอน

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

        btnWrapper.appendChild(img); // ✅ ใส่แต่ละปุ่มใน wrapper
      });

      tdActions.appendChild(btnWrapper); // ✅ ใส่ wrapper เข้า td เดียว
      tr.appendChild(tdActions); // ✅ ใส่ tdActions เข้า tr
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  const container = document.getElementById(containerId);
  if (container) {
    container.appendChild(wrapper);
  } else {
    console.error("ไม่พบ container:", containerId);
  }
}

function createTableEntry(
  containerId,
  headers,
  data,
  actionButtons = [],
  vheight = "55vh"
) {
  const wrapper = document.createElement("div");
  wrapper.style.height = vheight;
  wrapper.style.overflowY = "auto";
  wrapper.style.border = "1px solid #000";

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = "0";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const newHeaders =
    actionButtons.length > 0
      ? [...headers, { title: "จัดการ", width: "10%", align: "center" }]
      : [...headers];

 newHeaders.forEach((col) => {
  const th = document.createElement("th");
  th.style.width = col.width;
  th.style.border = "1px solid #000";
  th.style.textAlign = "center";
  th.style.position = "sticky";
  th.style.top = "0";
  th.style.backgroundColor = "#FED9B7";
  th.style.zIndex = "10";
  th.style.height = "40px";
  th.style.lineHeight = "40px";

  if (col.title === "[]") {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.transform = "scale(1.2)";
    checkbox.style.cursor = "pointer";

    // ➕ เพิ่ม event ถ้าต้องการให้เช็คทั้งหมดในคอลัมน์เดียวกัน
    checkbox.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    th.appendChild(checkbox);
  } else {
    th.textContent = col.title;
  }

  headRow.appendChild(th);
});


  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    tr.style.height = "40px";
    tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f0f0f0";

    row.forEach((cell, i) => {
      const td = document.createElement("td");
      const align = headers[i].align || "left";
      const rightType = headers[i].right ?? "";

      td.style.textAlign = align;
      td.style.border = "1px solid #000";
      td.style.padding = "6px 4px";
      td.style.fontSize = "14px";

      let element;

      if (rightType === "E") {
        const input = document.createElement("input");
        input.type = "text";
        input.value = cell;
        input.disabled = false;
        input.style.width = "100%";
        input.style.height = "28px";
        input.style.padding = "4px 6px";
        input.style.border = "none";
        input.style.backgroundColor = "transparent";
        input.style.borderRadius = "4px";
        input.style.fontSize = "14px";
        input.style.textAlign = align;
        element = input;

      } else if (rightType === "C") {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = cell === true || cell === "true" || cell === 1;
        checkbox.disabled = false;
        checkbox.style.transform = "scale(1.2)";
        checkbox.style.cursor = "pointer";
        element = checkbox;

      } else {
        const label = document.createElement("label");
        label.textContent = cell;
        label.style.display = "block";
        label.style.padding = "4px 6px";
        label.style.fontSize = "14px";
        label.style.textAlign = align;
        element = label;
      }

      td.appendChild(element);
      tr.appendChild(td);
    });

    if (actionButtons.length > 0) {
      const tdActions = document.createElement("td");
      tdActions.style.textAlign = "center";
      tdActions.style.border = "1px solid #000";

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

  table.appendChild(tbody);
  wrapper.appendChild(table);

  const container = document.getElementById(containerId);
  if (container) {
    container.appendChild(wrapper);
  } else {
    console.error("ไม่พบ container:", containerId);
  }
}

loadHeader();
