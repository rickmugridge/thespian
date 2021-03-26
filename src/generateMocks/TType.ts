export class TParam {
    constructor(private name: string, private type: TType) {
    }
}

export interface TType {
    primitive(): boolean

    displayType(): string

    displayMockOrValue(): string
}

export class TString implements TType {
    constructor(private name: string) {
    }

    primitive(): boolean {
        return true;
    }

    displayType(): string {
        return "string";
    }

    displayMockOrValue(): string {
        return '""';
    }
}

export class TNumber implements TType {
    constructor(private name: string) {
    }

    primitive(): boolean {
        return true;
    }

    displayType(): string {
        return "number";
    }

    displayMockOrValue(): string {
        return '0';
    }
}

export class TSymbol implements TType {
    constructor(private name: string) {
    }

    primitive(): boolean {
        return true;
    }

    displayType(): string {
        return "Symbol";
    }

    displayMockOrValue(): string {
        return 'new Symbol()';
    }
}

export class TDate implements TType {
    constructor(private name: string) {
    }

    primitive(): boolean {
        return true;
    }

    displayType(): string {
        return "Date";
    }

    displayMockOrValue(): string {
        return 'new Date()';
    }
}

export class TClass implements TType {
    constructor(private name: string, generics: TParam[]) {
    }

    primitive(): boolean {
        return true;
    }

    displayType(): string {
        return this.name;
    }

    displayMockOrValue(): string {
        return this.name + '.object';
    }
}

export class TArray implements TType {
    constructor(private elementType: TType) {
    }

    primitive(): boolean {
        return this.elementType.primitive();
    }

    displayType(): string {
        return this.elementType.displayType() + '[]';
    }

    displayMockOrValue(): string {
        return '[' + this.elementType.displayMockOrValue() + ']';
    }
}

export class TTuple implements TType {
    constructor(private elements: TType[]) {
    }

    primitive(): boolean {
        return this.elements.every(e => e.primitive());
    }

    displayType(): string {
        return '[' + this.elements.map(e => e.displayType()) + ']';
    }

    displayMockOrValue(): string {
        return '[' + this.elements.map(e => this.displayMockOrValue()).join(' ') + ']'
    }
}

export class TUnion implements TType {
    constructor(private elements: TType[]) {
    }

    primitive(): boolean {
        return this.elements.every(e => e.primitive());
    }

    displayType(): string {
        return this.elements.map(e => e.displayType()).join(' | ')
    }

    displayMockOrValue(): string {
        return this.elements[0].displayMockOrValue()
    }
}

export class TIntersection implements TType {
    constructor(private elements: TType[]) {
    }

    primitive(): boolean {
        return this.elements.every(e => e.primitive());
    }

    displayType(): string {
        return this.elements.map(e => e.displayType()).join(' & ')
    }

    displayMockOrValue(): string {
        return this.elements[0].displayMockOrValue()
    }
}

