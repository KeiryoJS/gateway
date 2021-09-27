import type { GatewayReceivePayload, GatewaySendPayload } from "discord-api-types";
import type { TypedEmitter } from "tiny-typed-emitter";

export interface IEncoder<From = GatewaySendPayload, To = GatewayReceivePayload> extends TypedEmitter<EncoderEvents> {
    /**
     * Encodes any outgoing data
     *
     * @param data The data to encode
     * @returns EncodedData
     */
    encode(data: From): EncodedData;

    /**
     * Decodes any encoded data.
     *
     * @param data The data to decode.
     * @returns To
     */
    decode(data: EncodedData): To;
}

export type EncodedData = string | Buffer | Buffer[] | ArrayBuffer;

export type EncoderEvents = {
    debug: (message: string) => void;
}
