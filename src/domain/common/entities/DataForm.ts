import _ from "lodash";
import { Maybe, UnionFromValues } from "../../../utils/ts-utils";
import { Id } from "./Base";
import { DataElement } from "./DataElement";
import { Period } from "./DataValue";

export interface DataForm {
    id: Id;
    dataElements: DataElement[];
    sections: Section[];
    texts: { header: Maybe<string>; footer: Maybe<string> };
    options: {
        dataElements: Record<Id, { widget: "dropdown" | "radio" }>;
    };
}

const viewTypes = ["grid", "table", "grid-with-periods"] as const;
export type ViewType = UnionFromValues<typeof DataFormM.viewTypes>;

export interface SectionBase {
    id: Id;
    name: string;
    dataElements: DataElement[];
    toggle: { type: "none" } | { type: "dataElement"; dataElement: DataElement };
    description: string;
}

export interface SectionSimple extends SectionBase {
    viewType: "table" | "grid";
}

export interface SectionWithPeriods extends SectionBase {
    viewType: "grid-with-periods";
    periods: string[];
}

export type Section = SectionSimple | SectionWithPeriods;

export class DataFormM {
    static viewTypes = viewTypes;

    static getReferencedPeriods(dataForm: DataForm, basePeriod: Period): Period[] {
        return _(dataForm.sections)
            .flatMap(section => {
                switch (section.viewType) {
                    case "grid-with-periods":
                        return section.periods;
                    default:
                        return [];
                }
            })
            .uniq()
            .concat([basePeriod])
            .sortBy()
            .value();
    }
}
