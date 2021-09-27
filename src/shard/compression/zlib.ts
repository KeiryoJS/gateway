import type { CompressedData, DecompressorEvents, DecompressorFactory, IDecompressor } from "./interface";
import { TypedEmitter } from "tiny-typed-emitter";
import * as zlib from "zlib";

export class ZlibDecompressor extends TypedEmitter<DecompressorEvents> implements IDecompressor {
    static readonly FACTORY: DecompressorFactory = () => new ZlibDecompressor();

    readonly type = "zlib-stream";

    private chunks: Buffer[] = [];
    private incomingChunks: Buffer[] = [];
    private flushing = false;
    private unzip!: zlib.Unzip;

    init(): void {
        this.unzip = zlib.createUnzip({
            flush: zlib.constants.Z_SYNC_FLUSH,
            chunkSize: 128 * 1024
        });

        this.unzip.on("data", c => this.chunks.push(c));
        this.unzip.on("error", e => this.emit("error", e));
    }

    close(): void {
        this.unzip.close();
    }

    decompress(data: CompressedData): void {
        if (data instanceof Buffer) {
            this._decompress(data);
            return;
        } else if (Array.isArray(data)) {
            this.emit("debug", "received fragmented buffer message.");
            for (const buf of data) this._decompress(buf);
            return;
        } else if (data instanceof ArrayBuffer) {
            this.emit("debug", "received array buffer message.");
            this._decompress(Buffer.from(data));
            return;
        }

        throw new TypeError("Received invalid data");
    }

    private _decompress(buf: Buffer) {
        this.flushing
            ? this.incomingChunks.push(buf)
            : this._write(buf);
    }

    private _flush() {
        this.flushing = false;
        if (!this.chunks.length) {
            return;
        }

        let buf = this.chunks[0];
        if (this.chunks.length > 1) {
            buf = Buffer.concat(this.chunks);
        }

        this.chunks = [];
        while (this.incomingChunks.length > 0) {
            const incoming = this.incomingChunks.shift();
            if (incoming && this._write(incoming)) break;
        }

        this.emit("data", buf);
    }

    private _write(buf: Buffer) {
        this.unzip.write(buf);

        const len = buf.length;
        if (len >= 4 && buf.readUInt32BE(len - 4) === 0xFFFF) {
            this.flushing = true;
            this.unzip.flush(zlib.constants.Z_SYNC_FLUSH, this._flush.bind(this));
        }

        return this.flushing;
    }
}
