const button = document.querySelector("button");
const processing = document.querySelector("#processing");
const progress = document.querySelector("#progress");

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
