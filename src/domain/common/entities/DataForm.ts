import { UnionFromValues } from "../../../utils/ts-utils";
import { Id, Ref } from "./Base";
import { DataElement } from "./DataElement";

export interface DataForm {
    id: Id;
    dataElements: DataElement[];
    sections: Section[];
    texts: { header: string; footer: string };
    options: {
        dataElements: Record<Id, { widget: "dropdown" | "radio" }>;
    };
}

export type ViewType = UnionFromValues<typeof DataFormM.viewTypes>;

export interface Section extends Ref {
    name: string;
    dataElements: DataElement[];
    viewType: ViewType;
}

const viewTypes = ["grid", "table"] as const;

export class DataFormM {
    static viewTypes = viewTypes;
}
