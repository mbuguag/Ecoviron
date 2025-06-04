document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blog-grid");

  const blogs = [
    {
      title: "How to Conduct a Proper Environmental Impact Assessment",
      snippet: "Learn the key steps in preparing an EIA that complies with NEMA standards in Kenya.",
      image: "assets/images/blog/eia-guide.jpg",
      link: "#"
    },
    {
      title: "Why Sustainability Reporting Matters",
      snippet: "Explore how ESG reporting boosts your credibility and market standing.",
      image: "assets/images/blog/sustainability-reporting.jpg",
      link: "#"
    },
    {
      title: "Water Conservation Tips for Small Businesses",
      snippet: "Simple ways to reduce your water footprint without affecting operations.",
      image: "assets/images/blog/water-conservation.jpg",
      link: "#"
    }
  ];

  blogs.forEach(post => {
    const card = document.createElement("div");
    card.className = "blog-card";
    card.innerHTML = `
      <img src="${resolvePath(post.image)}" alt="${post.title}" loading="lazy" />
      <div class="blog-card-body">
        <h3>${post.title}</h3>
        <p>${post.snippet}</p>
        <a href="${post.link}" class="btn-outline">Read More</a>
      </div>
    `;
    blogGrid.appendChild(card);
  });
});
