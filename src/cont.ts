
export default class Cont<T> {
    constructor(readonly run: (callback: (value: T) => void) => void) { }
    map<U>(f: (value: T) => U): Cont<U> {
        return new Cont(callback => this.run((value: T) => callback(f(value))))
    }
    then<U>(f: (value: T) => Cont<U>): Cont<U> {
        return new Cont(callback => this.run((value: T) => f(value).run(callback)))
    }
}

export function ofHTMLElementEvent<K extends keyof HTMLElementEventMap>(elm: HTMLElement, type: K): Cont<HTMLElementEventMap[K]> {
    return new Cont((callback) => {
        const listener = (e: HTMLElementEventMap[K]) => {
            elm.removeEventListener(type, listener);
            callback(e);
        };
        elm.addEventListener(type, listener);
    });
}
