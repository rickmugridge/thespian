import * as ts from "typescript";
import {ParameterDeclaration} from "typescript";
import {getCompiledType} from "./getCompiledType";

export const getClassDetails = (source: ts.SourceFile): ClassOrFunctionDetail[] => {
    const classDetails: ClassOrFunctionDetail[] = []
    ts.forEachChild(source, (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && isExported(node)) {
            const name = node.name?.escapedText!.toString()!
            node.members.forEach(member => {
                if (ts.isConstructorDeclaration(member)) {
                    classDetails.push({isClass: true, name, parameters: getParameters(member.parameters)})
                }
            })
        } else if (ts.isVariableStatement(node) && isExported(node as any)) {
            const variableDeclarations = node.declarationList.declarations;
            const name = (variableDeclarations[0].name as any).escapedText!.toString()!
            const initializer = variableDeclarations[0].initializer as any;
            if (ts.isArrowFunction(initializer)) {
                classDetails.push({isClass: false, name, parameters: getParameters(initializer.parameters)})
            }
        }
    })
    return classDetails
};

const getParameters = (parameters: ts.NodeArray<ts.ParameterDeclaration>) =>
    parameters.map(p => {
        return {
            name: (p.name as any).escapedText,
            type: getParameterType(p),
        }
    })

const isExported = (node: ts.Declaration): boolean =>
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0

const getParameterType = (param: ParameterDeclaration): string => {
    if (!param.type) {
        return "UNKNOWN"
    }
    return getCompiledType(param.type)
}

export interface ParameterDetail {
    name: string
    type: string
}

export interface ClassOrFunctionDetail {
    isClass: boolean
    name: string
    parameters: ParameterDetail[]
}