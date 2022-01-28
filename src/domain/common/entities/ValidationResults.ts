import { Indicator } from "./Indicator";
import { ProgramIndicator } from "./ProgramIndicator";


export interface ValidationResults {
    metadataType: "Indicator"|"ProgramIndicator";
    id: string;
    name: string;
    item: Indicator | ProgramIndicator;
    expression: boolean | undefined;
    numerator: boolean | undefined;
    denominator: boolean | undefined;
    filter: boolean | undefined;
}