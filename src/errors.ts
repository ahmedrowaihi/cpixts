/** Error types mirroring the original library's, for 1:1 error behavior. */

/** Equivalent of Python's `ValueError`. */
export class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueError";
  }
}
