import { deflate } from "./deflate.js";
import { DataWriter } from "./writer.js";

const textEncoder = new TextEncoder();

export class ZipBuilder {
  constructor() {
    /**
     * @typedef {Object} Entry
     * @property {string} path
     * @property {Blob} data
     * @property {Intermediate} [intermediate]
     */
    /**
     * @typedef {Object} Intermediate
     * @property {ArrayBuffer} buffer
     * @property {Uint8Array} fileNameData
     * @property {Uint8Array} compressed
     * @property {number} crc32
     * @property {number} offsetOfLocalHeader
     * */
    /** @type {Entry[]} */
    this.entries = [];
    /**
     * @type {Object}
     * @property {number} compressedEntries
     */
    this.progress = { compressedEntries: 0 };
  }

  /**
   * @param {string} path
   * @param {Blob} data
   */
  add(path, data) {
    this.entries.push({ path, data });
  }

  /**
   * @return {Promise<Blob>} zip file
   */
  async build() {
    this.progress.compressedEntries = 0;

    let offsetOfLocalHeader = 0;
    let totalSizeOfCentralDirectory = 0;
    for (const entry of this.entries) {
      const buffer = await arrayBuffer(entry.data);
      const fileNameData = textEncoder.encode(entry.path);
      const compressed = await deflate(buffer);
      const sizeOfLocalFileHeader = 30 + fileNameData.length;
      const sizeOfCentralDirectoryHeader = 46 + fileNameData.length;

      entry.intermediate = {
        buffer,
        fileNameData,
        compressed,
        crc32: crc32(new Uint8Array(buffer)),
        offsetOfLocalHeader,
      };

      offsetOfLocalHeader += sizeOfLocalFileHeader + compressed.length;
      totalSizeOfCentralDirectory += sizeOfCentralDirectoryHeader;

      this.progress.compressedEntries += 1;
    }

    const buffer = new ArrayBuffer(
      offsetOfLocalHeader +
        totalSizeOfCentralDirectory +
        // fixed data size (= end of central directory)
        22
    );
    const writer = new DataWriter(buffer);

    for (const entry of this.entries) {
      const i = entry.intermediate;
      if (!i) throw new Error("unexpected null");
      // ===================
      //  Local File Header
      // ===================
      // local file header signature
      writer.uint32(0x04034b50);
      // version needed to extract
      writer.uint16(20); // version 2.0
      // general purpose bit flag
      writer.uint16(0x0800); // the filename and comment are UTF-8
      // compression method
      writer.uint16(8); // The file is Deflated
      // last mod file time
      writer.uint16(0);
      // last mod file date
      writer.uint16(0);
      // crc-32
      writer.uint32(i.crc32);
      // compressed size
      writer.uint32(i.compressed.length);
      // uncompressed size
      writer.uint32(entry.data.size);
      // file name length
      writer.uint16(i.fileNameData.length);
      // extra field length
      writer.uint16(0);
      // file name
      writer.uint8Array(i.fileNameData);
      // extra field

      // ===========
      //  File Data
      // ===========
      writer.uint8Array(i.compressed);
    }

    for (const entry of this.entries) {
      const i = entry.intermediate;
      if (!i) throw new Error("unexpected null");
      // ==========================
      //  Central Directory Header
      // ==========================
      // central file header signature
      writer.uint32(0x02014b50);
      // version made by
      writer.uint8(63); // version 6.3
      writer.uint8(0);
      // version needed to extract
      writer.uint16(20); // version 2.0
      // general purpose bit flag
      writer.uint16(0x0800); // the filename and comment are UTF-8
      // compression method
      writer.uint16(8); // The file is Deflated
      // last mod file time
      writer.uint16(0);
      // last mod file date
      writer.uint16(0);
      // crc-32
      writer.uint32(i.crc32);
      // compressed size
      writer.uint32(i.compressed.length);
      // uncompressed size
      writer.uint32(entry.data.size);
      // file name length
      writer.uint16(i.fileNameData.length);
      // extra field length
      writer.uint16(0);
      // file comment length
      writer.uint16(0);
      // disk number start
      writer.uint16(0);
      // internal file attributes
      writer.uint16(0);
      // external file attributes
      writer.uint32(0);
      // relative offset of local header
      writer.uint32(i.offsetOfLocalHeader);
      // file name
      writer.uint8Array(i.fileNameData);
      // extra field
      // file comment
    }

    // =================================
    //  End of Central Directory Record
    // =================================
    // end of central dir signature
    writer.uint32(0x06054b50);
    // number of this disk
    writer.uint16(0);
    // number of the disk with the start of the central directory
    writer.uint16(0);
    // total number of entries in the central directory on this disk
    writer.uint16(this.entries.length);
    // total number of entries in the central directory
    writer.uint16(this.entries.length);
    // size of the central directory
    writer.uint32(totalSizeOfCentralDirectory);
    // offset of start of central directory with respect to the starting disk number
    writer.uint32(offsetOfLocalHeader);
    // .ZIP file comment length
    writer.uint16(0);
    // .ZIP file comment

    return new Blob([buffer], { type: "application/zip" });
  }
}

// arrayBuffer
/**
 * @param {Blob} blob
 * @return {Promise<ArrayBuffer>}
 */
function arrayBuffer(blob) {
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();

  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

// CRC-32
const crcTable = new Uint32Array(256);
for (let i = 256; i--; ) {
  let t = i;
  for (let k = 8; k--; ) t = t & 1 ? 3988292384 ^ (t >>> 1) : t >>> 1;
  crcTable[i] = t;
}
/**
 * @param {Uint8Array} data
 * @return {number} Uint32 value
 */
function crc32(data) {
  const l = data.length;
  let crc = -1;
  for (let i = 0; i < l; i++)
    crc = (crc >>> 8) ^ crcTable[(crc & 0xff) ^ data[i]];
  return (crc ^ -1) >>> 0;
}
