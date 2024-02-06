# What is New (since Dec 2023)

## 6 February 2024

* Changed the way that mock objects are known between thespian and mismatched,
  so that PrettyPrinter works fine in creating error messages on assertThat()s involving mock objects.

## 19 December 2023

* Included a `throws()` capability, eg:
  * `mockObject.setup(c => c.match2("target")).throws(new Error("failed"))`
  * See [Mocks that Throw](MocksThatThrow.md) for further examples
