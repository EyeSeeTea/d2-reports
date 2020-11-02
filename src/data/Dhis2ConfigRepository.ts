import _ from "lodash";
import { ConfigRepository } from "../domain/repositories/ConfigRepository";
import { Config } from "../domain/entities/Config";
import { D2Api, Id } from "../types/d2-api";
import { keyById, NamedRef } from "../domain/entities/Base";
import { User } from "../domain/entities/User";

const names = {
    dataSets: "NHWA Module",
    sqlView: "NHWA Data Comments",
};

export class Dhis2ConfigRepository implements ConfigRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<Config> {
        const toName = { $fn: { name: "rename", to: "name" } } as const;
        const metadata$ = this.api.metadata.get({
            dataSets: {
                fields: {
                    id: true,
                    displayName: toName,
                    dataSetElements: { dataElement: { id: true, name: true } },
                },
                filter: { name: { ilike: names.dataSets } },
            },
            sqlViews: {
                fields: { id: true },
                filter: { name: { eq: names.sqlView } },
            },
        });
        const { dataSets, sqlViews } = await metadata$.getData();
        if (_.isEmpty(sqlViews)) throw new Error(`Cannot find sql view: ${names.sqlView}`);

        const d2User = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    organisationUnits: {
                        id: true,
                        displayName: toName,
                        path: true,
                        level: true,
                    },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true },
                    },
                },
            })
            .getData();

        const pairedDataElements = getMapping(dataSets);

        const currentUser: User = {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: d2User.organisationUnits,
            ...d2User.userCredentials,
        };

        return {
            dataSets: keyById(dataSets),
            currentUser,
            // TODO: How to create/update dataView ?
            getDataValuesSqlView: { id: "gCvQF1yeC9f" }, // TODO: search
            pairedDataElementsByDataSet: pairedDataElements,
        };
    }
}

function getNameOfDataElementWithValue(name: string): string {
    const s = name.replace(/NHWA_Comment of /, "");
    return "NHWA_" + s.charAt(0).toUpperCase() + s.slice(1).trim();
}

function getMapping(
    dataSets: Array<{ id: Id; dataSetElements: Array<{ dataElement: NamedRef }> }>
): Config["pairedDataElementsByDataSet"] {
    return _(dataSets)
        .map(dataSet => {
            const dataElements = dataSet.dataSetElements.map(dse => dse.dataElement);
            const dataElementsByName = _.keyBy(dataElements, de => de.name.trim());

            const mapping = _(dataElements)
                .filter(de => de.name.startsWith("NHWA_Comment of"))
                .map(de => {
                    const valueDataElement =
                        dataElementsByName[getNameOfDataElementWithValue(de.name)];
                    if (!valueDataElement) {
                        console.debug(`Value data element not found for comment: ${de.name}`);
                        return null;
                    } else {
                        return { dataValueVal: valueDataElement.id, dataValueComment: de.id };
                    }
                })
                .compact()
                .value();
            return [dataSet.id, mapping] as const;
        })
        .fromPairs()
        .value();
}
