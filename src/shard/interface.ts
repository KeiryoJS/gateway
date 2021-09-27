import type { GatewayDispatchPayload, GatewaySendPayload } from "discord-api-types";
import type { TypedEmitter } from "tiny-typed-emitter";
import type { ShardState } from "./state";
import type { snowflake } from "@keiryo/common";

export interface IShard extends TypedEmitter<ShardEvents> {
    /**
     * The ID of this shard.
     */
    readonly id: number;

    /**
     * The state of this shard.
     * @returns {ShardState} The current state of this shard.
     */
    get state(): ShardState;

    /**
     * Updates this shard's state.
     * @param updated The updated state of this shard.
     */
    set state(updated: ShardState);

    /**
     * Connects this shard to the gateway.
     */
    connect(): Promise<void>;

    /**
     * Disconnects this shard from the gateway.
     *
     * @param options The options to use.
     */
    disconnect(options?: DisconnectOptions): Promise<void>;

    /**
     * Destroys this shard, it must be remade before it can reconnect.
     */
    destroy(): Promise<void>;

    /**
     * Sends a payload to the gateway, this may not resolve instantly if:
     * 1. We're currently rate-limited.
     * 2. The shard is not connected to the gateway.
     *
     * @param payload The payload to send.
     * @param important Whether this is an important payload.
     */
    send(payload: GatewaySendPayload, important?: boolean): Promise<void>;

    /**
     * Sends a payload immediately, bypassing any rate-limiting.
     * This is NOT recommended at all, to make sure you don't get rate-limited use {@see IShard#send}
     *
     * @param payload The payload to send.
     */
    sendNow(payload: GatewaySendPayload): Promise<void>;
}

export type ShardEvents = {
    /**
     * Emitted when a dispatch event is received.
     * @param payload The received dispatch payload.
     */
    dispatch: (payload: GatewayDispatchPayload) => void;
    /**
     * Used for debugging the shard.
     * @param message
     */
    debug: (message: string) => void;
    /**
     * Emitted when the shard has become ready.
     */
    ready: (unavailableGuilds: Array<snowflake>) => void;
    close: (code: number, reason: string, clean: boolean) => void;
    state: (current: ShardState, updated: ShardState) => void;
}

export interface DisconnectOptions {
    /**
     * Whether to immediately reconnect.
     * @default false
     */
    reconnect: boolean;
    /**
     * The close code to use.
     * @default 1_000
     */
    code: number;
    /**
     * Whether this is a fatal disconnect.
     * @default false
     */
    fatal: boolean;
}
