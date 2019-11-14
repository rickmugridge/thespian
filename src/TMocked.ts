import {MockedCall} from "./MockedCall";

export interface TMocked<T> {
    object: any; // Access the underlying mock.
    setup<U>(f: (t: T) => U): MockedCall<U>;

    verify(errors: Array<any>);

    describeMocks();
}