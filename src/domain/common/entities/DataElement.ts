import { Maybe } from "../../../utils/ts-utils";
import { Code, Id } from "./Base";

export type DataElement = DataElementBoolean | DataElementNumber | DataElementText | DataElementFile | DataElementDate;

interface DataElementBase {
    id: Id;
    code: Code;
    name: string;
    description: string;
    options: Options;
}

export interface DataElementBoolean extends DataElementBase {
    type: "BOOLEAN";
    isTrueOnly: boolean;
}

export interface DataElementNumber extends DataElementBase {
    type: "NUMBER";
    numberType: NumberType;
}

export interface DataElementText extends DataElementBase {
    type: "TEXT";
}

export interface DataElementFile extends DataElementBase {
    type: "FILE";
}

export interface DataElementDate extends DataElementBase {
    type: "DATE";
}

type Options = Maybe<{ isMultiple: boolean; items: Option<string>[] }>;

type NumberType =
    | "NUMBER"
    | "INTEGER_ZERO_OR_POSITIVE"
    | "INTEGER"
    | "INTEGER_NEGATIVE"
    | "INTEGER_POSITIVE"
    | "INTEGER_ZERO_OR_POSITIVE";

export type DataElementType = DataElement["type"];

export interface Option<Value> {
    name: string;
    value: Value;
}

export type dataInputPeriodsType = Maybe<
    Array<{
        closingDate?: string;
        openingDate?: string;
        period: {
            id: string;
        };
    }>
>;
