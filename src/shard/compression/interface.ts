import type { TypedEmitter } from "tiny-typed-emitter";

export interface IDecompressor extends TypedEmitter<DecompressorEvents> {
    readonly type: "zlib-stream";

    /**
     * Initializes this decompressor.
     */
    init(): void;

    /**
     * Closes this decompressor.
     */
    close(): void;

    /**
     * Adds data to decompress.
     * @param data The data to decompress.
     */
    decompress(data: CompressedData): void;
}

export type DecompressorFactory = () => IDecompressor;

export type CompressedData = string | Buffer | Buffer[] | ArrayBuffer;

export type DecompressorEvents = {
    data: (decompressed: Buffer) => void;
    debug: (message: string) => void;
    error: (error: Error) => void;
}
