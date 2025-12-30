// ===============================
// Staff Login JavaScript
// ===============================

function getStaffName() {
  const staff = JSON.parse(localStorage.getItem("staffUser"));
  return staff ? staff.name : "";
}

function checkStaffLogin() {
  const staff = localStorage.getItem("staffUser");
  if (!staff) {
    alert("Login first");
    window.location.href = "staffLogin.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("staffLoginForm");
  const loginError = document.getElementById("loginError");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      loginError.textContent = "Username आणि Password द्या";
      return;
    }

    try {
      // ✅ ONLY FIX: localhost / STAFF_API काढून direct route
      const res = await fetch("/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("staffUser", JSON.stringify(data.staff));
        window.location.href = "form.html";
      } else {
        loginError.textContent = data.message || "Invalid login";
      }

    } catch (err) {
      console.error(err);
      loginError.textContent = "Network error";
    }
  });
});
