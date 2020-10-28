import { Id, NamedRef } from "./Base";

export interface Config {
    dataSets: Record<Id, NamedRef>;
}
