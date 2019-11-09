import {Mock} from "./Mock";
import {PrettyPrinter} from "mismatched";
import {SuccessfulCall} from "./MockedCall";

let mockCount = 1;

export class Thespian {
    public static symbolForMockToString = Symbol("symbolForMockToString");
    public static printer = PrettyPrinter.make(80, 10, Thespian.symbolForMockToString);
    private mocks: Array<Mock<any>> = []; // One for each Mocked object or function
    private successfulCalls: Array<SuccessfulCall> = [];

    mock<T>(name: string = "mock#" + mockCount++) {
        const mock = new Mock<T>(name, this.successfulCalls);
        this.mocks.push(mock);
        return mock;
    }

    displayPassedCalls() {
        Thespian.printer.logToConsole(this.successfulCalls);
    }

    verify() {
        const errors: Array<any> = [];
        this.mocks.forEach(m => m.verify(errors));
        if (errors.length > 0) {
            Thespian.printer.logToConsole(errors);
            throw new Error("Problem with mock expectations not being met.");
        }
    }

    describeMocks() {
        Thespian.printer.logToConsole(this.mocks.map(m => m.describeMocks()));
    }
}
