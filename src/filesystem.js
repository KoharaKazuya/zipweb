// @see https://github.com/GoogleChromeLabs/browser-nativefs

/**
 * @param {Object} options
 * @param {boolean=} options.recursive
 * @returns {Promise<File[]>}
 */
export function directoryOpen(options = {}) {
  options.recursive = options.recursive || false;
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.addEventListener("change", () => {
      let files = Array.from(input.files);
      if (!options.recursive) {
        files = files.filter((file) => {
          return file.webkitRelativePath.split("/").length === 2;
        });
      }
      resolve(files);
    });
    input.click();
  });
}

/**
 * @param {Blob} blob
 * @param {Object} options
 * @param {string=} options.fileName
 */
export async function fileSave(blob, options = {}) {
  const a = document.createElement("a");
  a.download = options.fileName || "Untitled";
  a.href = URL.createObjectURL(blob);
  a.addEventListener("click", () => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
  });
  a.click();
}
