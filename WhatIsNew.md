# What is New (since Dec 2023)

## 20 February 2024

If a mocked object is checked for being a Promise, the Promise system checks for a `then()` function on the mock.
That's the only way, at runtime it can tell, given the current implementation of Promises.

Such an access used to fail with an error, due to there being no setup for that as a property. 

This update means that the promise system treats it as not being a Promise.
To do this, an access to the property `then` returns `() => undefined` if there is no setup for that property.
If there is a setup for that property, then that will apply.

## 6 February 2024

* Changed the way that mock objects are known between thespian and mismatched,
  so that PrettyPrinter works fine in creating error messages on assertThat()s involving mock objects.

## 19 December 2023

* Included a `throws()` capability, eg:
  * `mockObject.setup(c => c.match2("target")).throws(new Error("failed"))`
  * See [Mocks that Throw](MocksThatThrow.md) for further examples
