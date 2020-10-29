import _ from "lodash";
import { Id } from "./Base";

type Path = string;

export interface OrgUnit {
    id: string;
    path: Path;
    name: string;
    level: number;
}

export function getRoots(orgUnits: OrgUnit[]): OrgUnit[] {
    const minLevel = _.min(orgUnits.map(ou => ou.level));
    return _(orgUnits)
        .filter(ou => ou.level === minLevel)
        .sortBy(ou => ou.name)
        .value();
}

export function getRootIds(orgUnits: OrgUnit[]): Id[] {
    return getRoots(orgUnits).map(ou => ou.id);
}

export function getPath(orgUnits: OrgUnit[]): Path | undefined {
    return getRoots(orgUnits).map(ou => ou.path)[0];
}
