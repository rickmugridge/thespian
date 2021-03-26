import * as ts from 'typescript'
import {DecompiledClassOrFunction, getClassDetails} from "./getClassDetails";

const headerTemplate = `
import { Thespian, TMocked } from 'thespian'
import { assertThat } from 'mismatched'
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

export const generateMocks = (fileName: string): string => {
    var cmd = ts.parseCommandLine([fileName]);
    let program = ts.createProgram(cmd.fileNames, cmd.options);
    const sourceFile = program.getSourceFile(fileName);

    const results: string[] = []
    const classDetails = getClassDetails(sourceFile!);
    classDetails.forEach(classDetail => mockClassOrFunction(classDetail, results))
    if (results.length > 0) {
        return headerTemplate + results.join()
    }
    return ''
}

export const mockClassOrFunction = (classDetail: DecompiledClassOrFunction, results: string[]) => {
    let mockingRequired = false
    let lets = ''
    let initialisers = ''
    classDetail.parameters.forEach(param => {
        if (!param.isPrimitive()) {
            mockingRequired = true
            lets += param.displayLet()
            initialisers += param.displayInitialiser()
        }
    })
    if (classDetail.isClass) {
        const params = classDetail.parameters.map(p => p.displayMockOrValue()).join(", ")
        lets += `\n  let ${classDetail.name}: ${classDetail.name}`
        initialisers += `\n    ${classDetail.name} = new ${classDetail.name}(${params})`
    }
    if (mockingRequired)
        results.push(fillTemplate(template, {name: classDetail.name, lets, initialisers}))
};

const fillTemplate = (template: string, fillers: any) => {
    let result = template
    Object.keys(fillers).forEach(key => {
        result = result.replace(`@{${key}}`, fillers[key])
    })
    return result
}
