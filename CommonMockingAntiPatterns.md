# Nine Common AntiPatterns in JS/TS Mocking Frameworks

# Rick Mugridge, 30 March 2021

I've used a variety of existing mocking frameworks in Typescript development over the last 6 years.
Most are fine for very simple testing, with simple objects/arrays.

But these all suffered from one or more problems, when mocking or when the objects concerned get more complex. 
For examples, covered further below:

 - Several mocks are needed, when test-driving a class that plays a coordination role and has several dependencies
   injected into that class.
 - A mock call fails with little useful information.
 - The arguments to mocked calls are deeply-nested objects and arrays. And:
    - Some fields/values may be randomly generated, or partially generated, 
      so they need to be ignored or matched in a general way.
    - If the arguments don't quite match, it takes time to work out the differences.
  - The argument doesn't quite match and I see the actual result is correct. 
    When the data is complex, I have to copy JSON output and convert it before I can use it in my test.
  - I need the same mocked call with the same arguments to return different results
 
As you might expect, these anti-patterns slowed me down as they were unhelpful.
They led me to create my own mocking framework that I could use with pleasure 
in development.
 
The anti-patterns:
 
## 1. Error messages, including mismatching calls are provided in JSON

 - This makes it harder to read, given the extra quotes.
 - Some object values are best not displayed in full. 
   For example, the `Moment` class has a huge number of fields.
   I'd like to simply show the `Moment` as a UTC string, but that's often not possible.
   I also want a short-hand form for some of my own classes/objects.
 - JSON is not able to render an object that is mocked. 
   Consider when a test passes a mock as an expected argument to a mocked call.
   However, there is something else wrong in the call and so the mocking fails.
   But because the mock argument can't be rendered by JSON, we instead get a weird exception.
 - Consider a failed method call when the (complex) actual result is correct.
   It's convenient to copy it out of the error message and paste it into the test. But the JSON gets in the way.
 - JSON doesn't render symbols or functions.
 - JSON doesn't render "circular" or self-referencing objects. Eg:

```
  const a: any = {b:2, c:[]};
  a.c.push(a);
```
   
## 2. Matching of call arguments are insufficient (matcher not composable)

 - See `Mocking with sophisticated argument matching on calls` in the [ThespianByExample](ThespianByExample.md) for an example.
 - To get around this limitation, it's necessary to either:
   - Not bother matching the argument at all - treat it as an automatic match.
   - Use a complex predicate to match it, which explicitly walks down the structure and checks it
     (ie, a laborious hand-written matcher).
   - Partially match the fields of an object.
     But this only works if the tricky field is only one level deep in the object.
   - This gets worse when we have to use different matchers for:
     - matching arguments in mocks
     - matching results in test checks/verifications/assertions

## 3. We get to the verify() step before we know something has gone wrong

- I find that it's better to stop immediately when something goes wrong, to ease diagnosis.
- This requires mock expections (`setup()`) to be defined before the test calls the system under test.
- I find it much easier to work out what's going on when it fails immediately, as the call-stack is available.

## 4. Mocks return `undefined` when nothing matches (instead of failing immediately)

- But 'undefined' is a valid JS value.
- It can make it hard to track down the source of the problem with complex logic.
  The `undefined` value may make sense or make sense part-way through the logic, so it takes a while to fail.
- Related to #3

## 5. Errors, when argument matching fails, are inadequate

 - Consider when an argument of a mocked call is a complex, nested object/array.
 - The difference between the expected and actual argument may be slight.
 - But it takes some time to work out the difference between the (JSON) display of each.
 - With such limited information, it makes sense to check the various parts of a complex object or array.
   Otherwise, it's very hard to identify and understand the differences.
   But this can mean that we miss changes in the actual data that are additions to the ones we've checked.
 - A diff would be so handy, including over longer strings. 
   Then we can check large complex objects and see what bits are wrong really easily.
 - It can also be handy to show multiple near misses when several are near matches.

## 6. When a mocked call fails, little context is given

- It would be handy to know what mocks had been called successfully beforehand.
  Especially when several mocks and/or calls are involved.

## 7. Mocks are not identified in error messages 

 - Instead, just the method/function and arguments are shown.
 - With more complex mocking situations, it may not be immediately obvious which mock is involved.
   Especially when there are several mocks of the same type.
 
## 8. Two or more calls are not permitted to the same mocked function/method with the same arguments but with different results

 - I know of one mocking framework that suffers from this. 
 - It was necessary to write a general wrapper that would manage sequences.
 - Few allow for multiple mocked calls to the same method/function with the same arguments but giving different results.
   This doesn't often arise, but is handy when needed.

## 9. We have to verify each of the mocks in turn

 - It would be simpler if the framework verified all of the mocks in one step.

## 10. We need to be able to return mock arguments from calls and check they are equal

 - Includes when the mock could be a Promise, and need to handle `mock.then` access

## 11. (mismatched) Much better to test the whole object rather than a set of assertThats

 - Otherwise, when the type of the object is extended, it's easy to miss the extra attributes

## Other possibilities

 * Type checking of matchers
 * Easier to read if lay out object structure directly - pain a picture. Eg comparing a lot of assertThats and one.

# Question

Have I missed any anti-patterns? Why did I not include examples? I didn't want to identify specific libraries.

# The Result was `thespian`

`thespian` was designed to avoid all of these anti-patterns.

I wasn't able to find a suitable matching library to use with `thespian`, with decent composabily.
So I wrote my own: [`mismatched`](https://github.com/rickmugridge/mismatched).
In addition to being an assertion/matching system, `mismatched` includes a `PrettyPrinter` that is used to 
display JS values (including error messages). This "knows" about `thespian` mocks so it can render them helpfully.
It also allows for `custom rendering`, based on the class of an object (eg, `Moment`).