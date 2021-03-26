import {Mocked} from "../Mocked";
import {MockFixture} from "../MockFixture";
import {MockHandler} from "../MockHandler";

export class Eg {
    constructor(s: string, no: number, obj: object, a: any,
                nums: number[], flags: boolean[], tuple: [number, string],
                identifier: MockHandler, genericIdentifier: Mocked<MockHandler>, genericIdentifier2: Mocked<string>,
                union: string | number, intersection: number & string,
                fn: (a: number, b: boolean) => string,
                sym: Symbol, date: Date) {
    }

    foo(a: MockFixture) {

    }
}

export const pi = 3.14

export const fun = (a: string, b: MockHandler) => a

function foo(b: number): number {
    return 5
}