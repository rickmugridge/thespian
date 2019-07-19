export class Optional<T> {
    constructor(public isSome: boolean, public some?: T) {
    }

    map<U>(f: (t: T) => U) {
        if (this.isSome) {
            return Optional.some<U>(f(this.some as T));
        }
        return this;
    }

    static none = new Optional<any>(false);

    static some<T>(value: T) {
        return new Optional(true, value);
    }
}

/*

Note can do Scala-like matching with these. Eg

   const v: Optional = ...
   switch (v.isSome) {
      case true:... // todo consider constants Some and None for true and false
      case false:...
   }


 */