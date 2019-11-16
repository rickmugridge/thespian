import {MockedCall} from "./MockedCall";
import {MockedProperty} from "./MockedProperty";

export interface TMocked<T> {
    object: any; // Access the underlying mock.
    setup<U>(f: (t: T) => U): MockedCall<U> | MockedProperty<U>;

    verify(errors: Array<any>);

    describeMocks();
}