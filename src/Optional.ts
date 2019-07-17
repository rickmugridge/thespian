export class Optional<T> {
    constructor(public isSome: boolean, public some?: T) {
    }

    map<U>(f: (t: T) => U) {
        if (this.isSome) {
            return Optional.some<U>(f(this.some as T));
        }
        return this;
    }

    static none = new Optional(false);

    static some<T>(value: T) {
        return new Optional(true, value);
    }
}