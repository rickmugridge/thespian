export class TParam {
    constructor(private name: string, private type: TType) {
    }

    isPrimitive(): boolean {
        return this.type.isPrimitive()
    }

    displayType(): string {
        return this.name + ": " + this.type.displayType()
    }

    displayLet(): string {
        return `\n  let ${this.name}: TMocked<${this.type.displayType()}>`
    }

    displayInitialiser(): string {
        return `\n    ${this.name} = thespian.mock<${this.type.displayType()}>("${this.name}")`
    }

    displayMockOrValue(): string {
        return this.type.displayMockOrValue(this.name)
    }

}

export interface TType {
    isPrimitive(): boolean

    displayType(): string

    displayMockOrValue(name: string): string
}

export class TString implements TType {
    constructor() {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return "string";
    }

    displayMockOrValue(name: string): string {
        return '""';
    }
}

export class TNumber implements TType {
    constructor() {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return "number";
    }

    displayMockOrValue(name: string): string {
        return '0';
    }
}

export class TBoolean implements TType {
    constructor() {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return "boolean";
    }

    displayMockOrValue(name: string): string {
        return 'true';
    }
}

export class TEnum implements TType {
    constructor(private enumName: string, private defaultValueName: string) {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return this.enumName;
    }

    displayMockOrValue(name: string): string {
        return `${this.enumName}.${this.defaultValueName}`
    }
}

export class TBuiltInClass implements TType {
    constructor(private typeName: string) {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return this.typeName;
    }

    displayMockOrValue(name: string): string {
        return `new ${this.typeName}()`
    }
}

export class TClass implements TType {
    constructor(private name: string, private generics: TGeneric[] = []) {
    }

    isPrimitive(): boolean {
        return false;
    }

    displayType(): string {
        if (this.generics.length > 0) {
            return `${this.name}<${this.generics.map(g => g.displayType()).join(', ')}>`
        }
        return this.name;
    }

    displayMockOrValue(name: string): string {
        return name + '.object';
    }
}

export class TGeneric implements TType {
    constructor(private type: TType, private generics: TGeneric[] = []) {
    }

    isPrimitive(): boolean {
        return false;
    }

    displayType(): string {
        if (this.generics.length > 0) {
            return `${this.type.displayType()}<${this.generics.map(g => g.displayType()).join(', ')}>`;
        }
        return this.type.displayType();
    }

    displayMockOrValue(name: string): string {
        return this.displayType();
    }
}

export class TArray implements TType {
    constructor(private elementType: TType) {
    }

    isPrimitive(): boolean {
        return this.elementType.isPrimitive();
    }

    displayType(): string {
        return this.elementType.displayType() + '[]';
    }

    displayMockOrValue(name: string): string {
        return '[' + this.elementType.displayMockOrValue(name) + ']';
    }
}

export class TTuple implements TType {
    constructor(private elements: TType[]) {
    }

    isPrimitive(): boolean {
        return this.elements.every(e => e.isPrimitive());
    }

    displayType(): string {
        return '[' + this.elements.map(e => e.displayType()) + ']';
    }

    displayMockOrValue(name: string): string {
        return '[' + this.elements.map(e => e.displayMockOrValue(name)).join(', ') + ']'
    }
}

export class TUnion implements TType {
    constructor(private elements: TType[]) {
    }

    isPrimitive(): boolean {
        return this.elements.every(e => e.isPrimitive());
    }

    displayType(): string {
        return this.elements.map(e => e.displayType()).join(' | ')
    }

    displayMockOrValue(name: string): string {
        return this.elements[0].displayMockOrValue(name)
    }
}

export class TIntersection implements TType {
    constructor(private elements: TType[]) {
    }

    isPrimitive(): boolean {
        return this.elements.every(e => e.isPrimitive());
    }

    displayType(): string {
        return this.elements.map(e => e.displayType()).join(' & ')
    }

    displayMockOrValue(name: string): string {
        return this.elements[0].displayMockOrValue(name)
    }
}

export class TArrow implements TType {
    constructor(private parameters: TParam[], private resultType: TType) {
    }

    isPrimitive(): boolean {
        return false;
    }

    displayType(): string {
        return `(${this.parameters.map(p => p.displayType()).join(', ')}) => ${this.resultType.displayType()}`
    }

    displayMockOrValue(name: string): string {
        return name + '.object'
    }
}

export class TUnknown implements TType {
    constructor(private kind: number) {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return `UNKNOWN(${this.kind})`
    }

    displayMockOrValue(name: string): string {
        return this.displayType()
    }
}


