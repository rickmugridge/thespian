import {MockHandler} from "./MockHandler";
import {MockedCall} from "./MockedCall";
import {assertThat, expectThrow} from "./assertThat";

describe('MockHandler()', () => {
    it("Call on an unknown method", () => {
        const handler = new MockHandler();
        expectThrow(() =>
            handler.get(undefined, "method", undefined));
    });

    describe('method:', () => {
        it("Call known method with a single MockedCall, with undefined result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("method", [1]);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1), undefined);
        });

        it("Call known method with a single MockedCall, with specified result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("method", [1]);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1), 456);
        });

        it("Call known method with a single MockedCall, but doesn't match", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("method", [1]);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "method", undefined);
            expectThrow(() => fn(2));
        });

        it("Call known method with a 2 MockedCall2, with one matching", () => {
            const handler = new MockHandler();
            const mockedCall1 = new MockedCall<any>("method", [1, 2]);
            mockedCall1.returns(() => 456);
            handler.add(mockedCall1);
            const mockedCall2 = new MockedCall<any>("method", [2, 3]);
            mockedCall2.returns(() => 789);
            handler.add(mockedCall2);
            const fn = handler.get(undefined, "method", undefined);
            assertThat(fn(1, 2), 456);
            assertThat(fn(2, 3), 789);
        });
    });

    describe('function:', () => {
        it("Call known function with a single MockedCall, with undefined result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("", [1]);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "", undefined);
            assertThat(fn(1), undefined);
        });

        it("Call known function with a single MockedCall, with specified result", () => {
            const handler = new MockHandler();
            const mockedCall = new MockedCall<any>("", [1]);
            mockedCall.returns(() => 456);
            handler.add(mockedCall);
            const fn = handler.get(undefined, "", undefined);
            assertThat(fn(1), 456);
        });
    });

});