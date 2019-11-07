import {MockHandler} from "./MockHandler";
import {MockedCall, SuccessfulCall} from "./MockedCall";
import {assertThat} from "mismatched/dist/src/assertThat";
import {match} from "mismatched/dist/src/match";

describe('MockHandler()', () => {
    it("Call on an unknown method", () => {
        const handler = new MockHandler();
        assertThat(() =>
            handler.get(undefined, "method", undefined)).throws(match.any());
    });

    describe('method:', () => {
        it("Call known method with a single MockedCall, with undefined result", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("thespian.method", "method",
                [match.any()], successfulCalls)
                .returns(a => a);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(5)).is(5);
        });

        it("Call known method with a single MockedCall, with specified result", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("thespian.method", "method",
                [1], successfulCalls);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1)).is(456);
        });

        it("Call known method with a single MockedCall, but doesn't match", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("thespian.method", "method",
                [1], successfulCalls);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(() => fn(2)).throws(match.any());
        });

        it("Call known method with a 2 MockedCall2, with one matching", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const handler = new MockHandler();
            const mockedCall1 = new MockedCall<any>("thespian.method", "method",
                [1, 2], successfulCalls);
            mockedCall1.returns(() => 456);
            handler.add(mockedCall1);
            const mockedCall2 = new MockedCall<any>("thespian.method", "method",
                [2, 3],
                successfulCalls);
            mockedCall2.returns(() => 789);
            handler.add(mockedCall2);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1, 2)).is(456);
            assertThat(fn(2, 3)).is(789);
        });
    });

    describe('function:', () => {
        it("Call known function with a single MockedCall, with undefined result", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("thespian", "", [1],
                successfulCalls)
                .returns(() => 5);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "", undefined);
            assertThat(fn(1)).is(5);
        });

        it("Call known function with a single MockedCall, with specified result", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("thespian", "", [1],
                successfulCalls);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "", undefined);
            assertThat(fn(1)).is(456);
        });
    });
});