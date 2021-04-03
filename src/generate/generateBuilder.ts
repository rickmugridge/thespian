import * as ts from 'typescript'
import {getCompiled} from "../compiled/getCompiled";
import {Compiled, CompiledType} from "../compiled/Compiled";
import {fillTemplate} from "./fillTemplate";

const headerTemplate = ``

const builderTemplate = `
export class @{className}Builder {
  @{lowerName}: @{className} = {
@{valuePairs}
  }
@{methods}
  to(): @{className} {
     return @{lowerName}
  }
}
`

const valuePairTemplate = `
     this.@{fieldName} = @{someValue}
`

const withTemplate = `
  with@{upperFieldName}(@{fieldName}: @{fieldType}): this {
     this.@{lowerClassName}.@{fieldName} = @{fieldName}
     return this
  }
`

export const generateBuilder = (fileName: string,
                                elementaryClassSet: Set<string>,
                                enumMap: Map<string, string>): string => {
    var cmd = ts.parseCommandLine([fileName]);
    let program = ts.createProgram(cmd.fileNames, cmd.options);
    const sourceFile = program.getSourceFile(fileName);

    const results: string[] = []
    const classDetails = getCompiled(sourceFile!, elementaryClassSet, enumMap);
    classDetails.forEach(classDetail => makeBuilder(classDetail, results))
    if (results.length > 0) {
        return headerTemplate + results.join()
    }
    return ''
}

export const makeBuilder = (compiled: Compiled, results: string[]) => {
    switch (compiled.type) {
        case CompiledType.ClassType:
            break
        case CompiledType.InterfaceType:
            let makeBuilder = false
            const lowerName = lowerFirst(compiled.name);
            const valuePairs: string[] = []
            const methods: string[] = []
            compiled.fields.forEach(field => {
                makeBuilder = true
                valuePairs.push(`    ${field.name}: ${field.resultType.displayBuilderValue(field.name)},`)
                methods.push(fillTemplate(withTemplate, {
                    upperFieldName: upperFirst(field.name),
                    fieldName: field.name,
                    fieldType: field.resultType.displayType(),
                    lowerClassName: lowerName
                }))
            })
            if (makeBuilder) {
                results.push(fillTemplate(builderTemplate, {
                    className: compiled.name,
                    lowerName: lowerName,
                    valuePairs: valuePairs.join('\n'),
                    methods: methods.join('\n'),
                }))
            }
            break
        case CompiledType.FunctionType:
            break
    }
};

const lowerFirst = (s: string) => s.length > 0 ? s.charAt(0).toLowerCase() + s.substring(1) : ''

const upperFirst = (s: string) => s.length > 0 ? s.charAt(0).toUpperCase() + s.substring(1) : ''
