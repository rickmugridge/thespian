export interface TType {
    isPrimitive(): boolean

    displayType(): string

    displayMockOrValue(fieldName: string): string

    displayBuilderValue(fieldName: string): string

    matcher():string
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

    displayMockOrValue(fieldName: string): string {
        return '""';
    }

    displayBuilderValue(fieldName: string): string {
        return `someBuilder.string("${fieldName}")`;
    }

    matcher(): string {
        return "match.ofType.string()";
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

    displayMockOrValue(fieldName: string): string {
        return '0';
    }

    displayBuilderValue(fieldName: string): string {
        return "someBuilder.number()";
    }

    matcher(): string {
        return "match.ofType.number()";
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

    displayMockOrValue(fieldName: string): string {
        return 'true';
    }

    displayBuilderValue(fieldName: string): string {
        return "someBuilder.boolean()";
    }

    matcher(): string {
        return "match.ofType.boolean()";
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

    displayMockOrValue(fieldName: string): string {
        return `${this.enumName}.${this.defaultValueName}`
    }

    displayBuilderValue(fieldName: string): string {
        return `someBuilder.enum(${this.enumName})`;
    }

    matcher(): string {
        return `match.ofType.enum(${this.enumName})`;
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

    displayMockOrValue(fieldName: string): string {
        return `new ${this.typeName}()`
    }

    displayBuilderValue(fieldName: string): string {
        if (this.typeName === 'Date')
            return `someBuilder.date()`;
        return `new ${this.typeName}Builder().to()`;
    }

    matcher(): string {
        return `match.instanceOf(${this.typeName})`;
    }
}

export class TClass implements TType {
    constructor(private name: string, private generics: TGenericArgument[] = []) {
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

    displayMockOrValue(fieldName: string): string {
        return fieldName + '.object';
    }

    displayBuilderValue(fieldName: string): string {
        return `new ${this.name}Builder().to()`;
    }

    matcher(): string {
        return `${this.name}Validator`;
    }
}

export class TGenericArgument implements TType {
    constructor(private type: TType, private generics: TGenericArgument[] = []) {
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

    displayMockOrValue(fieldName: string): string {
        return this.displayType();
    }

    displayBuilderValue(fieldName: string): string {
        return ``;
    }

    matcher(): string {
        return ``;
    }
}

export class TGenericParameter implements TType {
    constructor(private name: string) {
    }

    isPrimitive(): boolean {
        return false;
    }

    displayType(): string {
        return this.name;
    }

    displayMockOrValue(fieldName: string): string {
        return this.name;
    }

    displayBuilderValue(fieldName: string): string {
        return ``;
    }

    matcher(): string {
        return ``;
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

    displayMockOrValue(fieldName: string): string {
        return `[${this.elementType.displayMockOrValue(fieldName)}]`;
    }

    displayBuilderValue(fieldName: string): string {
        return `[${this.elementType.displayBuilderValue(fieldName)}]`;
    }

    matcher(): string {
        return `match.array.every(${this.elementType.matcher()})`;
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

    displayMockOrValue(fieldName: string): string {
        return `[${this.elements.map(e => e.displayMockOrValue(fieldName)).join(', ')}]`
    }

    displayBuilderValue(fieldName: string): string {
        return `[${this.elements.map(e => e.displayBuilderValue(fieldName)).join(', ')}]`;
    }

    matcher(): string {
        return `[${this.elements.map(e => e.matcher()).join(', ')}]`;
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

    displayMockOrValue(fieldName: string): string {
        return this.elements[0].displayMockOrValue(fieldName)
    }

    displayBuilderValue(fieldName: string): string {
        return this.elements[0].displayBuilderValue(fieldName);
    }

    matcher(): string {
        return `match.anyOf([${this.elements.map(e => e.matcher()).join(', ')}])`;
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

    displayMockOrValue(fieldName: string): string {
        return this.elements[0].displayMockOrValue(fieldName)
    }

    displayBuilderValue(fieldName: string): string {
        return this.elements[0].displayBuilderValue(fieldName);
    }

    matcher(): string {
        return `match.allOf([${this.elements.map(e => e.matcher()).join(', ')}])`;
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

    displayMockOrValue(fieldName: string): string {
        return fieldName + '.object'
    }

    displayBuilderValue(fieldName: string): string {
        const formalParameters = this.parameters.map(p => p.displayFormalParameter()).join(', ');
        const resultParameters = this.parameters.map(p => p.name).join(', ')
        const result = this.resultType.displayBuilderValue(`${fieldName}(${resultParameters})`);
        return `(${formalParameters}) => ${result}`
    }

    matcher(): string {
        return `match.ofType.function()`;
    }
}

export class TVoid implements TType {
    constructor() {
    }

    isPrimitive(): boolean {
        return true;
    }

    displayType(): string {
        return `void`
    }

    displayMockOrValue(fieldName: string): string {
        return ''
    }

    displayBuilderValue(fieldName: string): string {
        return '';
    }

    matcher(): string {
        return `match.any()`;
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

    displayMockOrValue(fieldName: string): string {
        return this.displayType()
    }

    displayBuilderValue(fieldName: string): string {
        return '';
    }

    matcher(): string {
        return `match.any()`;
    }
}

export class TParam {
    constructor(public name: string, public type: TType) {
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

    displayFormalParameter(): string {
        return `${this.name}: ${this.type.displayType()}`
    }
}
