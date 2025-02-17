interface CachedData<T> {
	data: T
	timestamp: number
}

export class LocalStorageCache {
	private static TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

	static getKey(prefix: string, id: string | number): string {
		return `${prefix}_${id}`
	}

	static set<T>(key: string, data: T): void {
		try {
			const cachedData: CachedData<T> = {
				data,
				timestamp: Date.now(),
			}
			localStorage.setItem(key, JSON.stringify(cachedData))
		} catch (error) {
			console.warn('Failed to cache data in localStorage:', error)
		}
	}

	static get<T>(key: string): T | null {
		try {
			const item = localStorage.getItem(key)
			if (!item) return null

			const cachedData: CachedData<T> = JSON.parse(item)
			const isExpired = Date.now() - cachedData.timestamp > this.TTL

			if (isExpired) {
				localStorage.removeItem(key)
				return null
			}

			return cachedData.data
		} catch (error) {
			console.warn('Failed to retrieve cached data from localStorage:', error)
			return null
		}
	}

	static remove(key: string): void {
		try {
			localStorage.removeItem(key)
		} catch (error) {
			console.warn('Failed to remove cached data from localStorage:', error)
		}
	}
}
