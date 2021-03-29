import {Mocked} from "../Mocked";
import {MockFixture} from "../MockFixture";
import {MockHandler} from "../MockHandler";

export const fun2 = (a: Symbol) => a

export class Eg {
    constructor(s: string, no: number, obj: object, a: any,
                nums: number[], flags: boolean[],
                arr: Array<number>, tuple: [number, string],
                identifier: MockHandler, genericIdentifier: Mocked<MockHandler>,
                genericIdentifier2: Mocked<string>,
                union: string | number, intersection: number & string,
                fn: (a: number, b: boolean) => Mocked<MockHandler>,
                sym: Symbol, date: Date, prom: Promise<string>,
                elementary: ElementaryClass, colour: Colour, logger: Logger) {
    }

    foo(a: MockFixture) {

    }
}

interface Logger {}

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