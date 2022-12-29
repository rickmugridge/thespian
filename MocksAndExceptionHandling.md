# Mock call fails and there are try-catches in the system-under-test code

Consider when a mock fails to match and activates a try-catch in the system-under-test code:

For example, consider the following system-under-test code:

```typescript
const fun = (g: (a: number) => number, h: (b: number) => number, a: number): number => {
    try {
        return g(h(a))
    } catch(e) {
        return 0;
    }
}
```

We test `fun` with mocks for `g` and `h`:

```typescript
describe("Try-catches in the system-under-test code", () => {
    let thespian: Thespian;

    beforeEach(() => {
        thespian = new Thespian();
    })
  
    afterEach(() => thespian.verify());

    it("Mock call fails", () => {
        const mockG = thespian.mock<(a: number) => number>("g");
        mockG.setup(g => g(12)).returns(() => 30)
        const mockH = thespian.mock<(a: number) => number>("h");
        mockH.setup(g => g(12)).returns(() => 30)

        assertThat(fun(mockG.object, mockH.object, 4)).is(0)

    });
});
```

If either of the mock calls fail, an exception is thrown by `thespian`, resulting in the `catch` returning 0.
However, when `thespian.verify()` is run in the `afterEach()`, it signals the problems:

```
Error: Problem(s) with mock expectations not being met:
[
  {call: g(12), expectedTimes: 1, actualTimes: 0}, 
  {call: h(12), expectedTimes: 1, actualTimes: 0}
]
```

This shows the importance of including a call to `thespian.verify()`.
Otherwise:
 * The test could possibly pass without showing the problem.
 * It's harder to diagnose when the test fails
