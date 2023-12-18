import {assertThat} from "mismatched";
import {MockedProperty} from "./MockedProperty";
import {UnsuccessfulAccess} from "./UnsuccessfulAccess";
import {SuccessfulCall} from "./SuccessfulCall";

const unsuccessfulAccess = (expectedTimes: any, actualTimes: number) =>
    UnsuccessfulAccess.make("thespian.m", expectedTimes, actualTimes);

describe("MockedProperty", () => {
    describe("setup:", () => {
        it("initially", () => {
            const mockedProperty = new MockedProperty("thespian.m", "m", []);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(1, 0));
        });

        it("After returns()", () => {
            const mockedProperty = new MockedProperty("thespian.m", "m", [])
                .returns(() => 3);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(1, 0));
        });

        it("After times()", () => {
            const mockedProperty = new MockedProperty("thespian.m", "m", [])
                .times(5);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(5, 0));
        });

        it("After timesAtMost()", () => {
            const mockedProperty = new MockedProperty("thespian.m", "m", [])
                .timesAtMost(5);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess({"number.lessEqual": 5}, 0));
        });

        it("Multiple arguments with timesAtLeast(2)", () => {
            const mockedProperty = new MockedProperty("thespian.m", "m", [])
                .timesAtLeast(2);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess({"number.greaterEqual": 2}, 0));
        });
    });

    describe("access", () => {
        const successfulAccess: any = (returnValue: any, expectedTimes: any = 1) =>
            SuccessfulCall.ofProperty("thespian.m", returnValue, expectedTimes);

        it("Succeeds on call", () => {
            const successfulCalls: SuccessfulCall[] = [];
            const mockedProperty = new MockedProperty("thespian.m", "m", successfulCalls)
                .returns(() => 33);
            assertThat(mockedProperty.access()).is({result: 33});
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(33, 1)
            ]);
        });

        it("Succeeds on call but not on second call", () => {
            const successfulCalls: SuccessfulCall[] = [];
            const mockedProperty = new MockedProperty("thespian.m", "m", successfulCalls)
                .returns(() => 33);
            assertThat(mockedProperty.access()).is({result: 33});
            assertThat(mockedProperty.access().failed).isNot(undefined);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(33, 1)
            ]);
        });

        it("Succeeds on throwing an exception via returns()", () => {
            const successfulCalls: SuccessfulCall[] = [];
            let error = new Error("error");
            const mockedProperty = new MockedProperty("thespian.m", "m", successfulCalls)
                .returns(() => {
                    throw error
                });
            assertThat(() => mockedProperty.access()).throwsError("error");
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(error, 1)
            ]);
        });

        it("Succeeds on throwing an exception via throws()", () => {
            const successfulCalls: SuccessfulCall[] = [];
            let error = new Error("error");
            const mockedProperty = new MockedProperty("thespian.m", "m", successfulCalls)
                .throws(error);
            assertThat(() => mockedProperty.access()).throwsError("error");
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(error, 1)
            ]);
        });

        it("Fails as not expected to be called", () => {
            const successfulCalls: SuccessfulCall[] = [];
            const mockedProperty = new MockedProperty("thespian.m", "m", successfulCalls)
                .returns(() => 33)
                .times(0);
            assertThat(mockedProperty.access().failed).isNot(undefined);
            assertThat(mockedProperty.describe()).is(unsuccessfulAccess(0, 0));
            assertThat(successfulCalls).is([
            ]);
        });

    });
});