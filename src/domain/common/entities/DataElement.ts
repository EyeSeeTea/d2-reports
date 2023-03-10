import { Maybe } from "../../../utils/ts-utils";
import { Code, Id } from "./Base";

export type DataElement = DataElementBoolean | DataElementNumber | DataElementText;

interface DataElementBase {
    id: Id;
    code: Code;
    name: string;
}

export interface DataElementBoolean extends DataElementBase {
    type: "BOOLEAN";
    options: Options;
    isTrueOnly: boolean;
}

export interface DataElementNumber extends DataElementBase {
    type: "NUMBER";
    numberType: NumberType;
    options: Options;
}

export interface DataElementText extends DataElementBase {
    type: "TEXT";
    options: Options;
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
