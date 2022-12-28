# Lazy or Eager Verification of Mocks

A mock call can be verified in several ways:

* Did the actual arguments supplied by the system-under-test in the calls of the mocked method/function
  match the expected arguments of the mock call?
* Did all the mocked methods/functions get called the expected number of times.

There are two main approaches to verifying mocks:

* Lazy:
    * As the system-under-test calls mocked methods, check that the supplied arguments match.
      If so, return the result as defined in the mock call definition. If not, return `undefined`.
    * After the system-under-test has finished, check that the expected mocks have all been satisfied
      (and called the correct number of times). Display any that are not satisfied.
    * This is the approach that `Jest` and many other mocking frameworks use.
* Eager:
    * As the system-under-test calls mocked methods, check that the supplied arguments match.
      If so, return the result as defined in the mock call definition. If not, immediately throw an exception (possibly
      also logging what mock calls had previously succeeded).
    * After the system-under-test has finished, check that the mocks have been called the correct number of times.
    * This is the approach that `thespian` and `JMock2` (Java) use, and is a configurable option with `TypeMoq`.

There are disadvantages with these approaches when:

* Mock call fails (Lazy only)
* Mock call fails and there are try-catches in the system-under-test code

## Mock call fails

### Lazy approach

In the Lazy approach, if a mock call from the system-under-test is not matched, the mock framework returns `undefined`.
This can have two consequences:

* If `undefined` is not a normally-valid response, the system-under-test code will likely fail at some point further
  along.
  This can lead to a faulty result returned, spurious exceptions and/or error messages, or extra failed verifications.
  These make it difficult to understand why the test failed (and especially when there are multiple mocks in use).
* If `undefined` is a normally-valid response, the code path of the system-under-test code may be unexpectedly altered.
  This may mean that the verification outcomes for the mocks are harder to understand.

Eg, Consider the following trivial system-user-test code:

```typescript
const fun = (f: (a: number) => number, 
             g: (b: number) => boolean, 
             a: number): boolean => {
    return e(f(g(a)))
}
```

where function `e` is global and the functions `e`, `f`, and `g` do not expect an `undefined` value argument.

Consider when we use mocks for the 2 argument functions when testing this.
Under the lazy approach, if the `g` mock setup fails to match:
  * it returns `undefined`.  
  * This `undefined` is then passed into the `f` mock, which also fails to match, returning `undefined`.
  * This `undefined` is then passed into the `e` function, which fails with an exception (or incorrect return value).
  * The test fails with an exception (or incorrect assertion on the result of `fun`.

We can only tell what went wrong where by carefully reading both:
  * the exception details
  * the results of the post-run verification of the mocks.

Consider now the following slightly-different system-user-test code:

```typescript
const fun = (f: (a: number) => number, 
             g: (b: number) => boolean, 
             a: number): boolean => {
    return e(f(g(a)))
}
```

where the functions `e` also accepts an `undefined` value argument.

In this case, if either the `f` or `g` mock setups fail to match, an `undefined` value will be passed to the `e` function.
This, presumably, will return a valid boolean value. Depending on that resulting value, either:

  1. The test partially passes, even though a mock call failed to match.
  2. The test fails.

In either case, we can only tell what went wrong by carefully reading the results of the post-run verification of the mocks.

This gets trickier as the number of mocks and the interactions/logic gets more complex.

### Eager Approach

In the Eager approach, if a mock call from the system-under-test is not matched, the mock framework immediately stops
with an error.
This makes it easy to **immediately** see where the test is inconsistent with the code being tested.

## Mock call fails and there are try-catches in the system-under-test code

Consider when a mock fails to match and activates a try-catch in the system-under-test code:

* Lazy approach: When `undefined` is not a normally-valid response, an exception may be thrown.
* Eager approach: An exception is thrown when a mock call fails to match.

Regardless of the reason for the exception, we will have a problem if the try-catch swallows it or otherwise acts
incorrectly.

Here are two possible approaches to avoid this problem:

* Separate the try-catch part into a separate method/function.
    * Test the part without the try-catch in some tests, checking the other logic.
    * Test the try-catch part specifically, where any mock calls explicitly throw exceptions.
* Ensure that the try-catch logic in the system-under-test code explicitly fails when unknown `Errors` are thrown.
  This may not be possible, or it may unduely obscure the application code.