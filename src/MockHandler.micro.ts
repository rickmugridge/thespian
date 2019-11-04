import {MockHandler} from "./MockHandler";
import {MockedCall} from "./MockedCall";
import {assertThat} from "mismatched/dist/src/assertThat";
import {match} from "mismatched/dist/src/match";
import {matchMaker} from "mismatched/dist/src/matcher/matchMaker";

describe('MockHandler()', () => {
    const one = matchMaker(1);

    it("Call on an unknown method", () => {
        const handler = new MockHandler();
        assertThat(() =>
            handler.get(undefined, "method", undefined)).throws(match.any());
    });

    describe('method:', () => {
        it("Call known method with a single MockedCall, with undefined result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("method", [one]);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1)).is(undefined);
        });

        it("Call known method with a single MockedCall, with specified result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("method", [one]);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1)).is(456);
        });

        it("Call known method with a single MockedCall, but doesn't match", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("method", [one]);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(() => fn(2)).throws(match.any());
        });

        it("Call known method with a 2 MockedCall2, with one matching", () => {
            const two = matchMaker(2);
            const three = matchMaker(3);

            const handler = new MockHandler();
            const mockedCall1 = new MockedCall<any>("method", [one, two]);
            mockedCall1.returns(() => 456);
            handler.add(mockedCall1);
            const mockedCall2 = new MockedCall<any>("method", [two, three]);
            mockedCall2.returns(() => 789);
            handler.add(mockedCall2);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1, 2)).is(456);
            assertThat(fn(2, 3)).is(789);
        });
    });

    describe('function:', () => {
        it("Call known function with a single MockedCall, with undefined result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("", [one]);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "", undefined);
            assertThat(fn(1)).is(undefined);
        });

        it("Call known function with a single MockedCall, with specified result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("", [one]);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "", undefined);
            assertThat(fn(1)).is(456);
        });
    });
});