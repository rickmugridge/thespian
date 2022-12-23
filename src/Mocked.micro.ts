import {Mocked} from "./Mocked";
import {assertThat, match} from "mismatched";
import {MockFixture} from "./MockFixture";

describe("Mocked:", () => {
    describe("setUp():", () => {
        it("Expects a lambda", () => {
            const fixture = new MockFixture();
            assertThat(() => fixture.mockUnderTest.setup(4 as any))
                .throwsError("An arrow/function must be provided in setup()");
        });

        it("Is a method", () => {
            const fixture = new MockFixture();
            const {mockUnderTest, mockHandler} = fixture;
            const expected = {
                fullName: "mockName.f", methodName: "f", successfulCalls: [],
                expectedTimesInProgress: {expected: 1, specificity: match.any()},
                expectedTimes: {expected: 1, specificity: match.any()},
                actualTimes: 0,
                expectedArgs: {elementMatchers: [], specificity: match.any()},
                returnFn: match.any()
            };
            mockHandler
                .setup(m => m.addCall(expected as any))
                .returnsVoid();
            assertThat(mockUnderTest.setup(j => j.f())).is(expected as any);
        });

        it("Is a function", () => {
            const fixture = new MockFixture();
            const {mockHandler} = fixture;
            const mockUnderTest = new Mocked<() => number>("mockFnName", [],
                mockHandler.object);
            const expected = {
                fullName: "mockFnName", methodName: "", successfulCalls: [],
                expectedTimesInProgress: {expected: 1, specificity: match.any()},
                expectedTimes: {expected: 1, specificity: match.any()},
                actualTimes: 0,
                expectedArgs: {elementMatchers: [], specificity: match.any()},
                returnFn: match.any()
            };
            mockHandler
                .setup(m => m.addCall(expected as any))
                .returnsVoid();
            assertThat(mockUnderTest.setup(f => f())).is(expected as any);
        });

        it("Is a property", () => {
            const fixture = new MockFixture();
            const {mockUnderTest, mockHandler} = fixture;
            const expected = {
                fullName: "mockName.f", methodName: "f", successfulCalls: [],
                expectedTimesInProgress: {expected: 1, specificity: match.any()},
                expectedTimes: {expected: 1, specificity: match.any()},
                actualTimes: 0, expectedArgs: {elementMatchers: [], specificity: match.any()},
                returnFn: match.any()
            };
            mockHandler
                .setup(m => m.addCall(expected as any))
                .returnsVoid();
            assertThat(mockUnderTest.setup(j => j.f())).is(expected as any);
        });

    });

    it("verify()", () => {
        const fixture = new MockFixture();
        const {mockUnderTest, mockHandler} = fixture;
        mockHandler
            .setup(m => m.verify([0]))
            .returnsVoid();
        mockUnderTest.verify([0]);
        fixture.verify();
    });

    it("describeMocks()", () => {
        const fixture = new MockFixture();
        const {mockUnderTest, mockHandler} = fixture;
        mockHandler
            .setup(m => m.describeMocks())
            .returns(() => ["bla bla"]);
        assertThat(mockUnderTest.describeMocks()).is(["bla bla"]);
        fixture.verify();
    });
});
