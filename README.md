# thespian

`thespian` is a mocking framework in Typescript that respects types in mocks.
It takes a sophisticated approach to argument matching, using `mismatched`.

Thespians are like mocks - they play a role.
See below, after the examples for the "design philosophy" of `thespian`.

# Thespian By Example

## Mocking an interface, and calling methods of that interface: Undo/Redo

We're testing an `UndoManager`, that is responsible for managing multiple undo/redo.
Each undo/redo item is defined by the interface `Command`.

We're testing a single undo after adding two commands. 
We mock the `Commands` so we verify that `UndoManager` operates correctly:

  - We specify that `undo()` is called on the `replace` command (when we call `undo()` on the `UndoManager`).
  - We specify that `details()` is called on the `edit` command (when we call `currentDetails()` on the `UndoManager`).

The use of `thespian` is further explained below the example.

```
import {Thespian} from "thespian";
import {assertThat} from "mismatched";

describe("Thespian By Example: Undo/Redo", () => {
    it("Add two commands and undo()", () => {
        const undoRedo = new UndoManager();
        const thespian = new Thespian();
        const edit = thespian.mock<Command>("edit");
        const replace = thespian.mock<Command>("replace");

        // Given
        replace
            .setup(f => f.undo())
            .returnsVoid();
        edit
            .setup(f => f.details())
            .returns(() => "Edit");
        undoRedo.add(edit.object);
        undoRedo.add(replace.object);

        // When
        undoRedo.undo();

        // Then
        assertThat(undoRedo.currentDetails()).is("Edit");
        thespian.verify();
    });
});

interface Command {
    details(): string;
    undo(): void;
    redo(): void;
}
```

In the example above, we:

  - Create a `Thespian` object, that is responsible for creating mocks and verifying them afterwards.
  - Create two mocks of the `Command` interface. 
    This is actually a wrapper for the mock, and allows us to specify how it acts on method calls.
  - Specify what happens when a method call is made on each mock:
    - The `setup()` specifies the method name and any arguments expected in the call. 
      In this example, there are no arguments. In general, arbitrary `mismatched` matchers can be used for the arguments.
    - The `returnsVoid()` specifies that the mocked method returns no result (ie, it is void)
    - The `returns()` specifies the value that is to be returned by the call to the mock if a matching call is made.
      This includes when the value is `undefined`.
      An arrow (lambda) is needed here; we'll see later that the value return is able to depend on the actual arguments.
  - Access each underlying mocked object (`mock.object`) so we can use it. 
    We add the two mock Commands to the UndoManager.
    In general mocks can be:
       - injected as a parameter in a constructor, method, or function.
       - Returned from calls to other mocks.
  - Call the mock's method with matching arguments, and verify that we get the right result.
  - Verify that all mocks were called as expected (and the right number of times).

## Mocking with sophisticated argument matching on calls

..... TODO
  





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

## Using `mismatched` to match arguments in mocking calls

## Eg of advanced use of `returns()` - we need to return the second argument as a result

## Mocking a function

# Design Philosophy

 - `thespian` is intended to mock interfaces (or classes) and to do that simply and well. 
   It does **not** try to do fancy tricks to deal with smelly code, such as partial mocking of real objects, 
   mocking modules, mocking global variables, and etc.
 - It also mocks functions and object properties
 - Mocks are identified, so it's easier to understand error messages when multiple mocks are involved
 - Expectations are set up before running the system under test
 - A test fails immediately if a call fails to match a mock - it doesn't return `undefined` by default!
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