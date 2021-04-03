import * as ts from 'typescript'
import {getCompiled} from "../compiled/getCompiled";
import {Compiled, CompiledType} from "../compiled/Compiled";
import {fillTemplate} from "./fillTemplate";

const headerTemplate = `
import { match } from 'mismatched'
`

const validatorTemplate = `
const validate@{className} = (value: @{className}): MatchResult => 
    validateThat(value).satisfies(@{className}Validator)

export const @{className}Validator = {
@{fieldValidators}
}
`

const fieldValidatorTemplate = `     @{fieldName}: @{matcher}`

export const generateValidator = (fileName: string,
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
            const fieldValidators: string[] = []
            compiled.fields.forEach(field => {
                makeBuilder = true
                fieldValidators.push(fillTemplate(fieldValidatorTemplate, {
                    fieldName: field.name,
                    matcher: field.resultType.matcher()
                }))
            })
            if (makeBuilder) {
                results.push(fillTemplate(validatorTemplate, {
                    className: compiled.name,
                    fieldValidators: fieldValidators.join('\n')
                }))
            }
            break
        case CompiledType.FunctionType:
            break
    }
};

const lowerFirst = (s: string) => s.length > 0 ? s.charAt(0).toLowerCase() + s.substring(1) : ''

const upperFirst = (s: string) => s.length > 0 ? s.charAt(0).toUpperCase() + s.substring(1) : ''
