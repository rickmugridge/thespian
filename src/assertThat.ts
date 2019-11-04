export function expectThrow(actual: () => any) {
    let unexpected = false;
    try {
        actual();
        unexpected = true;
    } catch (e) {
        console.debug("expectThrow as expected", {message: e.message}); // todo Remove
    }
    if (unexpected) {
        throw new Error("expected an exception, but did not happen.")
    }
}

