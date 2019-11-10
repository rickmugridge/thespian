import {Thespian} from "./Thespian";
import {assertThat, match} from "mismatched";

describe("Thespian By Example", () => {

    it("We can call a mocked method several times", () => {
        interface Tell {
            tellAll(user: string, count: number): number;
        }

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

    it("Sophisticated matching of mock arguments", () => {
        interface Matched {
            matchId: number;
            matches: Array<{
                match_type: string,
                links: Array<string>
            }>;
        }

        interface Check {
            match(match: Matched): number;
        }

        const thespian = new Thespian();
        const mockCheck = thespian.mock<Check>("check");
        mockCheck
            .setup(f => f.match({
                matchId: 0,
                matches: [{
                    match_type: match.string.startsWith("full"),
                    links: match.array.length(1)
                }]
            }))
            .returns(() => Math.random());
        const check = mockCheck.object;
        assertThat(check.match({
            matchId: 0,
            matches: [{
                match_type: "full-match",
                links: ["REL"]
            }]
        })).is(match.ofType.number());
        thespian.verify();
    });

    it("mocking a function", () => {
        let thespian = new Thespian();
        let mockFn = thespian.mock<(i: number) => number>("fn");
        mockFn
            .setup(g => g(2))
            .returns(() => 33);
        thespian.describeMocks();
        assertThat(mockFn.object(2)).is(33);
        thespian.describeMocks();
        thespian.verify();
    });
});