import { Id, Ref } from "./Base";
import { DataElement } from "./DataElement";

export interface DataForm {
    id: Id;
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
