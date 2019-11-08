# thespian

`thespian` is a mocking framework in Typescript that respects types in mocks.

Thespians are like mocks - they play a role.

# Thespian By Example

## Mocking an interface, and calling a method of that interface

```
import {Thespian} from "./Thespian";
import {assertThat} from "mismatched";

describe("Thespian By Example", () => {
    interface Tell {
        tellAll(user: string, count: number): number
    }

    it("Mocks a method of an interface", () => {
        const thespian = new Thespian();
        const mock = thespian.mock<Tell>("an object");
        mock
            .setup(f => f.tellAll("elisa", 2))
            .returns(() => 44);
        const mocked = mock.object;
        assertThat(mocked.tellAll("elisa", 2)).is(44);
        thespian.verify();
    });
});
```

In the example above, we:

  - Use a simple interface here, `Tell`, with one method.
  - Create a `Thespian` object, that is responsible for creating mocks and verifying them afterwards.
  - Create a mock for the given interface. 
    This is actually a wrapper for the mock, and allows us to specify how it acts.
  - Specify what happens when a method call is made on that mock
    - the `setup()` specifies the arguments expected in the call (arbitrary `mismatched` matchers can be used here).
    - the `returns()` specifies the result that is to be returned by the mock if a matching call is made.
      If the result is `undefined`, that needs to be specified as the return value. 
      An arrow (lambda) is needed here; we'll see later that the result can depend on the actual arguments.
  - Access the underlying mocked object (`mock.object`) so we can use it. 
    Eg, it can be injected as a parameter into a constructor, method, or function argument when we're 
     testing that.
  - Call the mock's method with matching arguments, and verify that we get the right result.
  - Finally, verify that all mocks were called as expected.

If the wrong arguments are provided, we get an error:

```
  Error: Unable to call tellAll(["elisa", 3]) as it does not match
```

If that mocked method is called a second time, an error is given:

```
[
  {
    name: "aTell.tellAll()", actualArgs: ["elisa", 2], returnValue: 44, 
    expectedTimes: 1
  }
]

Error: Unable to call aTell.tellAll(["elisa", 2]) as it does not match
```

Any mocked calls that have already been passed are shown first, as shown above.
  
## Mocking a Method that can be called several times

```
    it("We can call a mocked method several times", () => {
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
```

In the example above, we:

  - Also call `times()` on the mock wrapper, with a number. 
  - This allows us to call that method twice.
  - It also sets an expectation that it will be called exactly twice. If not, `verify()` complains.
  - We can also specify:
     - `timesAtLeast()` with a number. Eg, `timesAtLeast(0)` shows we're happy if it's called or not.
     - `timesAtMost()` with a number. Eg, `timesAtMost(2)` shows we're happy if it's called between 0 and 2 times.

If insufficient calls are made, this is picked up by `verify()`. Eg:

```
[
  {
    name: "aTell.tellAll()", expectedArgs: ["elisa", 2], expectedTimes: 2, 
    actualTimes: 1
  }
]

Error: Problem with mock expectations not being met.
```

This shows that 2 calls were expected but only one was received.

# Design Philosophy

 - `thespian` is intended to mock interfaces (or classes) and to do that simply and well. 
   It does not try to do fancy things with partial mocking of real objects, 
   and other tricks that are needed with smelly code.
 - It also mocks functions and object properties
 - Mocks are identified, so it's easier to understand error messages when multiple mocks are involved
 - Expectations are set up before running the system under test
 - A test fails immediately if a call fails to match a mock - it doesn't return undefined by default!
   Any mock calls that have succeeded by that point are also display, to give context.
 - A Thespian object oversees the creation of all mocks for a test. 
   The Thespian is responsible for verification of expected calls across all mocks at once (not individually, as with TypeMoq)
 - For matching arguments, it uses `mismatched`, a matcher that has many of the properties of hamcrest.
   This allows for sophisticated matching of arguments, unlike in most mocking frameworks.
 - It permits multiple mocked calls to the same method/function with the same arguments but different results

`Thespian` follows the philosophy of `JMock2` in Java:

But it follows some of syntax of Moq and TypeMoq, but little of the philosophy
  
   mock.setup(g => g.m(1,2)).returns(() => 5).times(2)  and mock.object
    
# To Do

 - Add support for mocking object properties as well.
 - Properly display the arguments of a failed call, even when a mock is an argument.
   Include mock symbol and method for identifying mocks to PrettyPrinter.
 - Provide excellent error messages, especially when argument matchers fail but are close.
   Track whether a MockedCall may have matched, in case none do, and show near misses.
 = Consider all error conditions - eg, inappropriate lambdas passed to .setup(), .returns(), .times(), etc.
 - Consider how to support mocks that could potentially be a Promise, in a Promise chain
   (ie, return undefined for the property "then".
 - Provide full documentation here.
 - Make it easy to turn on helpful tracing of mock selections and calls. 
   It can be painful when it's unclear why a mock failed.
 - consider what other Proxy methods are needed: apply() etc
 - ...