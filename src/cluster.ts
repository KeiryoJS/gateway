import type { RestClient } from "@keiryo/rest";

export class Cluster {
    constructor(readonly rest: RestClient) {
    }
}
