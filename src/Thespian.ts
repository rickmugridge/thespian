import {Mock} from "./Mock";
import {PrettyPrinter} from "mismatched";
import {SuccessfulCall} from "./MockedCall";

const printer = PrettyPrinter.make();
let mockCount = 1;

export class Thespian {
    private mocks: Array<Mock<any>> = []; // One for each Mocked object or function
    private successfulCalls: Array<SuccessfulCall> = [];

    mock<T>(name: string = "mock#" + mockCount++) {
        const mock = new Mock<T>(name, this.successfulCalls);
        this.mocks.push(mock);
        return mock;
    }

    displayPassedCalls() {
        console.log(printer.render(this.successfulCalls));
    }

    verify() {
        const errors: Array<any> = [];
        this.mocks.forEach(m => m.verify(errors));
        if (errors.length > 0) {
            console.log(printer.render(errors));
            throw new Error("Problem with mock expectations not being met.");
        }
    }

    describeMocks() {
        const describe = PrettyPrinter.make().render(this.mocks.map(m => m.describeMocks()));
        console.log(describe);
    }
}
