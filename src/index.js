import { directoryOpen, fileSave } from "./filesystem.js";
import { ZipBuilder } from "./zip.js";

const ignoreFileNamePatterns = [/^Thumbs\.db$/, /\.DS_Store$/];

const button = document.querySelector("button");
const processing = document.querySelector("#processing");
const progress = document.querySelector("#progress");
let running = false;

button.addEventListener("click", () => {
  if (running) return;

  (async () => {
    const files = await directoryOpen({ recursive: true });
    if (files.length === 0) {
      alert("cannot create zip for zero file");
      return;
    }

    running = true;
    button.classList.add("hidden");
    processing.classList.remove("hidden");

    const builder = new ZipBuilder();
    for (const file of files) {
      if (ignoreFileNamePatterns.some((p) => file.name.match(p))) continue;
      builder.add(fullpath(file), file);
    }

    (function renderProgress() {
      progress.textContent = `${builder.progress.compressedEntries} / ${builder.entries.length}`;
      if (running) requestAnimationFrame(renderProgress);
    })();

    const dirname = fullpath(files[0]).split("/")[0];
    const content = await builder.build();

    await fileSave(content, { fileName: `${dirname}.zip` });
  })().finally(() => {
    running = false;
    button.classList.remove("hidden");
    processing.classList.add("hidden");
  });
});

/**
 * @param {File} file
 */
function fullpath(file) {
  return `${file.webkitRelativePath}${
    file.webkitRelativePath.endsWith(file.name) ? "" : file.name
  }`;
}
