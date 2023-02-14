import { Ref } from "./Base";

interface DataElementBase extends Ref {
    name: string;
}

interface DataElementSimple extends DataElementBase {
    valueType: "BOOLEAN" | "INTEGER_ZERO_OR_POSITIVE" | "INTEGER" | "TEXT";
}

interface DataElementOption extends DataElementBase {
    valueType: "OPTION";
    options: Option[];
    isMultiple: boolean;
}

export type DataElement = DataElementSimple | DataElementOption;

export interface OptionSet extends Ref {
    options: Option[];
}

export interface Option {
    name: string;
    value: string;
}

/** */

export class DataElementM {
    static valueTypesSupported = ["BOOLEAN", "INTEGER_ZERO_OR_POSITIVE", "INTEGER", "TEXT", "OPTION"] as const;

    /*
    static getOptionSet(dataForm: DataForm, dataElement: DataElement): Maybe<OptionSet> {
        const dataElementOptionSet = dataElement.optionSet;
        const optionSet = dataElementOptionSet
            ? dataForm.optionSets.find(optionSet => optionSet.id === dataElementOptionSet.id)
            : undefined;
        return optionSet;
    }
    */
}
