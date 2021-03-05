import { OrgUnitPath, OrgUnit, getOrgUnitIdsFromPaths } from "../domain/entities/OrgUnit";
import { OrgUnitsRepository } from "../domain/repositories/OrgUnitsRepository";
import { D2Api } from "../types/d2-api";

export class Dhis2OrgUnitsRepository implements OrgUnitsRepository {
    constructor(private api: D2Api) {}

    async getFromPaths(paths: OrgUnitPath[]): Promise<OrgUnit[]> {
        const ids = getOrgUnitIdsFromPaths(paths);

        const { organisationUnits } = await this.api.metadata
            .get({
                organisationUnits: {
                    filter: { id: { in: ids } },
                    fields: { id: true, path: true, name: true, level: true },
                },
            })
            .getData();

        return organisationUnits;
    }
}
