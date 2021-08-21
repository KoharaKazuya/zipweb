import { Deflate } from "fflate";

/**
 * @param {ArrayBuffer} data
 * @return {Promise<Uint8Array>}
 */
export function deflateFallback(data) {
  return new Promise((resolve) => {
    const chunks = [];

    const deflateStream = new Deflate((chunk, final) => {
      chunks.push(chunk);

      if (final) {
        if (chunks.length === 0) return resolve(new Uint8Array(0));
        if (chunks.length === 1) return resolve(chunks[0]);

        const length = chunks.reduce((accu, c) => accu + c.length, 0);
        const merged = new Uint8Array(length);

        let cursor = 0;
        for (const chunk of chunks) {
          merged.set(chunk, cursor);
          cursor += chunk.length;
        }

        return resolve(merged);
      }
    });

    deflateStream.push(new Uint8Array(data), true);
  });
}
