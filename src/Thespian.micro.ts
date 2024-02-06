import {Thespian} from "./Thespian";
import {assertThat, match, MatchResult, PrettyPrinter} from "mismatched";

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

        it("method called once throws an Error exception (using returns())", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, match.ofType.string()))
                .returns(() => {
                    throw new Error("failed")
                });
            assertThat(() => mock.object.foo(2, "aaa")).throwsError("failed");
            thespian.verify();
        });

        it("method called once throws an Error exception", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, match.ofType.string()))
                .throws(new Error("failed"));
            assertThat(() => mock.object.foo(2, "aaa")).throwsError("failed");
            thespian.verify();
        });

        it("method called once throws a non-Error exception", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, match.ofType.string()))
                .throws("failed");
            assertThat(() => mock.object.foo(2, "aaa")).throws("failed");
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

        it("a method called twice with same arguments and same result (timesAtLeast)", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44)
                .timesAtLeast(1);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            thespian.verify();
        });

        it("a method called twice with same arguments and same result (timesAtMost)", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("an object");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44)
                .timesAtMost(2);
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

        it("method called with no mock set up for it", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            assertThat(() => mock.object.foo(2, "aaa")).throwsError(`{
  problem: "Unable to handle call or access property, as it has not been mocked", 
  mockCall: anObject.foo()
}`);
            thespian.verify();
        });

        it("method called but arguments do not match", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.foo(2, match.ofType.string()))
                .returns(() => 44);
            assertThat(() => mock.object.foo(4, "aaa")).throwsError(`{
  problem: "Unable to handle call, as none match", 
  mockCall: anObject.foo(4, "aaa"), 
  nearMisses: [
    {
      call: 
      anObject.foo({${MatchResult.unexpected}: 4}, {${MatchResult.expected}: 2}, "aaa"), 
      expectedTimes: 1, actualTimes: 0
    }
  ]
}`);
            // thespian.verify(); Don't verify
        });

        it("method called but arguments are not the same length", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.goo(1, 2, 3))
                .returns(() => 44);
            assertThat(() => (mock.object as any).goo(1, 2)).throwsError(`{
  problem: "Unable to handle call, as none match", mockCall: anObject.goo(1, 2), 
  nearMisses: [
    {
      call: anObject.goo(1, 2, {${MatchResult.expected}: 3}), expectedTimes: 1, 
      actualTimes: 0
    }
  ]
}`);
            // thespian.verify(); Don't verify
        });

        it("a method called a second time, exceeding expected times", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(() => mock.object.foo(2, "aaa")).throwsError(`{
  problem: "Unable to handle call, as it's called too many times", 
  mockCall: anObject.foo(2, "aaa"), 
  previousSuccessfulCalls: [
    {call: anObject.foo(2, "aaa"), returnValue: 44, expectedTimes: 1}
  ]
}`);
            thespian.verify();
        });

        it("a method call both exceeds expected time and partially matches another mock call", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(3, "aaa"))
                .returns(() => 55);
            assertThat(mock.object.foo(2, "aaa")).is(44);
            assertThat(() => mock.object.foo(2, "aaa")).throwsError(`{
  problem: "Unable to handle call, as none match or it's called too many times", 
  mockCall: anObject.foo(2, "aaa"), 
  nearMisses: [
    {call: anObject.foo(2, "aaa"), expectedTimes: 1, actualTimes: 2}, 
    {
      call: 
      anObject.foo({${MatchResult.unexpected}: 2}, {${MatchResult.expected}: 3}, "aaa"), 
      expectedTimes: 1, actualTimes: 0
    }
  ], 
  previousSuccessfulCalls: [
    {call: anObject.foo(2, "aaa"), returnValue: 44, expectedTimes: 1}
  ]
}`);
            // thespian.verify(); Can't verify as we're testing messages from the failure
        });

        it("a method call partially matches two separate mock calls", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.foo(2, "aaa"))
                .returns(() => 44);
            mock
                .setup(f => f.foo(3, "bbb"))
                .returns(() => 55);
            assertThat(() => mock.object.foo(3, "aaa")).throwsError(`{
  problem: "Unable to handle call, as none match", 
  mockCall: anObject.foo(3, "aaa"), 
  nearMisses: [
    {
      call: 
      anObject.foo({${MatchResult.unexpected}: 3}, {${MatchResult.expected}: 2}, "aaa"), 
      expectedTimes: 1, actualTimes: 0
    }, 
    {
      call: 
      anObject.foo(3, {${MatchResult.unexpected}: "aaa"}, {${MatchResult.expected}: "bbb"}), 
      expectedTimes: 1, actualTimes: 0
    }
  ]
}`);
            // thespian.verify(); Can't verify as we're testing messages from the failure
        });

        it("Mocks are displayed correctly when in mismatched argument list", () => {
            const thespian = new Thespian();
            const mockI = thespian.mock<I>("i");
            mockI
                .setup(g => g.foo(2, "a"))
                .returns(() => 33);
            const i = mockI.object;
            const message = match.string.includes('mockCall: i.foo({mock: "i"}, "a")')
            assertThat(() => i.foo(i as any, "a")).throwsError(message)
            // thespian.verify(); Can't verify as we're testing messages from the failure
        });

        it("Can test a mock against itself", () => {
            const thespian = new Thespian();
            const mockI = thespian.mock<I>("i");
            mockI
                .setup(g => g.foo(2, "a"))
                .returns(() => 33);
            const i = mockI.object;

            assertThat(i).is(i)
            assertThat(0).isNot(i as any)
            assertThat(i).isNot(0 as any)
            // thespian.verify(); Can't verify as we're testing messages from the failure
        });
    });

    describe("function", () => {
        it("function called once", () => {
            let thespian = new Thespian();
            let mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33);
            assertThat(mock.object(2)).is(33);
            thespian.verify();
        });

        it("function called once that throws an Error exception", () => {
            let thespian = new Thespian();
            let mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .throws(new Error("failed"));
            assertThat(() => mock.object(2)).throwsError("failed");
            thespian.verify();
        });

        it("function called once that throws an Error exception (via returns())", () => {
            let thespian = new Thespian();
            let mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => {
                    throw new Error("failed")
                });
            assertThat(() => mock.object(2)).throwsError("failed");
            thespian.verify();
        });

        it("function called once that throws a non-Error exception", () => {
            let thespian = new Thespian();
            let mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .throws("failed");
            assertThat(() => mock.object(2)).throws("failed");
            thespian.verify();
        });

        it("function called twice with same arguments and same result", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33)
                .times(2);
            assertThat(mock.object(2)).is(33);
            assertThat(mock.object(2)).is(33);
            thespian.verify();
        });

        it("function called twice with same arguments and same result (timesAtLeast)", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33)
                .timesAtLeast(2);
            assertThat(mock.object(2)).is(33);
            assertThat(mock.object(2)).is(33);
            thespian.verify();
        });

        it("function called twice with same arguments and same result (timesAtMost)", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<(i: number) => number>("fn");
            mock
                .setup(g => g(2))
                .returns(() => 33)
                .timesAtMost(2);
            assertThat(mock.object(2)).is(33);
            assertThat(mock.object(2)).is(33);
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

    describe("property", () => {
        it("property accessed once", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .returns(() => 44);
            assertThat(mock.object.prop).is(44);
            thespian.verify();
        });

        it("property access results in exception", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .throws(new Error("failed"));
            assertThat(() => mock.object.prop).throwsError("failed");
            thespian.verify();
        });

        it("property access results in exception (via returns)", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .returns(() => {
                    throw new Error("failed")
                });
            assertThat(() => mock.object.prop).throwsError("failed");
            thespian.verify();
        });

        it("property accessed twice", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .returns(() => 44)
                .times(2);
            assertThat(mock.object.prop).is(44);
            assertThat(mock.object.prop).is(44);
            thespian.verify();
        });

        it("property set up and accessed twice", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .returns(() => 44);
            mock
                .setup(f => f.prop)
                .returns(() => 55);
            assertThat(mock.object.prop).is(44);
            assertThat(mock.object.prop).is(55);
            thespian.verify();
        });

        it("property missing", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            assertThat(() => mock.object.prop).throwsError(`{
  problem: "Unable to handle call or access property, as it has not been mocked", 
  mockCall: anObject.prop()
}`);
            // thespian.verify();
        });

        it("property unexpectedly accessed twice", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .returns(() => 44);
            assertThat(mock.object.prop).is(44);
            assertThat(() => mock.object.prop).throwsError(`{
  problem: "Unable to access", property: anObject.prop, 
  tooOften: [{property: anObject.prop, expectedTimes: 1, actualTimes: 2}]
}`);
            // thespian.verify();
        });
    });
});

interface I {
    prop: number;

    foo(i: number, b: string): number

    goo(i: number, j: number, k: number): number
}

interface J {
    ga(i: I): I
}
