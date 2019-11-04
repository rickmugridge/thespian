import {Thespian} from "./Thespian";
import {assertThat} from "./assertThat";

describe("Mock()", () => {
    describe("object", () => {
        it("method called once", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            assertThat(mock.object.foo(2, "aaa")).is(44);
        });

        it("a method called twice with same arguments and same result", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44)
                .times(2);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(mock.object.foo(2, "aaa")).is(44);
        });

        it("a method called twice with same arguments", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(mock.object.foo(2, "aaa")).is(55);
        });

        it("a method called twice with different arguments", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(3, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(3, "aaa")).is(55);
            assertThat(mock.object.foo(2, "aaa")).is(44);
        });
    });

    describe("property in object: has",()=>{
        it("has", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            assertThat("foo" in mock.object).is(true);
        });
    });

    describe("function", () => {
        it("function called once", () => {
            let mockery = new Thespian();
            let mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mockery.describeMocks();
            assertThat(mock.object(2)).is(33);
            mockery.describeMocks();
        });

        it("function called twice with same arguments and same result", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33)
                .times(2);
            mockery.describeMocks();
            assertThat(mock.object(2)).is(33);
            mockery.describeMocks();
            assertThat(mock.object(2)).is(33);
            mockery.describeMocks();
        });

        it("function called twice with same arguments and different result", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mock
                .setup(g => g(2))
                .returns(() => 44);
            assertThat(mock.object(2)).is(33);
            assertThat(mock.object(2)).is(44);
        });

        it("function called twice with different arguments", () => {
            const mockery = new Thespian();
            const mock = mockery.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mock
                .setup(g => g(3))
                .returns(() => 44);
            assertThat(mock.object(3)).is(44);
            assertThat(mock.object(2)).is(33);
        });
    });
});


interface I {
    foo(i: number, b: string): number
}
