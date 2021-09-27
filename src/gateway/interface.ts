import type { TypedEmitter } from "tiny-typed-emitter";
import type { RESTGetAPIGatewayBotResult } from "discord-api-types";

export interface IGateway extends TypedEmitter<GatewayEvents> {
    /**
     * The session manager.
     */
    readonly sessions: ISessionManager;

    /**
     * Setup this gateway, usually called right after instantiation.
     * @returns {Promise<void>}
     */
    setup(): Promise<void>;

    /**
     * Queues an OP 2 Identify payload.
     *
     * @param shard The shard id which is identifying.
     * @param callback The callback
     */
    queueIdentify(shard: number, callback: () => Promise<void>): Promise<void>;

    /**
     * Gets the /gateway/bot information.
     *
     * @returns {Promise<RESTGetAPIGatewayBotResult>}
     */
    get(): Promise<RESTGetAPIGatewayBotResult>;
}

export interface ISessionManager {
    /**
     * Get a shard's session.
     * @param shard The shard id.
     */
    get(shard: number): Promise<Session>;

    /**
     * Update a shard's session.
     * @param shard The shard to update.
     * @param session The session data.
     */
    update(shard: number, session: Session): Promise<void>;
}

export type MaxConcurrency = 1 | 16 | 32 | 64;

export type GatewayEvents = {
    debug: (message: string) => void;
    warn: (message: string) => void;
}

export interface Session {
    /**
     * The ID for this session.
     */
    id?: string;
    /**
     * The last received sequence, used for resuming.
     */
    sequence: number;
}
