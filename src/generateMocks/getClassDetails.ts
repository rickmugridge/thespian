import * as ts from "typescript";
import {ParameterDeclaration} from "typescript";
import {getCompiledType} from "./getCompiledType";
import {TParam, TType, TUnknown} from "./TType";

export const getClassDetails = (source: ts.SourceFile): DecompiledClassOrFunction[] => {
    const classDetails: DecompiledClassOrFunction[] = []
    ts.forEachChild(source, (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && isExported(node)) {
            const name = getName(node.name)
            node.members.forEach(member => {
                if (ts.isConstructorDeclaration(member)) {
                    classDetails.push({isClass: true, name, parameters: getParameters(member.parameters)})
                }
            })
        } else if (ts.isVariableStatement(node) && isExported(node as any)) {
            const variableDeclarations = node.declarationList.declarations;
            if (Array.isArray(variableDeclarations) && variableDeclarations.length > 0) {
                const initializer = variableDeclarations[0].initializer as any
                if (ts.isArrowFunction(initializer)) {
                    const name = (variableDeclarations[0].name as any).escapedText!.toString()!
                    classDetails.push({isClass: false, name, parameters: getParameters(initializer.parameters)})
                }
            }
        }
    })
    return classDetails
}

const isExported = (node: ts.Declaration): boolean =>
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0

export const getName = (name?: ts.Identifier): string => name?.escapedText?.toString() || 'unknown'

const getParameters = (parameters: ts.NodeArray<ts.ParameterDeclaration>) =>
    parameters.map(p => new TParam((p.name as any).escapedText, getParameterType(p)))

const getParameterType = (param: ParameterDeclaration): TType => {
    if (!param.type) {
        return new TUnknown(0)
    }
    return getCompiledType(param.type)
}

export interface DecompiledClassOrFunction {
    isClass: boolean
    name: string
    parameters: TParam[]
}