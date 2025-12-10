document.addEventListener("DOMContentLoaded", function () {
    let contrastToggle = document.getElementById("contrastToggle")
    let contrastRef = document.getElementById("contrastRef")

    contrastToggle.addEventListener("click", function () {
        let isAlreadyContrast = contrastRef.getAttribute("href").includes("contrast")

        if (isAlreadyContrast) {
            contrastRef.setAttribute("href", "public/css/styles.css")
            contrastToggle.textContent = "High Contrast Mode"
            localStorage.setItem("contrast?", "nocontrast");
        }
        else {
            contrastRef.setAttribute("href", "/public/css/contrast.css")
            contrastToggle.textContent = "Default Colors"
            localStorage.setItem("contrast?", "contrast");
        }
    })

    let saveChanges = localStorage.getItem("contrast?")
    if (saveChanges == "contrast") {
        contrastRef.setAttribute("href", "/public/css/contrast.css")
        contrastToggle.textContent = "Default Colors"
    }
})