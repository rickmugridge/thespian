# thespian

`thespian` is a mocking framework with a sophisticated approach to argument matching
and providing useful error messages when arguments fail to match.

It is written in Typescript and respects types in mocks.
It uses [`mismatched`](https://github.com/rickmugridge/mismatched), 
a sophisticated composable matcher for matching arguments of method and function calls.

Thespians are like mocks - they play a role.
For the "design decisions" of `thespian`, see below, after the examples.

# Short Docs

 - To create a `Thespian` in order to create mocks:
   - `const thespian = new Thespian();`
 - To create a mock for a class or interface (with a given name, used in error messages):
   - `const mockCheck = thespian.mock<Check>("check");`
    - To specify an expected method call:
      - `mockCheck.setup(c => c.match()).returns(() => 4);`
    - To specify an expected method call to be called a specific number times:
      - `mockCheck.setup(c => c.match2("target")).returns(() => "ok").times(2);`
 - To create a mock for an object property (with a given name, used in error messages):
   - `const mockCheck = thespian.mock<Check>("check");`
    - To specify an expected property access:
      - `mockCheck.setup(c => c.prop).returns(() => 4);`
    - To specify an expected property access to be called a specific number times:
      - `mockCheck.setup(c => c.prop).returns(() => 5).times(2);`
 - To create a mock for a function:
   - `const mockFn = thespian.mock<(n: number)=>number>("fun");`
    - To specify an expected function call:
      - `mockFn.setup(f => f(5)).returns(() => 2);`
    - To specify an expected function call to be called a specific number times:
      - `mockFn.setup(f => f(100)).returns(() => 20).timesGreater(0);`
- To access the underlying mock for use in tests:
   - `const check = mockCheck.object;`
 - To verify that all expected mock calls and property accesses have happened:
   - `thespian.verify();`
   
Mocked methods and function with the same arguments can return a series of results:

    - To specify a mocked method call with the same arguments but different results (4 is returned in the first call, and 5 on the second):
      - `mockCheck.setup(c => c.match()).returns(() => 4);`
      - `mockCheck.setup(c => c.match()).returns(() => 5);`
    - To specify a mocked property access with different results (4 is returned in the first call, and 5 on the second):
      - `mockCheck.setup(c => c.prop).returns(() => 4);`
      - `mockCheck.setup(c => c.prop).returns(() => 5);`
     - To specify a mocked method function with the same arguments but different results (4 is returned in the first call, and 5 on the second):
       - `mockCheck.setup(c => f(5)).returns(() => 4);`
       - `mockCheck.setup(c => f(5)).returns(() => 5);`

Possible `returns`:
  - `.returns(()=>45)`, a function that provides the result. 
     The result can depend on the actual arguments. Eg, `.returns((a,b) => a)`.
  - `.returnsVoid()` for when the mocked method/function does not return a result.

Possible `times` checks:
  - `.times()`, a specific `number`
  - `.timesAtLeast()`, the minimum `number` of times
  - `.timesAtMost()`, the maximum `number` of times

# Example Error Message

When a call to a mocked method or function fails to match, it's useful to know whether there were any near misses.
Here's an example, where there are two near misses:

![message](thespianErrorMessage.png)

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
import {TMocked} from "thespian";
import {assertThat} from "mismatched";

describe("Thespian By Example: Undo/Redo", () => {
    it("Add two commands and undo()", () => {
        const undoRedo = new UndoManager();
        const thespian = new Thespian();
        const edit: TMocked<Command> = thespian.mock<Command>("edit");
        const replace: TMocked<Command> = thespian.mock<Command>("replace");

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
    These are actually wrappers for the mock, and allow us to specify how it acts on method calls.
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

Here's an example which involves nested object, where we match on the argument passed to the mock.

```
    it("Sophisticated matching of mock arguments", () => {
        interface Matched {
            matchId: number;
            matches: Array<{
                match_type: string,
                links: Array<string>
            }>;
        }

        interface Check {
            match(match: Matched): number;
        }

        const thespian = new Thespian();
        const mockCheck = thespian.mock<Check>();
        mockCheck
            .setup(f => f.match({
                matchId: 0,
                matches: [{
                    match_type: match.string.startsWith("full"),
                    links: match.array.length(1)
                }]
            }))
            .returns(() => Math.random());
        const check = mockCheck.object;
        assertThat(check.match({
            matchId: 0,
            matches: [{
                match_type: "full-match",
                links: ["REL"]
            }]
        })).is(match.ofType.number());
        thespian.verify();
    });
```

If the wrong arguments are provided, we get an error:

```
Error: Unable to call mock#1.match([
  {
    matchId: 0, 
    matches: [{match_type: "full-match", links: ["REL"]}]
  }
]) as it does not match any mock setup calls
````

Any mocked calls that have already been passed are also shown.

## Mocking a Method that can be called several times

```
    interface Tell {
        tellAll(user: string, count: number): number
    }

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

If a third call is made, the following error results:

```
Error: Unable to call aTell.tellAll(["elisa", 2]) as it does not match any mock setup calls
Previous suceeding calls:
[
  {
    name: "aTell.tellAll()", actualArgs: ["elisa", 2], returnValue: 44, expectedTimes: 2
  }, 
  {
    name: "aTell.tellAll()", actualArgs: ["elisa", 2], returnValue: 44, expectedTimes: 2
  }
]
```

This shows that 2 calls were expected but only one was received.

## Mocking an object property access

Here's an example of a property access being mocked.

```
       it("property accessed once", () => {
            const thespian = new Thespian();
            const mock = thespian.mock<I>("anObject");
            mock
                .setup(f => f.prop)
                .returns(() => 44);
            assertThat(mock.object.prop).is(44);
            thespian.verify();
        });
```

## Mocking a function

Here's an example of a function being mocked.

```
    it("mocking a function", () => {
        let thespian = new Thespian();
        let mockFn = thespian.mock<(i: number) => number>("fn");
        mockFn
            .setup(g => g(2))
            .returns(() => 33);
        thespian.describeMocks();
        assertThat(mockFn.object(2)).is(33);
        thespian.describeMocks();
        thespian.verify();
    });
```

# `thespian` Design Decisions

 - `thespian` is intended to mock interfaces (or classes) and to do that simply and well. 
   It does **not** try to do fancy tricks to deal with smelly code, such as partial mocking of real objects, 
   mocking modules, mocking global variables, and etc.
 - It also mocks functions (and later: object properties).
 - Mocks are identified, so it's easier to understand error messages when multiple mocks are involved.
 - Expectations are set up before running the system under test.
 - A test fails immediately if a call fails to match a mock - it doesn't return `undefined` by default!
   Any mock calls that have succeeded by that point are also displayed, to give context.
 - A Thespian object oversees the creation of all mocks for a test. 
   The Thespian is responsible for verification of expected calls across all mocks at once.
 - For matching mock call arguments, it uses `mismatched`, a sophisticated matcher (originally a part of `thespian`).
   It displays a mock in a useful form when it is the argument to a failed mock call.
 - It permits multiple mocked calls to the same method/function with the same arguments but different results.

`Thespian` follows the design decisions of `JMock2` in Java.
And `mismatched` follows the design decisions of `hamcrest`.

But it follows some of syntax of Moq and TypeMoq, but little of the philosophy
    
# FAQ

  - "I want to match an argument with a complex object structure.
     But deep within the structure, I want to ignore a randomly-generated value.
     How can I do that?"
       - The matcher [`mismatched`](https://github.com/rickmugridge/mismatched) 
         is used in `thespian` for matching arguments of expected method and 
         function calls. It provides for such matching. 
       - For an example, see the section `Mocking with sophisticated argument matching on calls` above.
  - "I am passing a mock so it ends up being used in a Promise chain.
     Even though it is not a Promise, it fails when its `.then()` is checked.
     How can I avoid the failure?"
     
      - Simply define a mock on its `then` property to return `undefined`:
      - `mockObj.setup(m => b.then).returns(()=> undefined);`
