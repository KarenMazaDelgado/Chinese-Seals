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

  //audio

  const readPageBtn = document.getElementById("readPageBtn");
  const pauseAudioBtn = document.getElementById("pauseAudioBtn");
  const resumeAudioBtn = document.getElementById("resumeAudioBtn");

  function readText(text) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;
    speech.lang = "en-US";

    window.speechSynthesis.speak(speech);
  }

  readPageBtn.addEventListener("click", function () {
    const title = document.getElementById("stampTitle").innerText;
    const subtitle = document.querySelector(".subtitle").innerText;

    const descriptions = document.querySelectorAll(".description");


    let pageText = title + ". " + subtitle + ". ";
    //pageText += "Seal information. " + infoList + ". ";

    descriptions.forEach(function (section) {
      pageText += section.innerText + " ";
    });

    readText(pageText);
  });

  pauseAudioBtn.addEventListener("click", function () {
    window.speechSynthesis.pause();
  });

  resumeAudioBtn.addEventListener("click", function () {
    window.speechSynthesis.resume();
  });

const allLinks = document.querySelectorAll("a");

  allLinks.forEach(function(link) {
    link.addEventListener("click", function() {
      window.speechSynthesis.cancel();
    });
  });

function stopAudio() {
  window.speechSynthesis.pause();
  window.speechSynthesis.cancel();
}


window.addEventListener("load", function () {
  stopAudio();
});


document.querySelectorAll("a").forEach(function(link) {
  link.addEventListener("click", function(event) {
    event.preventDefault();

    stopAudio();

    const targetURL = link.href;

    setTimeout(function() {
      window.location.href = targetURL;
    }, 100);
  });
});

window.addEventListener("beforeunload", function () {
  stopAudio();
});

window.addEventListener("pagehide", function () {
  stopAudio();
});

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopAudio();
  }
});
