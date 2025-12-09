document.addEventListener("DOMContentLoaded", function () {
  console.log("Emergency Locator JS loaded");

  const findBtn = document.getElementById("find-emergency-btn");
  const statusEl = document.getElementById("emergency-status");
  const resultEl = document.getElementById("nearest-emergency-result");

  if (!findBtn) {
    console.error("Emergency Locator: button with id 'find-emergency-btn' not found");
    return;
  }

  findBtn.addEventListener("click", function () {
    statusEl.textContent = "Requesting your location...";
    resultEl.innerHTML = "";

    if (!navigator.geolocation) {
      statusEl.textContent = "Geolocation is not supported by your browser.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Got coords from browser:", latitude, longitude);

        statusEl.textContent = "Finding nearest emergency center...";

        try {
          const resp = await fetch("/emergency/nearest", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({ latitude, longitude })
          });

          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            statusEl.textContent =
              errData.error || "Could not find the nearest emergency center.";
            return;
          }

          const data = await resp.json();
          const fac = data.facility;

          statusEl.textContent = `Nearest center found (~${data.distanceMiles} miles away).`;

          resultEl.innerHTML = `
            <div class="facility-card">
              <h3 class="facility-name">${fac.licensedFacilityName}</h3>
              <p><strong>Type:</strong> ${fac.facility_type || "N/A"}</p>
              <p><strong>Address:</strong> ${fac.address || ""}, ${fac.city || ""}, ${fac.state || ""} ${fac.zipCode || ""}</p>
              <p><strong>Phone:</strong> ${fac.telephone || "N/A"}</p>
              <p><strong>Email:</strong> ${
                fac.email
                  ? `<a href="mailto:${fac.email}">${fac.email}</a>`
                  : "N/A"
              }</p>
              <p><strong>License Status:</strong> ${
                fac.isActive ? '<span class="status-active">Active</span>' : '<span class="status-inactive">Inactive</span>'
              }</p>
              <p><strong>Distance:</strong> ${data.distanceMiles} miles</p>
            </div>
          `;
        } catch (err) {
          console.error("Error calling /emergency/nearest:", err);
          statusEl.textContent =
            "Could not find the nearest emergency center. Please try again.";
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        statusEl.textContent = "Unable to get your location: " + error.message;
      }
    );
  });
});
