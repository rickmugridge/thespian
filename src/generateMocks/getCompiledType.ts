import {SyntaxKind, TypeNode} from "typescript";
import {ofType} from "mismatched/dist/src/ofType";
import {
    TArray,
    TArrow,
    TBoolean,
    TBuiltInClass,
    TClass,
    TGeneric,
    TIntersection,
    TNumber,
    TParam,
    TString,
    TTuple,
    TType,
    TUnion,
    TUnknown
} from "./TType";
import {getName} from "./getClassDetails";

export const getCompiledType = (type: TypeNode): TType => {
    const typeAny = type as any;
    switch (type.kind) {
        case SyntaxKind.StringKeyword:
            return new TString()
        case SyntaxKind.NumberKeyword:
            return new TNumber()
        case SyntaxKind.BooleanKeyword:
            return new TBoolean()
        case SyntaxKind.SymbolKeyword:
            return new TBuiltInClass('Symbol')
        case SyntaxKind.ObjectKeyword:
            return new TClass('object')
        case SyntaxKind.AnyKeyword:
            return new TClass('any')
        case SyntaxKind.TypeReference:
            return handleTypeReference(typeAny)
        case SyntaxKind.FunctionType:
            return new TArrow(mapParameters(typeAny.parameters), getCompiledType(typeAny.type))
        case SyntaxKind.UnionType:
            return new TUnion(mapElements(typeAny.types))
        case SyntaxKind.IntersectionType:
            return new TIntersection(mapElements(typeAny.types))
        case SyntaxKind.ArrayType:
            return new TArray(getCompiledType(typeAny.elementType))
        case SyntaxKind.TupleType:
            return new TTuple(mapElements(typeAny.elements))
        default:
            return new TUnknown(type.kind)
    }
}

const builtInSet: Set<string> = new Set(
    [
        'Array', 'ArrayBuffer', 'AsynchFunction', 'Atomics',
        'BigInt', 'BigInt64Array', 'BigUint64Array', 'Boolean',
        'DataView', 'Date', 'Error', 'EvalError',
        'FinalizationRegistry', 'Float32Array', 'Float64Array', 'Function', 'Generator', 'GeneratorFunction',
        'InternalError', 'Intl', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object',
        'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp',
        'Set', 'SharedArrayBuffer', 'String', 'Symbol', 'TypedArray', 'TypeError',
        'UInt16Array', 'UInt32Array', 'UInt8Array', 'UInt8ClampedArray', 'UriError',
        'WeakMap', 'WeakSet', 'WebAssembly'
    ])

const handleTypeReference = (type: any): TType => {
    const name = getName(type.typeName);
    if (builtInSet.has(name))
        return new TBuiltInClass(name)
    const generics = mapElements(type.typeArguments || []).map(t => new TGeneric(t))
    return new TClass(name, generics)
}

const mapElements = (elements: any[]): TType[] =>
    elements.filter(e => ofType.isObject(e)).map(e => getCompiledType(e))

const mapParameters = (parameters: any[]): TParam[] =>
    parameters.map(p => new TParam(p.name.escapedText, getCompiledType(p.type)))