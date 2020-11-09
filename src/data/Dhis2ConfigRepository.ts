import _ from "lodash";
import { ConfigRepository } from "../domain/repositories/ConfigRepository";
import { Config } from "../domain/entities/Config";
import { D2Api, Id } from "../types/d2-api";
import { keyById, NamedRef } from "../domain/entities/Base";
import { User } from "../domain/entities/User";

const baseConfig = {
    dataSetsNamePrefix: "NHWA Module",
    sqlViewName: "NHWA Data Comments",
    sectionOrderAttributeCode: "SECTION_ORDER",
    constantCode: "NHWA_COMMENTS",
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
                        dataElement: { id: true, name: true },
                    },
                },
                filter: { name: { ilike: baseConfig.dataSetsNamePrefix } },
            },
            constants: {
                fields: { description: true },
                filter: { code: { eq: baseConfig.constantCode } },
            },
            sqlViews: {
                fields: { id: true },
                filter: { name: { eq: baseConfig.sqlViewName } },
            },
            attributes: {
                fields: { id: true },
                filter: { code: { eq: baseConfig.sectionOrderAttributeCode } },
            },
        });
        const { dataSets, constants, sqlViews, attributes } = await metadata$.getData();

        const getDataValuesSqlView = sqlViews[0];
        if (!getDataValuesSqlView)
            throw new Error(`Cannot find sql view: ${baseConfig.sqlViewName}`);

        const sectionOrderAttribute = attributes[0];
        if (!sectionOrderAttribute)
            throw new Error(`Cannot find attribute: ${baseConfig.sectionOrderAttributeCode}`);

        const constant = constants[0];
        if (!constant) throw new Error(`Cannot find constant: ${baseConfig.constantCode}`);

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
        const json = JSON.parse(constant.description || "{}") as Constant;
        const sectionNames = json.sectionNames || {};
        if (!json.sections) {
            throw new Error("No sections info in constant");
        }

        const sections = _(json.sections)
            .values()
            .uniq()
            .sortBy()
            .map(sectionId => ({ id: sectionId, name: sectionNames[sectionId] || "" }))
            .value();

        const sectionsByDataSet = _(json.sections)
            .toPairs()
            .map(([entryId, sectionId]) => {
                const [dataSetId] = entryId.split(".");
                return { dataSetId, sectionId };
            })
            .groupBy(obj => obj.dataSetId)
            .mapValues(objs =>
                _(objs)
                    .map(obj => ({ id: obj.sectionId, name: sectionNames[obj.sectionId] || "" }))
                    .uniqBy(obj => obj.id)
                    .value()
            )
            .value();

        const currentUser: User = {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: d2User.organisationUnits,
            ...d2User.userCredentials,
        };

        const currentYear = new Date().getFullYear();

        return {
            dataSets: keyById(dataSets),
            currentUser,
            getDataValuesSqlView,
            sectionOrderAttribute,
            pairedDataElementsByDataSet: pairedDataElements,
            sections: keyById(sections),
            sectionsByDataSet,
            years: _.range(currentYear - 10, currentYear + 1).map(n => n.toString()),
        };
    }
}

function getNameOfDataElementWithValue(name: string): string {
    const s = "NHWA_" + name.replace(/NHWA_Comment of /, "");
    return s.replace(" - ", " for ");
}

function getCleanName(name: string): string {
    return name
        .replace(/[^\w]$/, "") // Remove trailing non-alphanumic characters
        .replace(/\s+/g, " ") // Replace &nbps (x160) characters by normal spaces
        .trim()
        .toLowerCase();
}

interface DataSet {
    id: Id;
    dataSetElements: Array<{ dataElement: NamedRef }>;
}

function getPairedMapping(dataSets: DataSet[]): Config["pairedDataElementsByDataSet"] {
    const dataElementsByName = _(dataSets)
        .flatMap(dataSet => dataSet.dataSetElements)
        .map(dse => dse.dataElement)
        .keyBy(de => getCleanName(de.name))
        .value();

    return _(dataSets)
        .map(dataSet => {
            const mapping = getMappingForDataSet(dataSet, dataElementsByName);
            return [dataSet.id, mapping] as [string, typeof mapping];
        })
        .fromPairs()
        .value();
}

function getMappingForDataSet(dataSet: DataSet, dataElementsByName: Record<string, NamedRef>) {
    return _(dataSet.dataSetElements)
        .map(dse => dse.dataElement)
        .filter(de => de.name.startsWith("NHWA_Comment of"))
        .map(de => {
            const name = getNameOfDataElementWithValue(de.name);
            const cleanName = getCleanName(name);
            const valueDataElement = dataElementsByName[cleanName];
            if (!valueDataElement) {
                console.error(`Value data element not found for comment:\n  ${name}`);
                return null;
            } else {
                return { dataValueVal: valueDataElement.id, dataValueComment: de.id };
            }
        })
        .compact()
        .value();
}

type Constant = Partial<{
    sections?: Record<Id, string>;
    sectionNames?: Record<string, string>;
}>;
