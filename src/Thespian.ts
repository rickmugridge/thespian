import {Mocked} from "./Mocked";
import {PrettyPrinter} from "mismatched";
import {TMocked} from "./TMocked";
import {SuccessfulCall} from "./SuccessfulCall";
import {generateMocks} from "./generate/generateMocks";
import {generateBuilder} from "./generate/generateBuilder";
import {generateValidator} from "./generate/generateValidator";

let mockCount = 1;

export class Thespian {
    public static symbolForMockToString = Symbol("symbolForMockToString");
    public static printer = PrettyPrinter.make(80, 20, 10000, Thespian.symbolForMockToString);
    private mocks: Array<Mocked<any>> = []; // One for each Mocked object or function
    private successfulCalls: Array<SuccessfulCall> = [];

    static generateMocks(fileName: string,
                         elementaryInterfaces: string[] = [],
                         elementaryClasses: any = {},
                         enums: any = {}) {
        const elementaryClassSet: Set<string> = new Set(Object.keys(elementaryClasses))
        elementaryInterfaces.forEach(ei => elementaryClassSet.add(ei))
        const enumMap: Map<string, string> = new Map()
        Object.keys(enums).forEach(key => enumMap.set(key, (Object.keys(enums[key]))[0]))
        console.log(generateMocks(fileName, elementaryClassSet, enumMap))
    }

    static generateBuilder(fileName: string,
                           elementaryInterfaces: string[] = [],
                           elementaryClasses: any = {},
                           enums: any = {}) {
        const elementaryClassSet: Set<string> = new Set(Object.keys(elementaryClasses))
        elementaryInterfaces.forEach(ei => elementaryClassSet.add(ei))
        const enumMap: Map<string, string> = new Map()
        Object.keys(enums).forEach(key => enumMap.set(key, (Object.keys(enums[key]))[0]))
        console.log(generateBuilder(fileName, elementaryClassSet, enumMap))
    }

    static generateValidator(fileName: string,
                           elementaryInterfaces: string[] = [],
                           elementaryClasses: any = {},
                           enums: any = {}) {
        const elementaryClassSet: Set<string> = new Set(Object.keys(elementaryClasses))
        elementaryInterfaces.forEach(ei => elementaryClassSet.add(ei))
        const enumMap: Map<string, string> = new Map()
        Object.keys(enums).forEach(key => enumMap.set(key, (Object.keys(enums[key]))[0]))
        console.log(generateValidator(fileName, elementaryClassSet, enumMap))
    }

    mock<T>(name: string = "mock#" + mockCount++): TMocked<T> {
        const mock = new Mocked<T>(name, this.successfulCalls);
        this.mocks.push(mock);
        return mock;
    }

    displayPassedCalls() {
        Thespian.printer.logToConsole(this.successfulCalls);
    }

    verify() {
        const errors: Array<any> = [];
        this.mocks.forEach(m => m.verify(errors));
        if (errors.length > 0) {
            throw new Error("Problem(s) with mock expectations not being met:\n" +
                Thespian.printer.render(errors));
        }
    }

    describeMocks() {
        Thespian.printer.logToConsole(this.mocks.map(m => m.describeMocks()));
    }
}
