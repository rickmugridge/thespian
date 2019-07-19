# tsDiffMockery

A mocking framework in Typescript that respects types in mocks.

It follows the philosophy of `JMock2` in Java:
 - Intended to mock interfaces
 - Also mocks functions (and object properties -- later)
 - Expectations are set up before running
 - A test fails immediately if a call fails to match a mock - it doesn't return undefined by default!
 - Has a Mockery object for creating all mocks for a test. 
   Verification of counts of calls is done through the Mockery, across all mocks at once, not individually (like with TypeMoq)
 - For matching arguments, it uses a matcher that has many of the properties of hamcrest: `tsDiffMatcher`
 

It follows some of structure of TypeMoq, but little of the philosophy
 - talk about this:
  
   mock.setup(g => g.m(1,2)).returns(() => 5).times(2)  and mock.object
 
# To Do

 - Wire up the Handler to call through the appropriate mocks for the method or function concerned.
 - Handle verification.
 - Provide excellent error messages, especially when argument matchers fail (but close).
 - Add support for object properties.
 = Consider all error conditions - eg, inappropriate lambdas passed to .setup(), .returns(), .times(), etc.
 - Consider how to support mocks that could potentially be a Promise, in a Promise chain.
 - Introduce tsDiffMatcher for matching in micro tests as well as in the mocks.
 = Consider passing actual arguments through to .returns() lambda, for flexibility.
 - Provide full documentation here.
 - Make it easy to turn on helpful tracing of mock selections and calls. 
   It can be painful when it's unclear why a mock failed.
 - consider what other Proxy methods are needed: apply() etc
 - ...