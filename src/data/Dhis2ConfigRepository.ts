import _ from "lodash";
import { ConfigRepository } from "../domain/repositories/ConfigRepository";
import { Config } from "../domain/entities/Config";
import { D2Api, Id } from "../types/d2-api";
import { keyById, NamedRef } from "../domain/entities/Base";
import { User } from "../domain/entities/User";

const names = {
    dataSetsPrefix: "NHWA Module",
    dataElementGroupsPrefix: "NHWA Module",
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
                    dataSetElements: {
                        dataElement: {
                            id: true,
                            name: true,
                            dataElementGroups: { id: true, displayName: toName },
                        },
                    },
                },
                filter: { name: { ilike: names.dataSetsPrefix } },
            },
            dataElementGroups: {
                fields: {
                    id: true,
                    displayName: toName,
                },
                filter: { name: { ilike: names.dataElementGroupsPrefix } },
            },
            sqlViews: {
                fields: { id: true },
                filter: { name: { eq: names.sqlView } },
            },
        });
        const { dataSets, dataElementGroups, sqlViews } = await metadata$.getData();

        if (_.isEmpty(sqlViews)) throw new Error(`Cannot find sql view: ${names.sqlView}`);
        const getDataValuesSqlView = sqlViews[0];

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

        const pairedDataElements = getPairedMapping(dataSets);

        const currentUser: User = {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: d2User.organisationUnits,
            ...d2User.userCredentials,
        };

        return {
            dataSets: keyById(dataSets),
            dataElementGroups: keyById(dataElementGroups),
            currentUser,
            getDataValuesSqlView,
            pairedDataElementsByDataSet: pairedDataElements,
            dataElementGroupsByDataSet: getDataElementGroupsByDataSet(dataSets),
        };
    }
}

function getNameOfDataElementWithValue(name: string): string {
    const s = "NHWA_" + name.replace(/NHWA_Comment of /, "");
    return s.replace(" - ", " for ");
}

function getCleanName(name: string): string {
    return name
        .replace(/[^\w]$/, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

interface DataSet {
    id: Id;
    dataSetElements: Array<{ dataElement: NamedRef & { dataElementGroups: NamedRef[] } }>;
}

function getDataElementGroupsByDataSet(dataSets: DataSet[]): Config["dataElementGroupsByDataSet"] {
    return _(dataSets)
        .map(dataSet => {
            const degs = _(dataSet.dataSetElements)
                .flatMap(dse => dse.dataElement.dataElementGroups)
                .value();
            return [dataSet.id, degs] as [Id, typeof degs];
        })
        .fromPairs()
        .value();
}

function getPairedMapping(dataSets: DataSet[]): Config["pairedDataElementsByDataSet"] {
    return _(dataSets)
        .map(dataSet => {
            const mapping = getMappingForDataSet(dataSet);
            return [dataSet.id, mapping] as [string, typeof mapping];
        })
        .fromPairs()
        .value();
}

function getMappingForDataSet(dataSet: DataSet) {
    const dataElements = dataSet.dataSetElements.map(dse => dse.dataElement);
    const dataElementsByName = _.keyBy(dataElements, de => getCleanName(de.name));

    return _(dataElements)
        .filter(de => de.name.startsWith("NHWA_Comment of"))
        .map(de => {
            const nameC = getCleanName(getNameOfDataElementWithValue(de.name));
            const valueDataElement = dataElementsByName[nameC];
            if (!valueDataElement) {
                console.error(`Value data element not found for comment:\n  ${nameC}`);
                return null;
            } else {
                return { dataValueVal: valueDataElement.id, dataValueComment: de.id };
            }
        })
        .compact()
        .value();
}
