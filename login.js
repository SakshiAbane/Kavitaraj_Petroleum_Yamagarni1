const API_URL = "http://localhost:3000";

function loginAdmin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.success) {
        // Login success → redirect to admin page
        window.location.href = "admin.html";
      } else {
        // Login failed
        alert("Invalid username or password");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error. Make sure server is running on localhost:3000");
    });
}
