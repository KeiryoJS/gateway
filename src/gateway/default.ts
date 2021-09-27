import type { GatewayEvents, IGateway, ISessionManager, MaxConcurrency, Session } from "./interface";
import { AsyncLimiter, Collection } from "@keiryo/common";
import type { RestClient } from "@keiryo/rest";
import type { RESTGetAPIGatewayBotResult } from "discord-api-types";
import { TypedEmitter } from "tiny-typed-emitter";

export class Gateway extends TypedEmitter<GatewayEvents> implements IGateway {
    readonly sessions: ISessionManager;

    private buckets: Collection<number, AsyncLimiter>;
    private maxConcurrency?: MaxConcurrency;

    constructor(readonly rest: RestClient) {
        super();

        this.sessions = new SessionManager();
        this.buckets = new Collection();
    }

    async setup(): Promise<void> {
        await this.get();
        for (let bucket = 0; bucket < this.maxConcurrency!; bucket++) {
            const limiter = new AsyncLimiter(1, 5000, true);
            this.buckets.set(bucket, limiter);
        }
    }

    async queueIdentify(shard: number, callback: () => Promise<void>): Promise<void> {
        if (!this.maxConcurrency) {
            throw new Error("This gateway instance has not been set up yet. Please call Gateway#setup before identifying.");
        }

        let bucket = this.buckets.get(shard % this.maxConcurrency);
        if (!bucket) {
            this.emit("warn", `Creating rate-limit bucket for unknown key: ${shard % this.maxConcurrency}.`);
            bucket = new AsyncLimiter(1, 5000, true);
            this.buckets.set(shard % this.maxConcurrency, bucket);
        }

        await bucket.consume(callback);
    }

    async get(): Promise<RESTGetAPIGatewayBotResult> {
        const result = await this.rest.get<RESTGetAPIGatewayBotResult>("/gateway/bot");
        this.maxConcurrency = result!.session_start_limit.max_concurrency as MaxConcurrency;
        return result!;
    }
}

export class SessionManager implements ISessionManager {
    private _sessions = new Collection<number, Session>();

    async get(shard: number): Promise<Session> {
        return this._sessions.get(shard) ?? { sequence: -1 };
    }

    async update(shard: number, session: Session): Promise<void> {
        const current = await this.get(shard);
        this._sessions.set(shard, { ...current, ...session });
    }
}
