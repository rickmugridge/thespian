# thespian

A mocking framework in Typescript that respects types in mocks.

Thespians are like mocks - they play a role.

It follows the philosophy of `JMock2` in Java:
 - It is intended to mock interfaces (or classes)
 - It also mocks functions and object properties
 - Mocks are identified, so it's easier to understand error messages when multiple mocks are involved
 - Expectations are set up before running the system under test
 - A test fails immediately if a call fails to match a mock - it doesn't return undefined by default!
 - A Thespian object creates all mocks for a test. 
   The Thespian is responsible for verification of expected calls across all mocks at once (not individually, as with TypeMoq)
 - For matching arguments, it uses `mismatched`, a matcher that has many of the properties of hamcrest.
   This allows for sophisticated matching of arguments, unlike in most mocking frameworks
 - When a mock fails, it displays what mocks have just passed and shows how the call failed to match the "best" mock-call (if any)
 - Tracing can be turned on, so called mocks display what's happened
 - It permits multiple mocked calls to the same method/function with the same arguments but different results
 - It properly displays the arguments of a failed call, even when they are mocks themselves
 

It follows some of structure of TypeMoq, but little of the philosophy
 - talk about this:
  
   mock.setup(g => g.m(1,2)).returns(() => 5).times(2)  and mock.object
    
# To Do

 - Verify successful calls at Thespian level
 - Include mock symbol for identifying mocks to PrettyPrinter.
 - Provide excellent error messages, especially when argument matchers fail (but close).
 - Consider tracking whether a a MockedCall may have matched, in case none do. 
   Then can show near misses, as well as mock calls that have already passed.
 - Add support for object properties.
 = Consider all error conditions - eg, inappropriate lambdas passed to .setup(), .returns(), .times(), etc.
 - Consider how to support mocks that could potentially be a Promise, in a Promise chain.
 - Provide full documentation here.
 - Make it easy to turn on helpful tracing of mock selections and calls. 
   It can be painful when it's unclear why a mock failed.
 - consider what other Proxy methods are needed: apply() etc
 - ...