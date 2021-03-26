import {SyntaxKind, TypeNode} from "typescript";
import {ofType} from "mismatched/dist/src/ofType";

export const getCompiledType = (type: TypeNode): string => {
    const typeAny = type as any;
    switch (type.kind) {
        case SyntaxKind.StringKeyword:
            return "string"
        case SyntaxKind.NumberKeyword:
            return "number"
        case SyntaxKind.BooleanKeyword:
            return "boolean"
        case SyntaxKind.ObjectKeyword:
            return "object"
        case SyntaxKind.AnyKeyword:
            return "any"
        case SyntaxKind.TypeReference:
            const generics = mapElements(typeAny.typeArguments || [], ", ")
            if (generics === '')
                return typeAny.typeName.escapedText
            else
                return `${typeAny.typeName.escapedText}<${generics}>`
        case SyntaxKind.FunctionType:
            const paramWithTypes = typeAny.parameters.map(p => `${p.name.escapedText}: ${getCompiledType(p.type)}`).join(", ");
            return `(${paramWithTypes}) => ${getCompiledType(typeAny.type)}`
        case SyntaxKind.UnionType:
            return `${mapElements(typeAny.types, " | ")}`
        case SyntaxKind.IntersectionType:
            return `${mapElements(typeAny.types, " & ")}`
        case SyntaxKind.ArrayType:
            return `${getCompiledType(typeAny.elementType)}[]`
        case SyntaxKind.TupleType:
            return `[${mapElements(typeAny.elements, ", ")}]`
        default:
            return `UNKNOWN(${type.kind})`
    }
}

const mapElements = (elements: any[], join: string) =>
    elements
        .filter(e => ofType.isObject(e))
        .map(e => getCompiledType(e))
        .join(join)
