import { OrgUnit, OrgUnitPath } from "../entities/OrgUnit";

export interface OrgUnitsRepository {
    getFromPaths(paths: OrgUnitPath[]): Promise<OrgUnit[]>;
}
