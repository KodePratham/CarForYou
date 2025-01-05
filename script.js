const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTedmfpqQMvyYnkqgqYVeDbDLqh3S8NOIytFOhauK8iuI-sIEUByMPRwqOELlRm9aODx3YLeLJuMw4q/pub?output=csv"; // Replace with your published CSV link

document.getElementById("quizForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  let userPoints = 0;

  // Extract budget tier from form data
  const budgetTier = parseInt(formData.get("q3"), 10); // Assuming "q3" is the budget question
  if (!budgetTier) {
    alert("Please select a budget tier!");
    return;
  }

  // Calculate total points
  for (let [key, value] of formData.entries()) {
    userPoints += parseInt(value, 10);
  }

  // Log the user's score for testing
  console.log("User's total score:", userPoints);
  console.log("Selected budget tier:", budgetTier);

  // Fetch car data from the published CSV
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      const rows = data.split("\n").map(row => row.split(","));

      // Parse cars based on the column structure
      const cars = rows.slice(1).map(row => {
        const [name, points, onRoadPrice, budgetTier, fuel, transmission, imageUrl] = row;

        return {
          name: name.trim(),
          points: parseInt(points.trim(), 10),
          onRoadPrice: onRoadPrice.trim(),
          budgetTier: parseInt(budgetTier.trim(), 10),
          fuel: fuel.trim(),
          transmission: transmission.trim(),
          imageUrl: imageUrl.trim(),
        };
      });

      // Filter cars by budget tier
      const filteredCars = cars.filter(car => car.budgetTier <= budgetTier);

      // Sort cars by proximity to user points and select top 10
      const topCars = filteredCars
        .sort((a, b) => Math.abs(a.points - userPoints) - Math.abs(b.points - userPoints))
        .slice(0, 10);

      // Display results
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = ""; // Clear previous results

      if (topCars.length === 0) {
        resultsContainer.innerHTML = "<p>No cars found for your selection.</p>";
        return;
      }

      topCars.forEach(car => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${car.imageUrl}" alt="${car.name}">
          <div>
            <h2>${car.name}</h2>
            <p>On Road Price: ${car.onRoadPrice}</p>
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
