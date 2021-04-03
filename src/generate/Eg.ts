import {Mocked} from "../Mocked";
import {MockFixture} from "../MockFixture";
import {MockHandler} from "../MockHandler";

export interface Logger<T> {
    ttt: T
    i: number
    color: Colour
    date: Date
    buffer: ArrayBuffer
    flags: boolean[]
    tuple: [number, string]
    eg: Eg<string>
    genericIdentifier: Mocked<MockHandler>
    union: string | number
    intersection: number & string
    fun: (a: number) => string
    gun: (a: number) => number

    info(s: T): void

    error(s: string): void
}

export const fun2 = (a: Symbol) => a

export class Eg<T> {
    constructor(s: string, no: number, obj: object, a: any,
                nums: number[], flags: boolean[],
                arr: Array<number>, tuple: [number, string],
                identifier: MockHandler, genericIdentifier: Mocked<MockHandler>,
                genericIdentifier2: Mocked<string>,
                union: string | number, intersection: number & string,
                fn: (a: number, b: boolean) => Mocked<MockHandler>,
                sym: Symbol, date: Date, prom: Promise<string>,
                elementary: ElementaryClass, colour: Colour, logger: Logger<T>) {
    }

    foo(a: MockFixture) {

    }
}

export const pi = 3.14

export const fun = (a: string, b: MockHandler) => a

function foo(b: number): number {
    return 5
}

export enum Colour {
    red = 'red',
    green = 'green'
}

export class ElementaryClass {
    constructor(s: string) {
    }
}