import _ from "lodash";
import { keyById, NamedRef } from "../domain/common/entities/Base";
import { Config } from "../domain/common/entities/Config";
import { User } from "../domain/common/entities/User";
import { ConfigRepository } from "../domain/common/repositories/ConfigRepository";
import { D2Api, Id } from "../types/d2-api";

const SQL_VIEW_DATA_COMMENTS_NAME = "NHWA Data Comments";
const SQL_VIEW_DATA_APPROVAL_NAME = "NHWA Data Approval Status";
const SQL_VIEW_DATA_DUPLICATION_NAME = "MAL Data Approval Status";

const base = {
    dataSets: { namePrefix: "MAL - WMR Form", nameExcluded: /_APPROVED$/ },

    sqlViewNames: [SQL_VIEW_DATA_COMMENTS_NAME, SQL_VIEW_DATA_APPROVAL_NAME, SQL_VIEW_DATA_DUPLICATION_NAME],
    constantCode: "NHWA_COMMENTS",
    approvalWorkflows: { namePrefix: "MAL" },
};

export class Dhis2ConfigRepository implements ConfigRepository {
    constructor(private api: D2Api) { }

    async get(): Promise<Config> {
        const { dataSets, constants, sqlViews, dataApprovalWorkflows } = await this.getMetadata();
        const filteredDataSets = getFilteredDataSets(dataSets);
        const dataCommentsSqlView = sqlViews.find(({ name }) => name === SQL_VIEW_DATA_COMMENTS_NAME);
        const dataApprovalSqlView = sqlViews.find(({ name }) => name === SQL_VIEW_DATA_APPROVAL_NAME);
        const dataDuplicationSqlView = sqlViews.find(({ name }) => name === SQL_VIEW_DATA_DUPLICATION_NAME);
        if (!dataCommentsSqlView) {
            throw new Error(`Missing SQL views: ${SQL_VIEW_DATA_COMMENTS_NAME}`);
        }

        if (!dataApprovalSqlView) {
            throw new Error(`Missing SQL views: ${SQL_VIEW_DATA_APPROVAL_NAME}`);
        }
        if (!dataDuplicationSqlView) {
            throw new Error(`Missing SQL views: ${SQL_VIEW_DATA_DUPLICATION_NAME}`);
        }

        const constant = getNth(constants, 0, `Missing constant: ${base.constantCode}`);
        const currentUser = await this.getCurrentUser();
        const pairedDataElements = getPairedMapping(filteredDataSets);
        const constantData = JSON.parse(constant.description || "{}") as Constant;
        const { sections, sectionsByDataSet } = getSectionsInfo(constantData);
        const currentYear = new Date().getFullYear();

        return {
            dataSets: keyById(filteredDataSets),
            currentUser,
            dataCommentsSqlView,
            dataApprovalSqlView,
            dataDuplicationSqlView,
            pairedDataElementsByDataSet: pairedDataElements,
            sections: keyById(sections),
            sectionsByDataSet,
            years: _.range(currentYear - 10, currentYear + 1).map(n => n.toString()),
            approvalWorkflow: dataApprovalWorkflows,
        };
    }

    getMetadata() {
        const metadata$ = this.api.metadata.get({
            dataSets: {
                fields: {
                    id: true,
                    displayName: toName,
                    dataSetElements: {
                        dataElement: { id: true, name: true },
                    },
                },
                filter: { name: { $ilike: base.dataSets.namePrefix } },
            },
            constants: {
                fields: { description: true },
                filter: { code: { eq: base.constantCode } },
            },
            sqlViews: {
                fields: { id: true, name: true },
                filter: { name: { in: base.sqlViewNames } },
            },
            dataApprovalWorkflows: {
                fields: { id: true, name: true },
                filter: { name: { $ilike: base.approvalWorkflows.namePrefix } },
            },
        });

        return metadata$.getData();
    }

    async getCurrentUser(): Promise<User> {
        const d2User = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    dataViewOrganisationUnits: {
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

        return {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: d2User.dataViewOrganisationUnits,
            ...d2User.userCredentials,
        };
    }
}

interface DataSet {
    id: Id;
    dataSetElements: Array<{ dataElement: NamedRef }>;
}

type Constant = Partial<{
    sections?: Record<Id, string>;
    sectionNames?: Record<string, string>;
}>;

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

function getNth<T>(objs: T[], n: number, msg: string): T {
    const obj = objs[n];
    if (!obj) throw new Error(msg);
    return obj;
}

function getSectionsInfo(constantData: Constant) {
    const sectionNames = constantData.sectionNames || {};
    const jsonSections = constantData.sections || {};

    const sections = _(jsonSections)
        .values()
        .uniq()
        .sortBy()
        .map(sectionId => ({ id: sectionId, name: sectionNames[sectionId] || "" }))
        .value();

    const sectionsByDataSet = _(jsonSections)
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

    return { sections, sectionsByDataSet };
}

function getFilteredDataSets<DataSet extends NamedRef>(dataSets: DataSet[]): DataSet[] {
    const { namePrefix, nameExcluded } = base.dataSets;
    return dataSets.filter(({ name }) => name.startsWith(namePrefix) && !name.match(nameExcluded));
}

const toName = { $fn: { name: "rename", to: "name" } } as const;
