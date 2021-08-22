import {
  hideProcessing,
  onButtonClick,
  onDrop,
  showProcessing,
  updateProgress,
} from "./dom.js";
import { directoryOpen, fileSave } from "./filesystem.js";
import { ZipBuilder } from "./zip.js";

const ignoreFileNamePatterns = [/^Thumbs\.db$/, /\.DS_Store$/];

let running = false;

const throwable =
  (f) =>
  (...args) =>
    f(...args).catch((err) => {
      console.error(err);
      alert(err);
    });

onDrop(
  throwable(async (files) => {
    await createZip(files);
  })
);

onButtonClick(
  throwable(async () => {
    const files = await directoryOpen({ recursive: true });
    await createZip(files);
  })
);

/**
 * @param {File[]} files
 */
async function createZip(files) {
  if (running) throw new Error("cannot create while creating another");
  running = true;
  showProcessing();
  try {
    if (files.length === 0) throw new Error("cannot create zip for zero file");

    const builder = new ZipBuilder();
    for (const file of files) {
      if (ignoreFileNamePatterns.some((p) => file.name.match(p))) continue;
      builder.add(fullpath(file), file);
    }

    (function renderProgress() {
      updateProgress(
        `${builder.progress.compressedEntries} / ${builder.entries.length}`
      );
      if (running) requestAnimationFrame(renderProgress);
    })();

    const dirname = fullpath(files[0]).split("/")[0];
    const content = await builder.build();

    await fileSave(content, { fileName: `${dirname}.zip` });
  } finally {
    running = false;
    hideProcessing();
  }
}

/**
 * @param {File} file
 */
function fullpath(file) {
  return `${file.webkitRelativePath}${
    file.webkitRelativePath.endsWith(file.name) ? "" : file.name
  }`;
}
