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
  vheight = heightDisplay()
) {

  const borderStyleTable = "1px solid #bbb";
  const wrapper = document.createElement("div");
  wrapper.style.height = vheight;
  wrapper.style.overflowY = "auto";
  wrapper.style.border = borderStyleTable;

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = "0";
  table.style.tableLayout = "fixed";

  const thead = document.createElement("thead");
  thead.style.height = "30px"
  const headRow = document.createElement("tr");

  const newHeaders =
    actionButtons.length > 0
      ? [...headers, { title: "จัดการ", width: "10%", align: "center" }]
      : [...headers];

  newHeaders.forEach((col, colIndex) => {
    const th = document.createElement("th");
    th.style.width = col.width;
    th.style.border = borderStyleTable;
    th.style.textAlign = "center";
    th.style.position = "sticky";
    th.style.top = "0";
    th.style.backgroundColor = "#FED9B7";
    th.style.zIndex = "10";
    th.style.height = "35px";          // ✅ ความสูงหัวตาราง
    th.style.lineHeight = "35px";
    th.style.fontSize = "14px";
    th.style.padding = "0 4px";
    th.style.wordWrap = "break-word";
    th.style.whiteSpace = "normal";
    if (col.title === "[]") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.transform = "scale(1.2)";
      checkbox.style.cursor = "pointer";

      // ✅ ระบุ index ของคอลัมน์ที่ checkbox นี้อยู่
      checkbox.dataset.colIndex = colIndex;

      // ✅ เมื่อเช็ค/ไม่เช็ค ให้เลือก checkbox เฉพาะคอลัมน์เดียวกัน
      checkbox.addEventListener("change", (e) => {
        const colIndex = parseInt(e.target.dataset.colIndex);
        const allRows = table.querySelectorAll("tbody tr");

        allRows.forEach((row) => {
          const cell = row.children[colIndex];
          if (cell) {
            const cb = cell.querySelector('input[type="checkbox"]');
            if (cb) cb.checked = e.target.checked;
          }
        });
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
    tr.style.height = "32px";
    tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f0f0f0";
    // เพิ่ม effect hover ด้วย JavaScript
    tr.addEventListener("mouseover", () => {
      tr.style.backgroundColor = "rgb(253,203,10)"; // สีตอน hover
    });

    tr.addEventListener("mouseout", () => {
      tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5ff"; // คืนค่าสีเดิม
    });

    row.forEach((cell, i) => {
      const td = document.createElement("td");
      const align = headers[i].align || "left";
      const rightType = headers[i].right ?? "";

      td.style.textAlign = align;
      td.style.border = borderStyleTable;
      td.style.padding = "0px 4px";
      td.style.fontSize = "12px";
      td.style.height = "28px";          // ✅ ความสูงหัวตาราง
      td.style.lineHeight = "28px";
      td.style.padding = "0 4px";
      td.style.wordWrap = "break-word";
      td.style.whiteSpace = "normal"; // ตัดบรรทัดได้
      let element;

      if (rightType === "E") {
        const input = document.createElement("input");
        input.type = "text";
        input.value = cell;
        input.disabled = false;
        input.style.width = "100%";
        input.style.height = "25px";
        input.style.padding = "2px 6px";
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
        checkbox.style.transform = "scale(1)";
        checkbox.style.cursor = "pointer";
        checkbox.dataset.colIndex = i; // 🟡 ใส่ index ของคอลัมน์
        element = checkbox;
      } else {
        const label = document.createElement("label");
        label.textContent = cell;
        label.style.display = "block";
        label.style.padding = "1px 6px";
        label.style.fontSize = "12px";
        label.style.height = "25px";
        label.style.lineHeight = "25px";
        label.style.textAlign = align;
        label.style.wordWrap = "break-word";     // ให้ตัดคำเมื่อเกินขอบ
        label.style.whiteSpace = "normal";       // อนุญาตให้ขึ้นบรรทัดใหม่
        label.style.height = "auto"; // ✅ ขยายอัตโนมัติ
        element = label;
      }
      td.style.verticalAlign = "top";            // ✅ ให้ td ชิดบน
      td.style.height = "auto";
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

  table.appendChild(tbody);
  wrapper.appendChild(table);

  const container = document.getElementById(containerId);
  if (container) {
    container.appendChild(wrapper);
  } else {
    console.error("ไม่พบ container:", containerId);
  }
}


function heightDisplay() {
  const pnlTitle = document.getElementById('pnlTitle')
  const pnlDocno = document.getElementById('pnlDocno')
  const divSearch = document.getElementById('divSearch')


  const heightTitle = pnlTitle.getBoundingClientRect().height
  const heightDocno = pnlDocno.getBoundingClientRect().height
  const heightSearch = divSearch.getBoundingClientRect().height
  const heightViewport = window.innerHeight
  let heightGrid = 0;
  console.log("pnlTitle", heightTitle); // ความสูงบนจอจริง
  console.log("pnlDocno", heightDocno); // ความสูงบนจอจริง
  console.log("divSearch", heightSearch); // ความสูงบนจอจริง
  console.log("Viewport ", heightViewport);
  heightGrid = heightViewport - (heightDocno + heightSearch + heightTitle + heightTitle)
  console.log('Grid', heightGrid);
  return heightGrid + 'px'
}

loadHeader();
