import {TGenericParameter, TParam, TType} from "./TType";

export type Compiled = CompiledClass | CompiledInterface | CompiledFunction

export interface CompiledClass {
    type: CompiledType.ClassType
    name: string
    genericParameters: TGenericParameter[]
    parameters: TParam[]
    fields: CompiledField[]
    methods: CompiledMethod[]
}

export interface CompiledInterface {
    type: CompiledType.InterfaceType
    name: string
    genericParameters: TGenericParameter[]
    fields: CompiledField[]
    methods: CompiledMethod[]
}

export interface CompiledFunction {
    type: CompiledType.FunctionType
    name: string
    genericParameters: TGenericParameter[]
    parameters: TParam[]
    resultType: TType
}

export enum CompiledType {
    ClassType = 'ClassType',
    InterfaceType = 'InterfaceType',
    FunctionType = 'FunctionType',
}

export interface CompiledMethod {
    name: string
    genericParameters: TGenericParameter[]
    parameters: TParam[]
    resultType: TType
}

export interface CompiledField {
    name: string
    resultType: TType
}

export const compiled = {
    isClass: (compiled:Compiled): compiled is CompiledClass => compiled.type === CompiledType.ClassType
}