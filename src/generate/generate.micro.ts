import {Thespian} from "../Thespian";
import {Colour, ElementaryClass} from "./Eg";
import {assertThat} from "mismatched/dist/src/assertThat";

describe("generate", () => {
    it("generateMocks", () => {
        const fileName = "/Users/rickmugridge/Documents/working/thespian/src/generate/Eg.ts";
        Thespian.generateMocks(fileName, ['Logger'], {ElementaryClass}, {Colour})
    });

    it("generateBuilder", () => {
        const fileName = "/Users/rickmugridge/Documents/working/thespian/src/generate/Eg.ts";
        Thespian.generateBuilder(fileName, ['Logger'], {ElementaryClass}, {Colour})
    });

    it("generateValidator", () => {
        const fileName = "/Users/rickmugridge/Documents/working/thespian/src/generate/Eg.ts";
        Thespian.generateValidator(fileName, ['Logger'], {ElementaryClass}, {Colour})
    });
});