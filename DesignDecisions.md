# `thespian` Design Decisions

- `thespian` is intended to mock functions, object properties, and interfaces (or classes) and to do that simply and well.
  It does **not** try to do fancy tricks to deal with smelly code, such as partial mocking of real objects,
  mocking modules, mocking global variables, and etc.
- Mocks are optionally named, so it's easier to understand error messages when multiple mocks are involved.
- Expectations are set up before running the system under test.
- A test fails immediately if a call fails to match a mock - it doesn't return `undefined` by default!
  Any mock calls that have succeeded by that point are also displayed, to give context.
- A `Thespian` object oversees the creation of all mocks for a test.
  That object is responsible for post-verification at the end of a test of expected calls across all the mocks.
This checks that each mocked function, method, etc has been called the expected number of times (1 by default).
- For matching mock call arguments, it uses `mismatched`, a sophisticated matcher.
  It displays a mock in a useful form when it is the argument to a failed mock call.
- It permits multiple mocked calls to the same method/function with the same arguments but different results.
- The ordering of the mock call definitions in this case is the expected ordering of those calls.

In general terms:
 * `Thespian` follows the design decisions of `JMock2` in Java. 
   `Thespian` is based on the syntax of `Moq` and `TypeMoq`, but follows little of their philosophy.
 * `mismatched` follows the design decisions of `hamcrest` in Java, but goes well beyond `hamcrest` capabilities.


