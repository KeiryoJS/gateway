import type { EncodedData, IEncoder } from "./interface";
import type { GatewayReceivePayload, GatewaySendPayload } from "discord-api-types";
import { TypedEmitter } from "tiny-typed-emitter";

export class JsonEncoder<To = GatewaySendPayload, From = GatewayReceivePayload> extends TypedEmitter implements IEncoder<To, From> {
    encode(data: To): EncodedData {
        return JSON.stringify(data);
    }

    decode(data: EncodedData): From {
        if (data instanceof Buffer) {
            return JSON.parse(data.toString());
        } else if (data instanceof ArrayBuffer) {
            data = Buffer.from(data);
            return JSON.parse(data.toString());
        } else if (Array.isArray(data)) {
            this.emit("debug", "received fragmented buffer message.");
            data = Buffer.concat(data);
            return JSON.parse(data.toString());
        }

        return JSON.parse(data);
    }
}
