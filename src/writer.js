export class DataWriter {
  /** @param {ArrayBuffer} buffer */
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }

  /** @param {number} data */
  uint8(data) {
    this.view.setUint8(this.offset, data);
    this.offset += 1;
  }

  /** @param {number} data */
  uint16(data) {
    this.view.setUint16(this.offset, data, true);
    this.offset += 2;
  }

  /** @param {number} data */
  uint32(data) {
    this.view.setUint32(this.offset, data, true);
    this.offset += 4;
  }

  /** @param {Uint8Array} data */
  uint8Array(data) {
    new Uint8Array(this.buffer, this.offset, data.length).set(data);
    this.offset += data.length;
  }
}
