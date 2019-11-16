# Nine Common AntiPatterns in JS/TS Mocking Frameworks

# Rick Mugridge, Hypr, 17 November 2019

I've used a variety of existing mocking frameworks in Typescript development ove the last 4 years.
These all suffered from one or more problems, especially when mocking where:

 - Several mocks are needed, when test driving a class that plays a coordination role and has several dependencies
   injected into that class.
 - A mock call fails with little useful information.
 - The arguments to mocked calls are deeply-nested objects and arrays. And:
    - Some fields/values may be randomly generated, or partially generated, 
      so they need to be ignored or matched in a general way.
    - If the arguments don't quite match, it takes time to work out the difference
  - The argument doesn't quite match and I see the actual result is correct. 
    I copy JSON output and convert it before using it in my test.
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

 - See `Mocking with sophisticated argument matching on calls` in the README for an example.
 - To get around this limitation, it's necessary to either:
   - Not bother matching the argument at all - treat it as an automatic match.
   - Use a complex predicate to match it, which explicitly walks down the structure and checks it
     (ie, a laborious hand-written matcher).
   - Partially match the fields of an object.
     But this only works if the tricky field is only one level deep in the object.
 
## 3. Errors, when argument matching fails, are inadequate

 - Consider when an argument of a mocked call is a complex, nested object/array.
 - The difference between the expected and actual argument may be slight.
 - But it takes some time to work out the difference between the (JSON) display of each.
 - A diff would be so handy.
 
## 4. Mocks are not identified in error messages 

 - Instead, just the method/function and arguments are shown.
 - With more complex mocking situations, it may not be immediately obvious which mock is involved.
   Especially when there are more than one mock of the same type.
 
## 5. Calls to a mocked object can't be sequenced

 - I know of one mocking framework that suffers from this.
 - It was necessary to write a general wrapper that would manage sequences.
 - Few allow for multiple mocked calls to the same method/function with the same arguments but giving different results.
   This doesn't often arise, but it would be handy if you could do it.

## 6. Mocks return `undefined` when nothing matches (instead of failing immediately)

 - But 'undefined' is a valid JS value. 
 - It can make it hard to track down the source of the problem with complex logic.
   The `undefined` value may make sense or make sense part-way through the logic, so it takes a while to fail.
 
## 7. We get to the verify() step before we know something has gone wrong

 - I find that it's better to stop immediately when something goes wrong, to ease diagnosis.
 - Hence mock expections (`setup()`) need to be defined before the test calls the system under test.
 
## 8. We have to verify each of the mocks in turn

 - It would be better if the framework verified all of the mocks in one step.
 
## 9. When a mocked call fails, little context is given

 - It would be handy to know what mocks had been called successfully beforehand.
   Especially when several mocks and/or calls are involved.

# Question

Have I missed any anti-patterns? Why did I not include example? I didn't want to identify specific libraries.

# The Result was `thespian`

`thespian` was designed to avoid all of these anti-patterns.

I wasn't able to find a suitable matching library to use with `thespian`, with decent composabily.
So I wrote my own: `mismatched`.
In addition to being an assertion/matching system, `mismatched` includes a `PrettyPrinter` that is used to 
display JS values (including error messages). This "knows" about `thespian` mocks so can render them helpfully.
It also allows for `custom rendering`, based on the class of an object (eg, `Moment`).