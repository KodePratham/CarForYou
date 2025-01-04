const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTedmfpqQMvyYnkqgqYVeDbDLqh3S8NOIytFOhauK8iuI-sIEUByMPRwqOELlRm9aODx3YLeLJuMw4q/pub?output=csv"; // Replace with your published CSV link

document.getElementById("quizForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  let userPoints = 0;

  // Calculate total points
  for (let [key, value] of formData.entries()) {
    userPoints += parseInt(value, 10);
  }

  // Log the user's score for testing
  console.log("User's total score:", userPoints);

  // Fetch car data from the published CSV
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      const rows = data.split("\n").map(row => row.split(","));

      // Parse cars, keeping the entire "On road price" column (with commas)
      const cars = rows.slice(1).map(row => {
        const [name, points, ...rest] = row; // Destructure to handle extra columns
        const price = rest.slice(0, rest.length - 3).join(","); // Join everything in the "On road price" column
        const [fuel, transmission, imageUrl] = rest.slice(rest.length - 3);

        return {
          name: name.trim(),
          points: parseInt(points.trim(), 10),
          price: price.trim(),
          fuel: fuel.trim(),
          transmission: transmission.trim(),
          imageUrl: imageUrl.trim(),
        };
      });

      // Sort cars by proximity to user points and select top 10
      const topCars = cars
        .sort((a, b) => Math.abs(a.points - userPoints) - Math.abs(b.points - userPoints))
        .slice(0, 10);

      // Display results
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = ""; // Clear previous results

      topCars.forEach(car => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${car.imageUrl}" alt="${car.name}">
          <div>
            <h2>${car.name}</h2>
            <p>On Road Price: ${car.price}</p>
            <p>Fuel Type: ${car.fuel}</p>
            <p>Transmission: ${car.transmission}</p>
          </div>
        `;
        resultsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error fetching CSV data:", error);
    });
});
