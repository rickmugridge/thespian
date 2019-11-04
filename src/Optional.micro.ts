import {Optional} from "./Optional";
import {assertThat} from "mismatched/dist/src/assertThat";

describe("Option()", () => {
    it("Option.none is not isSome", () => {
        assertThat(Optional.none.isSome).is(false);
    });

    it("Optional.some() is isSome", () => {
        assertThat(Optional.some(4).isSome).is(true);
    });

    it("map of Optional.none is still Optional.none", () => {
        assertThat(Optional.none.map(() => "a").isSome).is(false);
    });

    it("map of Optional.some() is a new Optional.some()", () => {
        const result = Optional.some(1).map(() => "a");
        assertThat(result.isSome).is(true);
        assertThat(result.some).is("a");
    });
});