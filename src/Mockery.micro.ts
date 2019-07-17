import {Mockery} from "./Mockery";

describe("Mockery()", () => {
    describe("Mock()", () => {
        it("runs", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<I>("hello");
            expect(mock.name, "hello");
            expect(mock.object.foo, 556);
            expect(mock.object.goo, 22);
            expect(mock.object.f(0), 333);
            expect(mock.object.f(10), 343);

            mock.setup("g", () => 10);
            expect(mock.object.g(), 10);

            mock.setup("h", (a, b) => a + b);
            expect(mock.object.h(10, 5), 15);
        });

        it("gathering method name", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<I>("a method");
            mock.setup2(f => f.foooo(2, "aaa"))
        });

        it("gathering function name", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup2(g => g(2))
                .returns(() => 3)
                .times(2);
        });
    });
});


export function expect(actual: any, expected: any) {
    if (actual != expected) {
        throw new Error(`actual was ${actual} but expected ${expected}`);
    }
}

interface I {
    foooo(i: number, b: string): number
}
