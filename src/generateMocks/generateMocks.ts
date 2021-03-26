import * as ts from 'typescript'
import {getClassDetails} from "./getClassDetails";

const headerTemplate = `
import { Thespian, TMocked } from 'thespian'
import { assertThat } from 'mismatched'`

const template = `
describe('@{name}', () => {
  let thespian: Thespian @{lets}  
  
  beforeEach(() => {
    thespian = new Thespian() @{initialisers}
  })

  afterEach(() => thespian.verify())
})
`

export const generateMocks = (fileName: string): any => {
    var cmd = ts.parseCommandLine([fileName]);
    let program = ts.createProgram(cmd.fileNames, cmd.options);
    const sourceFile = program.getSourceFile(fileName);

    console.log(headerTemplate)
    const classDetails = getClassDetails(sourceFile!);
    classDetails.forEach(classDetail => {
        let lets = ''
        let initialisers = ''
        classDetail.parameters.forEach(param => {
            if (isToBeMocked(param.type)) {
                lets += `\n  let ${param.name}: TMocked<${param.type}>`
                initialisers += `\n    ${param.name} = thespian.mock<${param.type}>("${param.name}")`
            }
        })
        if (classDetail.isClass) {
            const params = classDetail.parameters.map(p => {
                return isToBeMocked(p.type) ? `${p.name}.object` : 'undefined'
            }).join(", ")
            lets += `\n  let ${classDetail.name}: ${classDetail.name}`
            initialisers += `\n    ${classDetail.name} = new ${classDetail.name}(${params})`
        }
        console.log(fillTemplate(template, {name: classDetail.name, lets, initialisers}))
    })
}

const primitives = ["string", "number", "boolean", "Symbol", "Date"]
const isToBeMocked = (type: string): boolean => {
    if (primitives.find(p => p === type)) {
        return false
    }
    if (type.endsWith('[]')) {
        return !!primitives.find(p => p === type + '[]');
    }
    if (type.startsWith('[') && type.endsWith(']')) {
        const types = type.slice(1, type.length - 1).split(", ")
        return includesToBeMocked(types)
    }
    const unions = type.split('| ');
    if (unions && unions.length > 1) {
        return includesToBeMocked(unions)
    }
    const intersections = type.split('& ');
    if (intersections && intersections.length > 1) {
        return includesToBeMocked(intersections)
    }
    return true
}

const includesToBeMocked = (types: string[]) => !!types.find(t => isToBeMocked(t))

const fillTemplate = (template: string, fillers: any) => {
    let result = template
    Object.keys(fillers).forEach(key => {
        result = result.replace(`@{${key}}`, fillers[key])
    })
    return result
}
