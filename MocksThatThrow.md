# Mocks that throw

## Examples with `throws()`:

* `mockObject.setup(c => c.match2("target")).throws(new Error("failed"));`
* `mockObject.setup(c => c.prop).throws("error");`
* `mockFn.setup(f => f(5)).throws("failed");`

## `returns()` can also be used:

* `mockObject.setup(c => c.match2("target")).returns(() => {throw new Error("failed")} );`
* `mockObject.setup(c => c.prop).returns(() => {throw "error"} );`
* `mockFn.setup(f => f(5)).returns(() => {throw "failed"} );`

