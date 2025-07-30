document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("edit-profile-btn");
  const saveBtn = document.getElementById("save-profile-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");
  const profileForm = document.getElementById("profile-form");
  const profileInputs = profileForm.querySelectorAll("input, select");

  // Simulated user data (replace this with actual fetch call)
  const userData = {
    fullName: "John Doe",
    email: "john@example.com",
    profilePicture: "https://via.placeholder.com/100",
  };

  // Load user data into the form
  function loadProfile() {
    document.getElementById("full-name").value = userData.fullName;
    document.getElementById("email").value = userData.email;
    document.getElementById("profile-picture").src = userData.profilePicture;
    disableForm();
  }

  // Disable form inputs
  function disableForm() {
    profileInputs.forEach((input) => input.setAttribute("disabled", "true"));
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
    editBtn.style.display = "inline-block";
  }

  // Enable form inputs
  function enableForm() {
    profileInputs.forEach((input) => input.removeAttribute("disabled"));
    saveBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";
    editBtn.style.display = "none";
  }

  // Save logic (you would call your backend here)
  function saveProfile(e) {
    e.preventDefault();
    const updatedData = {
      fullName: document.getElementById("full-name").value,
      email: document.getElementById("email").value,
    };
    console.log("Saving user data:", updatedData);
    // Add fetch PUT/POST request here if needed

    disableForm();
    alert("Profile updated successfully.");
  }

  editBtn.addEventListener("click", enableForm);
  cancelBtn.addEventListener("click", loadProfile);
  profileForm.addEventListener("submit", saveProfile);

  // Load profile on page load
  loadProfile();
});
