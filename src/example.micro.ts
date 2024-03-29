import {Thespian} from "./Thespian";
import {assertThat, match} from "mismatched";

describe("Thespian By Example", () => {
    let thespian: Thespian;

    beforeEach(() => {
        thespian = new Thespian();
    })
    afterEach(() => thespian.verify());

    it("We can call a mocked method several times", () => {
        interface Tell {
            tellAll(user: string, count: number): number;
        }

        const mock = thespian.mock<Tell>("aTell");
        mock
            .setup(f => f.tellAll("elisa", 2))
            .returns(() => 44)
            .times(2);
        const mocked = mock.object;
        assertThat(mocked.tellAll("elisa", 2)).is(44);
        assertThat(mocked.tellAll("elisa", 2)).is(44);
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
    });

    it("mocking a function", () => {
        const mockFn = thespian.mock<(i: number) => number>("fn");
        mockFn
            .setup(g => g(2))
            .returns(() => 33);
        thespian.describeMocks();
        assertThat(mockFn.object(2)).is(33);
        thespian.describeMocks();
    });

    xit("eg22", () => {
        const fun = (g: (a: number) => number, h: (b: number) => number, a: number): number => {
            try {
                return g(h(a))
            } catch (e) {
                return 0;
            }
        }

        const mockG = thespian.mock<(a: number) => number>("g");
        mockG.setup(g => g(12)).returns(() => 30)
        const mockH = thespian.mock<(a: number) => number>("h");
        mockH.setup(g => g(12)).returns(() => 30)

        assertThat(fun(mockG.object, mockH.object, 4)).is(0)

    });
});