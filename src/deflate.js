/**
 * @param {ArrayBuffer} data
 * @return {Promise<Uint8Array>}
 */
export async function deflate(data) {
  if (!("CompressionStream" in window)) {
    const { default: pako } = await import("pako");
    const output = pako.deflate(data);
    return output.slice(2, -4);
  }
  return await compressArrayBuffer(data);
}

/**
 * @param {ArrayBuffer} input
 * @return {Promise<Uint8Array>}
 * @see https://wicg.github.io/compression/#example-deflate-compress
 */
async function compressArrayBuffer(input) {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  writer.write(input);
  writer.close();
  const output = [];
  const reader = cs.readable.getReader();
  let totalSize = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    output.push(value);
    totalSize += value.byteLength;
  }
  const concatenated = new Uint8Array(totalSize);
  let offset = 0;
  for (const array of output) {
    concatenated.set(array, offset);
    offset += array.byteLength;
  }
  return concatenated.slice(2, -4);
}
