// TODO: clean up shard states

export enum ShardState {
    Idle,
    Ready,
    Disconnecting,
    Disconnected,
    Reconnecting,
    Connecting,
    Resuming,
    Identifying,
    Destroyed
}
