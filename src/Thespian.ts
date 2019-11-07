import {Mock} from "./Mock";
import {PrettyPrinter} from "mismatched";

const printer = PrettyPrinter.make();

export class Thespian {
    mocks: Array<Mock<any>> = []; // One for each Mocked object or function

    mock<T>(name?: string) {
        const mock = new Mock<T>(name);
        this.mocks.push(mock);
        return mock;
    }

    verify() {
        const errors: Array<any> = [];
        this.mocks.forEach(m => m.verify(errors));
        if (errors.length > 0) {
            console.log(printer.render(errors));
            throw new Error("Problem with mock expectations not beiong met.");
        }
    }

    describeMocks() {
        const describe = PrettyPrinter.make().render(this.mocks.map(m => m.describeMocks()));
        console.log("\n", {describe: describe});
    }
}
