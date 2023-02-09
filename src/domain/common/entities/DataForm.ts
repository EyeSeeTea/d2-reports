import { Maybe } from "../../../utils/ts-utils";
import { Id, Ref } from "./Base";

export interface DataForm {
    id: Id;
    optionSets: OptionSet[];
    sections: Section[];
}

export interface Section extends Ref {
    name: string;
    subsections: SubSection[];
}

export interface SubSection {
    name: string;
    dataElements: DataElement[];
}

export interface DataElement extends Ref {
    optionSet: Maybe<Ref>;
    name: string;
    valueType: typeof DataElementM.valueTypesSupported[number];
}

export class DataElementM {
    static valueTypesSupported = ["BOOLEAN", "INTEGER_ZERO_OR_POSITIVE", "INTEGER", "TEXT"] as const;
}

export interface OptionSet extends Ref {
    options: Option[];
}

export interface Option extends Ref {
    name: string;
    code: string;
}

export interface DataFormValue {
    orgUnitId: Id;
    dataElementId: Id;
    period: Period;
    categoryOptionComboId: Id;
    value: Maybe<string>;
}

export type Period = string;