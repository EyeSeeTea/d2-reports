export class InmemoryCache {
    private cache: Record<string, unknown> = {};

    getKeys(): string[] {
        return Object.keys(this.cache);
    }

    get<T>(cacheKey: string): T {
        return this.cache[cacheKey] as T;
    }

    getOrPromise<T>(cacheKey: string, promise: () => Promise<T>): Promise<T> {
        if (this.cache[cacheKey]) {
            const data = this.cache[cacheKey] as T;
            return Promise.resolve(data);
        } else {
            return promise().then(response => {
                this.cache[cacheKey] = response;

                return response;
            });
        }
    }

    clear(): void {
        this.cache = {};
    }
}
