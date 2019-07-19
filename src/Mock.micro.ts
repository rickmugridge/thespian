import {Mockery} from "./Mockery";
import {assertThat} from "./assertThat";

describe("Mock()", () => {
    describe("object", () => {
        it("method called once", () => {
            const mockery = new Mockery();
            const mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            assertThat(mock.object.foo(2, "aaa"), 44);
        });

        it("a method called twice with same arguments and same result", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44)
                .times(2);
            assertThat(mock.object.foo(2, "aaa"), 44);
            assertThat(mock.object.foo(2, "aaa"), 44);
        });

        it("a method called twice with same arguments", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(2, "aaa"), 44);
            assertThat(mock.object.foo(2, "aaa"), 55);
        });

        it("a method called twice with different arguments", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(3, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(3, "aaa"), 55);
            assertThat(mock.object.foo(2, "aaa"), 44);
        });
    });

    describe("object has",()=>{
        // it("??", () => {
        //     const mockery = new Mockery();
        //     const mock = mockery.mock<I>("an object");
        //     mock
        //         .setup(f => f.foo(2, "aaa"))
        //         .returns(() => 44);
        //     assertThat(mock.object.foo(2, "aaa"), 44);
        // });
    });

    describe("function", () => {
        it("function called once", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mockery.describeMocks();
            assertThat(mock.object(2), 33);
            mockery.describeMocks();
        });

        it("function called twice with same arguments and same result", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33)
                .times(2);
            mockery.describeMocks();
            assertThat(mock.object(2), 33);
            mockery.describeMocks();
            assertThat(mock.object(2), 33);
            mockery.describeMocks();
        });

        it("function called twice with same arguments and different result", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mock
                .setup(g => g(2))
                .returns(() => 44);
            assertThat(mock.object(2), 33);
            assertThat(mock.object(2), 44);
        });

        it("function called twice with different arguments", () => {
            let mockery = new Mockery();
            let mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mock
                .setup(g => g(3))
                .returns(() => 44);
            assertThat(mock.object(3), 44);
            assertThat(mock.object(2), 33);
        });
    });
});


interface I {
    foo(i: number, b: string): number
}
