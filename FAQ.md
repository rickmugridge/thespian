# FAQ

## I want to match an argument with a complex object structure.

But deep within the structure, I want to ignore a randomly-generated value.
How can I do that?"
- The matcher [`mismatched`](https://github.com/rickmugridge/mismatched) is used in `thespian`
  for matching arguments of expected method and function calls. It provides for such matching.
- For an example, see the section `Mocking with sophisticated argument matching on calls` 
  in [ThespianByExample](ThespianByExample.md).

## What if the returned value from a mocked method/function depends on the argument?

The .`returns()` part is supplied with the actual arguments to that call, and they can be used.
For example, for mocking the function `positiveIncrement`:

```
        mockFn
            .setup(positiveIncrement => positiveIncrement(match.number.greaterEqual(0)))
            .returns((n:number) => n + 1);
```

## What if the returned value from a mocked method/function is to be different on two calls

Define the setup for each possibility. They are applied in the order that you define them.
Eg, in the following the first call to the function will return 1 and the second call will return 2:

```
        mockFn
            .setup(positiveIncrement => positiveIncrement(match.any()))
            .returns(() => 1);
       mockFn
            .setup(positiveIncrement => positiveIncrement(match.any()))
            .returns(() => 2);
```

## What if a mocked method/function needs to have side-effects?

The `.returns()` part can cause those side-effects:

```
       let count = 0
        mockFn
            .setup(nextInt => nextInt())
            .returns(() => count++);
```


## "I am returning a mock so it ends up being used in a Promise chain.

Even though it is not a Promise, it fails when its `.then()` is checked.
How can I avoid the failure?"

- Simply define a mock on its `then` property to return `undefined` (any number of times):
- `mockObj.setup(m => b.then).returns(()=> undefined).timesAtLeast(0);`

## I am returning a mock that's later checked against itself. Can I do that?

- Yes, Thespian and mismatched work together, so mismatched knows it's a mock and can automatically 
  deal with equal checks.

## "What's a good way of checking that a method correctly returns a rejected Promise?"

- See [Testing Returned Promise Is Rejected](TestingPromiseIsRejected.md)

## I get an error when I write a mock setup like this:
```
        mockFn
            .setup(fun => { const part = whole.part[0]; return fun(part.a, part.b)})
            .returns(() => 33);
```
- The issue here is the `Thespian` works out at runtime what function/method is being called (here with `fun`).
  It does not allow for a block being used, with `{}`, as that code could be arbitrarily complex.
  So the above needs to be changed to the following (or equivalent):

```
        const part = whole.part[0]
        mockFn
            .setup(g =>  fun(part.a, part.b))
            .returns(() => 33);
```
   
