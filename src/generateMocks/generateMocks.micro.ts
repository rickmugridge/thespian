import {Thespian} from "../Thespian";
import {Colour, ElementaryClass} from "./Eg";

describe("generateMocks", () => {
    it("works", () => {
        const fileName = "/Users/rickmugridge/Documents/working/thespian/src/generateMocks/Eg.ts";
        Thespian.generateMocks(fileName, ['Logger'], {ElementaryClass}, {Colour})
    });
});