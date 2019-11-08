import {Thespian} from "./Thespian";
import {assertThat} from "mismatched";

describe("Thespian By Example", () => {
    interface Tell {
        tellAll(user: string, count: number): number
    }

    it("Simply mock a method of an interface", () => {
        const thespian = new Thespian();
        const mock = thespian.mock<Tell>("aTell");
        mock
            .setup(f => f.tellAll("elisa", 2))
            .returns(() => 44);
        const mocked = mock.object;
        assertThat(mocked.tellAll("elisa", 2)).is(44);
        thespian.verify();
    });

    it("We can call a mocked method several times", () => {
        const thespian = new Thespian();
        const mock = thespian.mock<Tell>("aTell");
        mock
            .setup(f => f.tellAll("elisa", 2))
            .returns(() => 44)
            .times(2);
        const mocked = mock.object;
        assertThat(mocked.tellAll("elisa", 2)).is(44);
        assertThat(mocked.tellAll("elisa", 2)).is(44);
        thespian.verify();
    });

});