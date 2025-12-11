document.addEventListener("DOMContentLoaded", () => {
  const ratingInput = document.getElementById("rating-input");
  const stars = document.querySelectorAll(".star-rating .star");
  const ratingValue = document.getElementById("rating-value");

  if (!ratingInput || !stars.length) {
    return;
  }

  function updateStars(value) {
    let rating = parseFloat(value);
    if (isNaN(rating)) {
      rating = 0;
    }

    stars.forEach((s) => {
      s.classList.remove("full");
      s.classList.remove("half");
    });

    stars.forEach((star) => {
      const number = parseInt(star.dataset.star, 10);

      if (rating >= number) {
        star.classList.add("full");
      } else {
        if (rating + 0.5 >= number) {
          star.classList.add("half");
        }
      }
    });

    ratingValue.textContent = rating.toFixed(1) + " / 5";
  }

  stars.forEach((star) => {
    star.addEventListener("click", (x) => {
      const rect = star.getBoundingClientRect();
      const clickX = x.clientX - rect.left;

      let half = false;
      if (clickX < rect.width / 2) {
        half = true;
      }

      const number = parseInt(star.dataset.star, 10);
      let value;

      if (half) {
        value = number - 0.5;
      } else {
        value = number;
      }

      ratingInput.value = value;
      updateStars(value);
    });
  });

  updateStars(ratingInput.value);
});
