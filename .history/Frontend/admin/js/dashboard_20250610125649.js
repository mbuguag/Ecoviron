function showSection(sectionId) {
  const sections = document.querySelectorAll(".admin-section");
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });
}
