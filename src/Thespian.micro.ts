import {Thespian} from "./Thespian";
import {assertThat, match} from "mismatched";

describe("Thespian()", () => {
    describe("object", () => {
        it("method called once", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, match.ofType.string()))
                .returns(() => 44);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            thespian.verify();
        });

        it("a method called twice with same arguments and same result", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44)
                .times(2);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            thespian.verify();
        });

        it("a method called twice with same arguments", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(mock.object.foo(2, "aaa")).is(55);
            thespian.verify();
        });

        it("a method called twice with different arguments", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(3, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(3, "aaa")).is(55);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            thespian.verify();
        });
    });

    describe("property in object: has", () => {
        //     it("has", () => { //todo what was this for???
        //         const thespian = new Thespian();
        //         const mock = thespian.mock<I>("tulip");
        //         mock
        //             .setup(tulip => tulip.foo(2, "aaa"))
        //             .returns(() => 44);
        //         assertThat("foo" in mock.object).is(true);
        //         thespian.verify();
        //     });
    });

    describe("function", () => {
        it("function called once", () => {
            let thespian = new Thespian();
            let mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            thespian.describeMocks();
            assertThat(mock.object(2)).is(33);
            thespian.describeMocks();
            thespian.verify();
        });

        it("function called twice with same arguments and same result", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33)
                .times(2);
            thespian.describeMocks();
            assertThat(mock.object(2)).is(33);
            thespian.describeMocks();
            assertThat(mock.object(2)).is(33);
            thespian.describeMocks();
            thespian.verify();
        });

        it("function called twice with same arguments and different result", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mock
                .setup(g => g(2))
                .returns(() => 44);
            assertThat(mock.object(2)).is(33);
            assertThat(mock.object(2)).is(44);
            thespian.verify();
        });

        it("function called twice with different arguments", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            mock
                .setup(g => g(3))
                .returns(() => 44);
            assertThat(mock.object(3)).is(44);
            assertThat(mock.object(2)).is(33);
            thespian.verify();
        });
    });
});

interface I {
    foo(i: number, b: string): number
}
