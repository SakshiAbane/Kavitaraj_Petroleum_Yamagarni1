const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {

  const staffData = localStorage.getItem("staffUser");

  if (!staffData) {
    alert("Please login first");
    window.location.href = "staffLogin.html";
    return;
  }

  const loggedStaff = JSON.parse(staffData);

  const form = document.getElementById("fuelForm");

  const vehicleNo = document.getElementById("vehicleNo");
  const driverName = document.getElementById("driverName");
  const driverContact = document.getElementById("driverContact");
  const fuelType = document.getElementById("fuelType");
  const liters = document.getElementById("litres");

  /* ✅ FIXED IDS */
  const gift = document.getElementById("giftDiscount");
  const giftBy = document.getElementById("amountCash");

  const staffName = document.getElementById("staffName");
  const adminButton = document.getElementById("adminButton");

  const modal = document.getElementById("repeatModal");
  const modalContent = document.querySelector(".modal-content");
  const tbody = document.getElementById("prevTableBody");
  const closeBtn = document.getElementById("closeModalBtn");

  if (staffName) {
    staffName.innerHTML = `<option>${loggedStaff.name}</option>`;
    staffName.value = loggedStaff.name;
    staffName.disabled = true;
  }

  vehicleNo.addEventListener("input", () => {
    vehicleNo.value = vehicleNo.value.toUpperCase();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      vehicleNo: vehicleNo.value.trim(),
      driverName: driverName.value.trim(),
      driverContact: driverContact.value.trim(),
      fuelType: fuelType.value,
      liters: Number(liters.value),

      /* ✅ FIXED VARIABLES */
      gift_amount: gift.value.trim(),
      cash_given_in_Amount: giftBy.value.trim(),

      staffName: loggedStaff.name
    };

    if (!data.vehicleNo || !data.liters) {
      alert("Vehicle No and Liters are required");
      return;
    }

    try {
      const res = await fetch(`${API}/add-fuel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.repeated) {
        showRepeatedRecords(
          result.previousRecords,
          result.currentRecord,
          result.count
        );
      } else {
        alert("Data saved successfully ✅");
        form.reset();
      }

    } catch (err) {
      alert("Server not running or network error");
      console.error(err);
    }
  });

  function showRepeatedRecords(previousRecords, currentRecord) {
    tbody.innerHTML = "";

    [...previousRecords, currentRecord].forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${r.date || "-"}</td>
        <td>${r.fuelType || "-"}</td>
        <td>${r.liters || "-"}</td>
        <td>${r.gift_amount || "-"}</td>
        <td>${r.cash_given_in_Amount || "-"}</td>
        <td>${r.staffName || "-"}</td>
      `;
      tbody.appendChild(tr);
    });

    modal.style.display = "flex";
  }

  modalContent.addEventListener("click", e => e.stopPropagation());

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    form.reset();
  });

  modal.addEventListener("click", () => {
    modal.style.display = "none";
    form.reset();
  });

  if (adminButton) {
    adminButton.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  }

});
