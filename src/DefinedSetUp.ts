export class DefinedSetUp {
    static details<T, U>(f: (t: T) => U): SetUpDetails {
        const fn = f.toString(); // Eg, 'f => f.foooo(2, "aaa")'
        const split = fn.split(" => "); // Eg, ['f', 'f.foooo(2, "aaa")'
        const call = split[1]; // eg, 'f.foooo(2, "aaa")'
        const openBracket = call.indexOf("(");
        const dot = call.indexOf(".");
        if (openBracket < 0) {
            return {_type: SetUpType.Property, name: call.slice(dot + 1)};
        }
        if (dot < 0 || dot > openBracket) { // Eg, (j: any) => j(match.any())
            return {_type: SetUpType.Function}; // a function
        }
        const name = call.slice(dot + 1, openBracket);
        return {_type: SetUpType.Method, name: name};
    }
}

export interface SetUpDetails {
    _type: SetUpType;
    name?: string;
}

export enum SetUpType {Method, Property, Function}