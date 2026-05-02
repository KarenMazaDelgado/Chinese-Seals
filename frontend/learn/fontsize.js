const sizeButtons = document.querySelectorAll(".size-btn");

  const sizeMap = {
    small: "14px",
    medium: "16px",
    large: "21px"
  };

  function setTextSize(size) {
    document.documentElement.style.setProperty("--reading-font-size", sizeMap[size]);

    localStorage.setItem("textSize", size);

    sizeButtons.forEach(button => {
      if (button.dataset.size === size) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  sizeButtons.forEach(button => {
    button.addEventListener("click", function () {
      const selectedSize = this.dataset.size;
      setTextSize(selectedSize);
    });
  });

  const savedSize = localStorage.getItem("textSize") || "medium";
  setTextSize(savedSize);