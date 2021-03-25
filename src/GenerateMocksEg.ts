import {Mocked} from "./Mocked";
import {MockFixture} from "./MockFixture";
import {MockHandler} from "./MockHandler";

export class GenerateMocksEg {
    constructor(private mocked: Mocked<MockHandler>, mocked2: Mocked<string>, s: string, no: number, obj: object, a: any,
                nums: number[], flags: boolean[], tuple: [number, string],
                union: string | number, intersection: number & string,
                fn: (a: number, b: boolean) => string,
                sym: Symbol, date: Date) {
    }

    foo(a: MockFixture) {

    }
}