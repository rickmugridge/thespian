import * as ts from 'typescript'
import {ParameterDeclaration, SyntaxKind, TypeNode} from 'typescript'
import {ofType} from "mismatched/dist/src/ofType";

export const generateMocks = (fileName: string): any => {
    var cmd = ts.parseCommandLine([fileName]);
    let program = ts.createProgram(cmd.fileNames, cmd.options);
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(fileName);
// console.log(program)

    ts.forEachChild(sourceFile!, (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && isExported(node)) {
            console.log('class', {name: node.name?.escapedText})
            node.members.forEach(member => {
                if (ts.isConstructorDeclaration(member)) {
                    // console.log({theType: checker.getTypeAtLocation(member)})
                    console.log('parameters', member.parameters.map(p => {
                        // console.log({typeKind: p.type!.kind})
                        return {
                            name: (p.name as any).escapedText,
                            type: getParameterType(p),
                            // exported: isExported(node)
                        }
                    }))
                    // console.log('full parameters', (member as any).parameters)
                }
            })
        } else if (ts.isFunctionOrConstructorTypeNode(node)) {
            console.log('function', {exported: isExported(node)})
        }
    })
}

const isExported = (node: ts.Declaration): boolean =>
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0
// const isExported =(node: ts.Node): boolean =>
//     (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export)) !== 0

const getParameterType = (param: ParameterDeclaration): string => {
    if (!param.type) {
        return "UNKNOWN"
    }
    return getType(param.type)
}

const getType = (type: TypeNode): string => {
    const typeAny = type as any;
    switch (type.kind) {
        case SyntaxKind.TypeReference:
            console.log(typeAny.typeName.escapedText, typeAny.typeParameters)
            return typeAny.typeName.escapedText // todo Also look at typeParameters for generics???
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
        case SyntaxKind.FunctionType:
            const paramWithTypes = typeAny.parameters.map(p => `${p.name.escapedText}: ${getType(p.type)}`).join(", ");
            return `(${paramWithTypes}) => ${getType(typeAny.type)}`
        case SyntaxKind.UnionType:
            return `${mapElements(typeAny.types, " | ")}`
        case SyntaxKind.IntersectionType:
            return `${mapElements(typeAny.types, " & ")}`
        case SyntaxKind.ArrayType:
            return `${getType(typeAny.elementType)}[]`
        case SyntaxKind.TupleType:
            return `[${mapElements(typeAny.elements, ", ")}]`
        default:
            return `UNKNOWN(${type.kind})`
    }
}

const mapElements = (elements: any[], join: string) =>
    elements
        .filter(e => ofType.isObject(e))
        .map(e => getType(e))
        .join(join)
