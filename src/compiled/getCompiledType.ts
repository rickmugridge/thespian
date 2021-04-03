import {SyntaxKind, TypeNode} from "typescript";
import {ofType} from "mismatched/dist/src/ofType";
import {
    TArray,
    TArrow,
    TBoolean,
    TBuiltInClass,
    TClass,
    TEnum,
    TGenericArgument, TGenericParameter,
    TIntersection,
    TNumber,
    TParam,
    TString,
    TTuple,
    TType,
    TUnion,
    TUnknown,
    TVoid
} from "./TType";
import {getName} from "./getCompiled";

export const getCompiledType = (type: TypeNode,
                                elementaryClassSet: Set<string>,
                                enumMap: Map<string, string>): TType => {
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
            return handleTypeReference(typeAny, elementaryClassSet, enumMap)
        case SyntaxKind.FunctionType:
            return new TArrow(
                mapParameters(typeAny.parameters, elementaryClassSet, enumMap),
                getCompiledType(typeAny.type, elementaryClassSet, enumMap))
        case SyntaxKind.UnionType:
            return new TUnion(mapElements(typeAny.types, elementaryClassSet, enumMap))
        case SyntaxKind.IntersectionType:
            return new TIntersection(mapElements(typeAny.types, elementaryClassSet, enumMap))
        case SyntaxKind.ArrayType:
            return new TArray(getCompiledType(typeAny.elementType, elementaryClassSet, enumMap))
        case SyntaxKind.TupleType:
            return new TTuple(mapElements(typeAny.elements, elementaryClassSet, enumMap))
        case SyntaxKind.VoidKeyword:
            return new TVoid()
        default:
            return new TUnknown(type.kind)
    }
}

const builtInClassSet: Set<string> = new Set(
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

const handleTypeReference = (type: any,
                             elementaryClassSet: Set<string>,
                             enumMap: Map<string, string>): TType => {
    const name = getName(type.typeName);
    if (builtInClassSet.has(name) || elementaryClassSet.has(name))
        return new TBuiltInClass(name)
    const enumValue = enumMap.get(name)
    if (enumValue)
        return new TEnum(name, enumValue)
    return new TClass(name, mapGenericArguments(type.typeArguments, elementaryClassSet, enumMap))
}

const mapElements = (elements: any[],
                     elementaryClassSet: Set<string>,
                     enumMap: Map<string, string>): TType[] =>
    elements.filter(e => ofType.isObject(e)).map(e => getCompiledType(e, elementaryClassSet, enumMap))

const mapParameters = (parameters: any[],
                       elementaryClassSet: Set<string>,
                       enumMap: Map<string, string>): TParam[] =>
    parameters.map(p => new TParam(p.name.escapedText, getCompiledType(p.type, elementaryClassSet, enumMap)))

export const mapGenericArguments = (typeArguments: any[],
                                    elementaryClassSet: Set<string>,
                                    enumMap: Map<string, string>) =>
    mapElements(typeArguments || [], elementaryClassSet, enumMap).map(t => new TGenericArgument(t))

export const mapGenericParameters = (typeParameters?: any[]) =>
    (typeParameters || []).filter(e => ofType.isObject(e)).map(t => new TGenericParameter(getName(t.name)))
