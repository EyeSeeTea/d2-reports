import { Ref } from "@eyeseetea/d2-api";
import { Id } from "./Base";

export interface Indicator {
    id: string;
    numerator: string;
    denominator: string;
    name: string;
    user: Ref;
    lastUpdated: string;
}
