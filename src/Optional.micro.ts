import {expect} from "./Mock.micro";
import {Optional} from "./Optional";

describe("Option()", () => {
    it("Option.none is not isSome", () => {
        expect(Optional.none.isSome, false);
    });

    it("Optional.some() is isSome", () => {
        expect(Optional.some(4).isSome, true);
    });

    it("map of Optional.none is still Optional.none", () => {
        expect(Optional.none.map(() => "a").isSome, false);
    });

    it("map of Optional.some() is a new Optional.some()", () => {
        const result = Optional.some(1).map(() => "a");
        expect(result.isSome, true);
        expect(result.some, "a");
    });
});