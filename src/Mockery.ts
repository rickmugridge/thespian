import {Mock} from "./Mock";

export class Mockery {
    mocks: Array<Mock<any>> = []; // One for each Mocked object or function

    mock<T>(name?: string) {
        const mock = new Mock<T>(name);
        this.mocks.push(mock);
        return mock;
    }

    verifyAll() {
        this.mocks.forEach(m => m.verify());
    }
}
