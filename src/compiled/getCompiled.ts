import * as ts from "typescript";
import {ParameterDeclaration, SyntaxKind} from "typescript";
import {getCompiledType, mapGenericParameters} from "./getCompiledType";
import {TParam, TType, TUnknown} from "./TType";
import {Compiled, CompiledField, CompiledInterface, CompiledMethod, CompiledType} from "./Compiled";

export const getCompiled = (source: ts.SourceFile,
                            elementaryClassSet: Set<string>,
                            enumMap: Map<string, string>): Compiled[] => {
    const decompiledArray: Compiled[] = []
    ts.forEachChild(source, (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && isExported(node)) {
            getCompiledClass(node, decompiledArray, elementaryClassSet, enumMap);
        } else if (ts.isInterfaceDeclaration(node)) {
            const anInterface = getCompiledInterface(node, elementaryClassSet, enumMap);
            decompiledArray.push(anInterface)
        } else if (ts.isVariableStatement(node) && isExported(node as any)) {
            getCompiledFunction(node, decompiledArray, elementaryClassSet, enumMap);
        }
    })
    return decompiledArray
}

const getCompiledClass = (node: ts.ClassDeclaration,
                          decompiledArray: Compiled[],
                          elementaryClassSet: Set<string>,
                          enumMap: Map<string, string>) => {
    const name = getName(node.name)
    const genericParameters = mapGenericParameters(node.typeParameters as any)
    node.members.forEach(member => {
        if (ts.isConstructorDeclaration(member)) {
            decompiledArray.push({
                type: CompiledType.ClassType, name,
                genericParameters,
                parameters: getParameters(member.parameters, elementaryClassSet, enumMap),
                fields: [],
                methods: []
            })
        }
    })
};

const getCompiledInterface = (node: ts.InterfaceDeclaration,
                              elementaryClassSet: Set<string>,
                              enumMap: Map<string, string>): CompiledInterface => {
    const name = getName(node.name)
    const genericParameters = mapGenericParameters(node.typeParameters as any)
    const methods: CompiledMethod[] = []
    const fields: CompiledField[] = []
    node.members.forEach(member => {
        if (member.kind === SyntaxKind.MethodSignature) {
            methods.push({
                name: getName(member.name as any),
                genericParameters: mapGenericParameters((member as any).typeParameters as any),
                parameters: getParameters((member as any).parameters, elementaryClassSet, enumMap),
                resultType: getCompiledType((member as any).type, elementaryClassSet, enumMap)
            })
        } else if (member.kind === SyntaxKind.PropertySignature) {
            fields.push({
                name: getName(member.name as any),
                resultType: getCompiledType((member as any).type, elementaryClassSet, enumMap)
            })
        }
    })
    return {type: CompiledType.InterfaceType, name, genericParameters, fields, methods};
};

const getCompiledFunction = (node: ts.VariableStatement,
                             decompiledArray: Compiled[],
                             elementaryClassSet: Set<string>,
                             enumMap: Map<string, string>) => {
    const variableDeclarations = node.declarationList.declarations;
    if (Array.isArray(variableDeclarations) && variableDeclarations.length > 0) {
        const initializer = variableDeclarations[0].initializer as any
        if (ts.isArrowFunction(initializer)) {
            const name = (variableDeclarations[0].name as any).escapedText!.toString()!
            decompiledArray.push({
                type: CompiledType.FunctionType, name, genericParameters: [],
                parameters: getParameters(initializer.parameters, elementaryClassSet, enumMap),
                resultType: new TUnknown(999)
            })
        }
    }
};

const isExported = (node: ts.Declaration): boolean =>
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0

export const getName = (name?: ts.Identifier): string => name?.escapedText?.toString() || 'unknown'

const getParameters = (parameters: ts.NodeArray<ts.ParameterDeclaration>,
                       elementaryClassSet: Set<string>,
                       enumMap: Map<string, string>) =>
    Array.from(parameters.map(p => new TParam(
        (p.name as any).escapedText,
        getParameterType(p, elementaryClassSet, enumMap))))

const getParameterType = (param: ParameterDeclaration,
                          elementaryClassSet: Set<string>,
                          enumMap: Map<string, string>): TType => {
    if (!param.type) {
        return new TUnknown(0)
    }
    return getCompiledType(param.type, elementaryClassSet, enumMap)
}
