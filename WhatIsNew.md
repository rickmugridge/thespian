# What is New (since Dec 2023)

## 19 December 2023

* Included a `throws()` capability, eg:
  * `mockObject.setup(c => c.match2("target")).throws(new Error("failed"))`
  * See [Mocks that Throw](MocksThatThrow.md) for further examples
