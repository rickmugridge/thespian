import {Mock} from "./Mock";

export class Thespian {
    mocks: Array<Mock<any>> = []; // One for each Mocked object or function

    mock<T>(name?: string) {
        const mock = new Mock<T>(name);
        this.mocks.push(mock);
        return mock;
    }

    verify() {
        this.mocks.forEach(m => m.verify());
    }

    describeMocks() {
        const describe = JSON.stringify(this.mocks.map(m => m.describeMocks()));
        console.debug("\n", {describe: describe}); // todo Remove
    }
}
