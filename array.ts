declare global {
	interface Array<T> {
		remove(item: T): void;
	}
}

Array.prototype.remove = function <T>(this: T[], item: T | T[]): void {
	if (Array.isArray(item)) {
		for (const i of item) {
			this.remove(i);
		}
		return;
	}

	const index = this.indexOf(item);
	if (index !== -1) this.splice(index, 1);
};
