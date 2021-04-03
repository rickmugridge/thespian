import * as ts from 'typescript'
import {getCompiled} from "../compiled/getCompiled";
import {Compiled, CompiledType} from "../compiled/Compiled";
import {fillTemplate} from "./fillTemplate";

const headerTemplate = `
import { Thespian, TMocked } from 'thespian'
import { assertThat, match } from 'mismatched'
`

const template = `
describe('@{name}', () => {
  let thespian: Thespian @{lets}  
  
  beforeEach(() => {
    thespian = new Thespian() @{initialisers}
  })

  afterEach(() => thespian.verify())
})
`

export const generateMocks = (fileName: string,
                              elementaryClassSet: Set<string>,
                              enumMap: Map<string, string>): string => {
    var cmd = ts.parseCommandLine([fileName]);
    let program = ts.createProgram(cmd.fileNames, cmd.options);
    const sourceFile = program.getSourceFile(fileName);

    const results: string[] = []
    const classDetails = getCompiled(sourceFile!, elementaryClassSet, enumMap);
    classDetails.forEach(classDetail => mockClassOrFunction(classDetail, results))
    if (results.length > 0) {
        return headerTemplate + results.join()
    }
    return ''
}

const mockClassOrFunction = (compiled: Compiled, results: string[]) => {
    let someMocks = false
    let lets = ''
    let initialisers = ''
    switch (compiled.type) {
        case CompiledType.ClassType:
            const className = compiled.name;
            compiled.parameters.forEach(param => {
                if (!param.isPrimitive()) {
                    someMocks = true
                    lets += param.displayLet()
                    initialisers += param.displayInitialiser()
                }
            })
            if (someMocks) {
                const params = compiled.parameters.map(p => p.displayMockOrValue()).join(", ")
                const variableName = lowerFirst(className);
                const classNameWithGenerics = compiled.genericParameters.length > 0 ?
                    `${className}<${compiled.genericParameters.map(g => g.displayType()).join(', ')}>`:
                    className
                lets += `\n  let ${variableName}: ${classNameWithGenerics}`
                initialisers += `\n    ${variableName} = new ${classNameWithGenerics}(${params})`
                results.push(fillTemplate(template, {name: className, lets, initialisers}))
            }
            break
        case CompiledType.InterfaceType:
            break
        case CompiledType.FunctionType:
            compiled.parameters.forEach(param => {
                if (!param.isPrimitive()) {
                    someMocks = true
                    lets += param.displayLet()
                    initialisers += param.displayInitialiser()
                }
            })
            if (someMocks) {
                results.push(fillTemplate(template, {name: compiled.name, lets, initialisers}))
            }
            break
    }
};

const lowerFirst = (s: string) => s.length > 0 ? s.charAt(0).toLowerCase() + s.substring(1) : ''