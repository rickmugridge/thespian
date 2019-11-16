import {Thespian} from "./Thespian";
import {MockHandler} from "./MockHandler";
import {Mocked} from "./Mocked";

export class MockFixture {
    thespian = new Thespian();
    mockHandler = this.thespian.mock<MockHandler>("mockHandler");
    mockUnderTest = new Mocked<J>("mockName", [], this.mockHandler.object);

    verify() {
        this.thespian.verify();
    }
}

interface J {
    f();
}