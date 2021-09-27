export function createArray<T>(length: number, mapper: (index: number) => T): T[] {
    return Array.from({ length }, (_, i) => mapper(i));
}
