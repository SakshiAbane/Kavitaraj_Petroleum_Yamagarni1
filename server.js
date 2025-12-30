const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // ✅ FIXED FOR RENDER

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/* ---------------- HOME ROUTE (FIX) ---------------- */
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "staffLogin.html"));
});

/* ---------------- DATA FILES ---------------- */
const DATA_FILE = path.join(__dirname, "data.json");
const STAFF_FILE = path.join(__dirname, "staff.json");

/* ---------------- ENSURE FILES EXIST ---------------- */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(STAFF_FILE)) {
  fs.writeFileSync(
    STAFF_FILE,
    JSON.stringify(
      [
        { id: 1, name: "Staff 1", username: "staff1", password: "1111", active: true },
        { id: 2, name: "Staff 2", username: "staff2", password: "2222", active: true }
      ],
      null,
      2
    )
  );
}

/* ---------------- LOAD DATA ---------------- */
let fuelRecords = [];
let staffList = [];

try {
  fuelRecords = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
} catch (e) {
  fuelRecords = [];
}

try {
  staffList = JSON.parse(fs.readFileSync(STAFF_FILE, "utf-8"));
} catch (e) {
  staffList = [];
}

/* ---------------- SAVE HELPERS ---------------- */
const saveFuel = () =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(fuelRecords, null, 2));

const saveStaff = () =>
  fs.writeFileSync(STAFF_FILE, JSON.stringify(staffList, null, 2));

/* ---------------- ADMIN LOGIN ---------------- */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Kavitaraj" && password === "8362") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

/* ---------------- STAFF LOGIN ---------------- */
app.post("/staff-login", (req, res) => {
  const { username, password } = req.body;
  const staff = staffList.find(
    s => s.username === username && s.password === password && s.active
  );

  if (!staff) {
    return res.status(401).json({ success: false });
  }

  res.json({ success: true, staff });
});

/* ---------------- STAFF MANAGEMENT ---------------- */
app.get("/staff-list", (req, res) => res.json(staffList));

app.post("/staff-add", (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ success: false });

  staffList.push({
    id: Date.now(),
    name,
    username,
    password,
    active: true
  });

  saveStaff();
  res.json({ success: true });
});

app.put("/staff-deactivate/:id", (req, res) => {
  const staff = staffList.find(s => s.id == req.params.id);
  if (!staff) return res.status(404).json({ success: false });

  staff.active = false;
  saveStaff();
  res.json({ success: true });
});

app.delete("/staff-delete/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = staffList.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Staff not found" });
  }

  staffList.splice(index, 1);
  saveStaff();
  res.json({ message: "Staff deleted successfully" });
});

/* ---------------- ADD FUEL ---------------- */
app.post("/add-fuel", (req, res) => {
  const data = req.body;

  if (!data.vehicleNo || !data.liters || !data.staffName) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  fuelRecords.push({
    ...data,
    date: new Date().toLocaleString()
  });

  saveFuel();
  res.json({ success: true });
});

/* ---------------- GET DATA ---------------- */
app.get("/fuel-data", (req, res) => res.json(fuelRecords));

/* ---------------- UPDATE ---------------- */
app.put("/update/:index", (req, res) => {
  const index = Number(req.params.index);

  if (!fuelRecords[index]) {
    return res.status(400).json({ success: false });
  }

  fuelRecords[index] = {
    ...fuelRecords[index],
    ...req.body
  };

  saveFuel();
  res.json({ success: true });
});

/* ---------------- DELETE ---------------- */
app.delete("/delete/:index", (req, res) => {
  const index = Number(req.params.index);

  if (!fuelRecords[index]) {
    return res.status(400).json({ success: false });
  }

  fuelRecords.splice(index, 1);
  saveFuel();
  res.json({ success: true });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
