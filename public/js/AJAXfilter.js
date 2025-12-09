document.addEventListener("DOMContentLoaded", function () {
  const filterForm = document.getElementById("facility-filters");
  const resetButton = document.getElementById("reset-filters");
  const facilityListContainer = document.getElementById("facility-list-container");
  
  // Get input fields for live filtering
  const countyInput = document.getElementById("county");
  const cityInput = document.getElementById("city");
  const facilityTypeInput = document.getElementById("facilityType");
  const isActiveSelect = document.getElementById("isActive");
  
  let debounceTimer;

  // Function to fetch facilities
  function fetchFacilities() {
    const county = countyInput.value;
    const city = cityInput.value;
    const facilityType = facilityTypeInput.value;
    const isActive = isActiveSelect.value;

    // Perform the AJAX request 
    fetch(`/facilities?county=${county}&city=${city}&facilityType=${facilityType}&isActive=${isActive}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.hospitals.length) {
          const facilityListHtml = data.hospitals.map(facility => {
            return `
              <div class="facility-card">
                <h3 class="facility-name">
                  <a href="/facilities/${facility._id}">${facility.licensedFacilityName}</a>
                </h3>
                <p><strong>Type:</strong> ${facility.facilityType}</p>
                <p><strong>Address:</strong> ${facility.address}, ${facility.city}, ${facility.county} County</p>
                <p><strong>Phone:</strong> ${facility.telephone}</p>
                <p><strong>Email:</strong> <a href="mailto:${facility.email}">${facility.email}</a></p>
                <p><strong>License Status:</strong> 
                  ${facility.isActive ? '<span class="status-active">Active</span>' : '<span class="status-inactive">Inactive</span>'}
                </p>
                <p><strong>Average Rating:</strong> ${facility.averageRating} (${facility.totalReviews} reviews)</p>
              </div>
            `;
          }).join('');

          facilityListContainer.innerHTML = `<div class="facility-list">${facilityListHtml}</div>`;
        } else {
          facilityListContainer.innerHTML = "<p>No facilities found with these filters.</p>";
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }

  // Debounced function for live filtering (waits 500ms after typing stops)
  function debouncedFetch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchFacilities();
    }, 500);
  }

  // Add live filtering on input events
  countyInput.addEventListener('input', debouncedFetch);
  cityInput.addEventListener('input', debouncedFetch);
  facilityTypeInput.addEventListener('input', debouncedFetch);
  isActiveSelect.addEventListener('change', fetchFacilities); // Immediate filter on dropdown change

  // Handle Filter Form Submission (keep original behavior)
  filterForm.addEventListener("submit", function (e) {
    e.preventDefault(); 
    fetchFacilities();
  });

  // Reset Button
  resetButton.addEventListener('click', function() {
    // Reset form inputs
    countyInput.value = '';
    cityInput.value = '';
    facilityTypeInput.value = '';
    isActiveSelect.value = ''; // Reset dropdown to "All"

    // Fetch all facilities
    fetchFacilities();
  });
});