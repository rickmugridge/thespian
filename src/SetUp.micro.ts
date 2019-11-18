import {DefinedSetUp, SetUpType} from "./DefinedSetUp";
import {assertThat} from "mismatched";

describe("SetUp:", () => {
    it("is a method", () => {
        assertThat(DefinedSetUp.details((j: any) => j.foo(2))).is({_type: SetUpType.Method, name: "foo"});
    });

    it("is a property", () => {
        assertThat(DefinedSetUp.details((j: any) => j.prop)).is({_type: SetUpType.Property, name: "prop"});
    });

    it("is a function", () => {
        assertThat(DefinedSetUp.details((j: any) => j(2))).is({_type: SetUpType.Function});
    });
});