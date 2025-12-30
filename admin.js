const API = "http://localhost:3000";
const tableBody = document.getElementById("tableBody");
const staffTableBody = document.getElementById("staffTableBody");

let allData = [];
let allStaff = [];

// ---------------- LOAD ALL DATA ----------------
async function loadData() {
  const res = await fetch(`${API}/fuel-data`);
  allData = await res.json();
  renderTable();
  loadStaff();
}

// ---------------- RENDER TABLE ----------------
function renderTable() {
  tableBody.innerHTML = "";

  const grouped = {};
  allData.forEach(r => {
    if (!grouped[r.vehicleNo]) grouped[r.vehicleNo] = [];
    grouped[r.vehicleNo].push(r);
  });

  Object.keys(grouped).forEach((vehicle, index) => {
    const records = grouped[vehicle];
    const latest = records[records.length - 1];

    const tr = document.createElement("tr");

    let prevRecordsHTML = "-";
    if (records.length > 1) {
      prevRecordsHTML = `
        <details>
          <summary>View Previous Records (${records.length - 1})</summary>
          <table class="inner-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fuel</th>
                <th>Liters</th>
                <th>Gift</th>
                <th>Gift By</th>
                <th>Staff</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${records.slice(0, -1).map(r => {
                const realIndex = allData.indexOf(r);
                return `
                  <tr>
                    <td>${r.date}</td>
                    <td>${r.fuelType}</td>
                    <td>${r.liters}</td>
                    <td>${r.gift || "-"}</td>
                    <td>${r.giftBy || "-"}</td>
                    <td>${r.staffName || "-"}</td>
                    <td>
                      <button class="action-btn edit-btn"
                        onclick="editSingleRecord(${realIndex})">
                        Edit
                      </button>
                      <button class="action-btn" style="background:#ef4444;"
                        onclick="deleteSingleRecord(${realIndex})">
                        Delete
                      </button>
                    </td>
                  </tr>`; 
              }).join("")}
            </tbody>
          </table>
        </details>`;
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${vehicle}</td>
      <td>${latest.driverName}</td>
      <td>${records.length}</td>
      <td>${prevRecordsHTML}</td>
      <td>
        <button class="action-btn edit-btn"
          onclick="editSingleRecord(${allData.indexOf(latest)})">
          Edit Latest
        </button>
        <button class="action-btn pdf-btn"
          onclick="downloadVehiclePDF('${vehicle}')">PDF</button>
        <button class="action-btn" style="background:#ef4444;"
          onclick="deleteRecord('${vehicle}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// ---------------- EDIT SINGLE RECORD ----------------
async function editSingleRecord(index) {
  const rec = allData[index];
  if (!rec) return alert("Record not found");

  const date = prompt("Enter Date", rec.date);
  if (date === null) return;

  const fuelType = prompt("Enter Fuel Type", rec.fuelType);
  if (fuelType === null) return;

  const liters = prompt("Enter Liters", rec.liters);
  if (liters === null) return;

  const gift = prompt("Enter Gift", rec.gift || "");
  if (gift === null) return;

  const giftBy = prompt("Enter Gift By", rec.giftBy || "");
  if (giftBy === null) return;

  const staffName = prompt("Enter Staff Name", rec.staffName || "");
  if (staffName === null) return;

  const updated = {
    ...rec,
    date,
    fuelType,
    liters: Number(liters),
    gift,
    giftBy,
    staffName
  };

  const res = await fetch(`${API}/update/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });

  if (res.ok) {
    allData[index] = updated;     
    renderTable();
    alert("Record updated successfully ✅");
  } else {
    alert("Update failed ❌");
  }
}

// ---------------- DELETE SINGLE RECORD ----------------
async function deleteSingleRecord(index) {
  if (!confirm("Delete this record?")) return;

  const res = await fetch(`${API}/delete/${index}`, { method: "DELETE" });
  if (res.ok) {
    allData.splice(index, 1);
    renderTable();
  } else {
    alert("Delete failed ❌");
  }
}

// ---------------- DELETE VEHICLE ----------------
async function deleteRecord(vehicleNo) {
  if (!confirm("Delete all records of this vehicle?")) return;

  for (let i = allData.length - 1; i >= 0; i--) {
    if (allData[i].vehicleNo === vehicleNo) {
      await fetch(`${API}/delete/${i}`, { method: "DELETE" });
    }
  }
  loadData();
}

// ---------------- SEARCH ----------------
function searchVehicle() {
  const value = document.getElementById("searchVehicle").value.toLowerCase();
  Array.from(tableBody.rows).forEach(row => {
    row.style.background =
      row.cells[1].innerText.toLowerCase().includes(value)
        ? "#ffeaa7"
        : "";
  });
}

// ---------------- PDF FUNCTIONS ----------------

// Download full page PDF (all data)
function downloadAllPDF() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF('p','pt','a4');
  doc.setFontSize(12);
  let y = 30;

  doc.text("All Fuel Records - Kavitaraj Petroleum", 40, y);
  y += 20;

  allData.forEach((r, i) => {
    const line = `${i + 1}. Vehicle: ${r.vehicleNo} | Driver: ${r.driverName} | Fuel: ${r.fuelType} | Liters: ${r.liters} | Gift: ${r.gift || "-"} | Gift By: ${r.giftBy || "-"} | Staff: ${r.staffName || "-"}`;
    doc.text(line, 40, y);
    y += 15;
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
  });

  doc.save("All_Fuel_Records.pdf");
}

// Download individual vehicle PDF (multiple entries)
function downloadVehiclePDF(vehicleNo) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF('p','pt','a4');
  doc.setFontSize(12);
  let y = 30;

  const records = allData.filter(r => r.vehicleNo === vehicleNo);

  doc.text(`Fuel Records - ${vehicleNo}`, 40, y);
  y += 20;

  records.forEach((r, i) => {
    const line = `${i + 1}. Date: ${r.date} | Fuel: ${r.fuelType} | Liters: ${r.liters} | Gift: ${r.gift || "-"} | Gift By: ${r.giftBy || "-"} | Staff: ${r.staffName || "-"}`;
    doc.text(line, 40, y);
    y += 15;
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
  });

  doc.save(`${vehicleNo}_Fuel_Records.pdf`);
}

// ---------------- STAFF ----------------
async function loadStaff() {
  const res = await fetch(`${API}/staff-list`);
  allStaff = await res.json();
  staffTableBody.innerHTML = "";

  allStaff.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.username}</td>
      <td>${s.active ? "Active" : "Inactive"}</td>
      <td>
  ${s.active
    ? `<button onclick="deactivateStaff(${s.id})">Deactivate</button>`
    : `<button style="background:#ef4444;color:white" onclick="deleteStaff(${s.id})">Delete</button>`
  }
</td>

      </td>`;
    staffTableBody.appendChild(tr);
  });
}

async function deactivateStaff(id) {
  if (!confirm("Deactivate this staff?")) return;
  await fetch(`${API}/staff-deactivate/${id}`, { method: "PUT" });
  loadStaff();
}
async function deleteStaff(id) {
  if (!confirm("Are you sure you want to delete this staff?")) return;

  const res = await fetch(`${API}/staff-delete/${id}`, {
    method: "DELETE"
  });

  if (res.ok) {
    alert("Staff deleted successfully ✅");
    loadStaff();
  } else {
    alert("Failed to delete staff ❌");
  }
}
async function addNewStaffFromCard() {
  const name = document.getElementById("staffName").value.trim();
  const username = document.getElementById("staffUsername").value.trim();
  const password = document.getElementById("staffPassword").value.trim();

  if (!name || !username || !password) {
    alert("Please fill all staff details");
    return;
  }

  const res = await fetch(`${API}/staff-add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password })
  });

  if (res.ok) {
    alert("Staff added successfully ✅");

    document.getElementById("staffName").value = "";
    document.getElementById("staffUsername").value = "";
    document.getElementById("staffPassword").value = "";

    loadStaff();
  } else {
    alert("Failed to add staff ❌");
  }
}


// ---------------- INIT ----------------
loadData();
