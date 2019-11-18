# Testing that a function or method returns a rejected Promise

There are some traps in trying to verify that a function or method has rejected a Promise.

For a simple example, consider that we want to test the following function:

```
function handleError(id: number, repo: Repo, handler: Handler): Promise<string> {
    return repo
        .get(id)
        .then(optionalValue => {
            if (optionalValue) {
                return handler.handle(optionalValue!);
            }
            return Promise.reject("whoops");
        })
}
```

It looks like we could test one reject case like this:

```
     it("rejects when the repo returns undefined", () => {
           ...
           return handleError(44, repo.object, handler.object)
                .then(() => fail())
                .catch(() => thespian.verify());
     });
```
where we've set up mocks for the two arguments.

But there's a problem with the above code. The `fail()` throws an exception. 
That is then caught by the `.catch()` which "swallows" it.
So it looks like we've tested it, but we haven't. The test passes.

One way to handle this is as follows:

```
           return handleError(44, repo.object, handler.object)
                .then(() => fail(), () => thespian.verify());
```

We're using the form of `then()` that takes two arguments: for the `then` and the `catch` cases.
This will then result in a failed test.

`mistmatched` provided a clean way of testing such cases:

```
           return assertThat(handleError(44, repo.object, handler.object))
                .catches("whoops")
                .then(()=> thespian.verify());
```

