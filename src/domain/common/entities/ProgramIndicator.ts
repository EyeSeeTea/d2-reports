import { Ref } from "./Base";

export interface ProgramIndicator {
    id: string;
    expression: string;
    filter: string;
    name: string;
    user: Ref;
    lastUpdated: string;
}
