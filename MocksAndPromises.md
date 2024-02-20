# Mocks and Promises

## Promises system

When JS is executing with Promises, a resolved Promise may in turn return a Promise, and so that
secondary Promise is handled as a part of the chain of promises.

For example, in async:
```
     const result1 = await fn1()
     
```

