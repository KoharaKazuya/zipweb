const body = document.body;
const button = document.querySelector("button");
const processing = document.querySelector("#processing");
const progress = document.querySelector("#progress");

body.addEventListener("dragover", (event) => {
  event.preventDefault();
});
export function onDrop(listener) {
  body.addEventListener("drop", (event) => {
    event.preventDefault();

    const files = [];
    let foundDirectory = false;
    for (const item of event.dataTransfer.items) {
      const entry = item.webkitGetAsEntry();
      if (entry.isDirectory) {
        foundDirectory = true;
      } else {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (foundDirectory)
      alert(
        "Do not drop directory. Directories are ignored. Click button to select directory."
      );

    listener(files);
  });
}

export function onButtonClick(listener) {
  button.addEventListener("click", listener);
}

export function showProcessing() {
  button.classList.add("hidden");
  processing.classList.remove("hidden");
}

export function hideProcessing() {
  button.classList.remove("hidden");
  processing.classList.add("hidden");
}

export function updateProgress(text) {
  progress.textContent = text;
}
