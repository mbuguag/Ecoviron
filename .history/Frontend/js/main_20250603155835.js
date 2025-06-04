.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.service-card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.service-card h3 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  color: #2e7d32;
}
