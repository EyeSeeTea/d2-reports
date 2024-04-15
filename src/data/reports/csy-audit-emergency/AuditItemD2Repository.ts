import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem, AuditType } from "../../../domain/reports/csy-audit-emergency/entities/AuditItem";
import {
    CSYAuditEmergencyOptions as GetAuditOptions,
    AuditItemRepository,
} from "../../../domain/reports/csy-audit-emergency/repositories/AuditRepository";
import { D2Api, Pager } from "../../../types/d2-api";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";
import { Id } from "../../../domain/common/entities/Base";
import {
    AuditAnalyticsData,
    AuditAnalyticsResponse,
    buildRefs,
    getEventQueryString,
} from "../../../domain/common/entities/AuditAnalyticsResponse";
import { isValueInUnionType, Maybe, UnionFromValues } from "../../../types/utils";

const auditTypes = ["overall-mortality", "low-acuity", "highest-triage", "initial-rbg", "shock-ivf"] as const;
type AuditTyp = UnionFromValues<typeof auditTypes>;
if (isValueInUnionType("overall-mortality", auditTypes)) {
    const ab = "overall-mortality";
}

export class AuditItemD2Repository implements AuditItemRepository {
    constructor(private api: D2Api) {}

    async get(options: GetAuditOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging, year, orgUnitPaths, quarter, auditType } = options;
        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);

        try {
            const auditItems = await this.getAuditItems(auditType, orgUnitIds, period);

            const rowsInPage = _(auditItems)
                .drop((paging.page - 1) * paging.pageSize)
                .take(paging.pageSize)
                .value();

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(auditItems.length / paging.pageSize),
                total: auditItems.length,
            };

            return { pager, objects: rowsInPage };
        } catch (error) {
            console.debug(error);
            return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };
        }
    }

    private async getAuditItems(auditType: AuditType, orgUnitIds: string[], period: string): Promise<AuditItem[]> {
        const queryStrings = auditQueryStrings[auditType];
        const analyticsResponse = _(
            await promiseMap(
                queryStrings,
                async queryString =>
                    await promiseMap(orgUnitIds, async orgUnitId => {
                        const eventQueryString = getEventQueryString(
                            metadata.programs.emergencyCareProgramId,
                            metadata.programStages.emergencyCareProgramStageId,
                            orgUnitId,
                            period,
                            queryString
                        );
                        const analyticsResponse = await this.api
                            .get<AuditAnalyticsResponse>(eventQueryString)
                            .getData();

                        return new AuditAnalyticsData(analyticsResponse);
                    })
            )
        )
            .flatten()
            .value();

        return this.getAuditItemsByAuditType(auditType, analyticsResponse);
    }

    private getRegisterIds(data: Maybe<AuditAnalyticsData>, id: Id): string[] {
        return data ? data.getColumnValues(id) : [];
    }

    private getAuditItemsByAuditType(auditType: AuditType, data: AuditAnalyticsData[]): AuditItem[] {
        return buildRefs(this.getMatchedIds(auditType, data));
    }

    private getMatchedIds(auditType: AuditType, data: AuditAnalyticsData[]): string[] {
        const { arrivalDateId, etaRegistryId, firstProviderDateId, glucoseId, ivfId } = metadata.dataElements;

        switch (auditType) {
            case "overall-mortality": {
                const [euMortalityData, facilityMortalityData] = data;

                const euMortalityIds = this.getRegisterIds(euMortalityData, etaRegistryId);
                const facilityMortalityIds = this.getRegisterIds(facilityMortalityData, etaRegistryId);

                return _.compact(_.union(euMortalityIds, facilityMortalityIds));
            }
            case "low-acuity": {
                const [triageCategoryData, euDispoICUData] = data;

                const triageCategoryIds = this.getRegisterIds(triageCategoryData, etaRegistryId);
                const euDispoICUIds = this.getRegisterIds(euDispoICUData, etaRegistryId);

                return _.intersection(triageCategoryIds, euDispoICUIds);
            }
            case "highest-triage": {
                const [triageCategoryData, arrivalDateData, firstProviderDateData] = data;

                const triageCategoryIds = this.getRegisterIds(triageCategoryData, etaRegistryId);
                const dateIds = this.getRegisterIds(arrivalDateData, etaRegistryId);
                const arrivalDateIds = this.getRegisterIds(arrivalDateData, arrivalDateId);
                const providerDateIds = this.getRegisterIds(firstProviderDateData, firstProviderDateId);

                const arrivalDates = _.map(arrivalDateIds, arrivalDate => new Date(arrivalDate));
                const providerDates = _.map(providerDateIds, providerDate => new Date(providerDate));

                const timeDiffIds = _.filter(dateIds, (_, index) => {
                    const arrivalDate = arrivalDates[index]?.getTime() ?? 0;
                    const providerDate = providerDates[index]?.getTime() ?? 0;

                    return providerDate - arrivalDate > 1800000;
                });

                return _.intersection(triageCategoryIds, timeDiffIds);
            }
            case "initial-rbg": {
                const [initialRBGData, glucoseData] = data;

                const initialRBGIds = this.getRegisterIds(initialRBGData, etaRegistryId);
                const glucoseInEUIds = this.getRegisterIds(glucoseData, etaRegistryId);
                const glucoseEventIds = this.getRegisterIds(glucoseData, glucoseId);

                const glucoseNotTickedIds = _.filter(glucoseInEUIds, (_, index) => glucoseEventIds[index] !== "1");

                return _.intersection(initialRBGIds, glucoseNotTickedIds);
            }
            case "shock-ivf": {
                const [ageGreaterThan16Data, ageCategoryAdultUnknownData, initialSBPData, ivfData] = data;

                const ageGreaterThan16Ids = this.getRegisterIds(ageGreaterThan16Data, etaRegistryId);
                const ageCategoryAdultUnknownIds = this.getRegisterIds(ageCategoryAdultUnknownData, etaRegistryId);
                const initialSBPIds = this.getRegisterIds(initialSBPData, etaRegistryId);
                const ivfInEUIds = this.getRegisterIds(ivfData, etaRegistryId);
                const ivfEventIds = this.getRegisterIds(ivfData, ivfId);

                const ageAdultIds = _.union(ageGreaterThan16Ids, ageCategoryAdultUnknownIds);
                const ivfNotTickedIds = _.filter(ivfInEUIds, (_, index) => ivfEventIds[index] !== "1");

                return _.intersection(ageAdultIds, initialSBPIds, ivfNotTickedIds);
            }
            default:
                return [];
        }
    }

    async save(filename: string, items: AuditItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): AuditItemRow => ({
                registerId: dataValue.registerId,
            })
        );
        const timestamp = new Date().toISOString();
        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = `Time: ${timestamp}\n` + csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const metadata = {
    programs: {
        emergencyCareProgramId: "zdyu1RXVKg3",
    },
    programStages: {
        emergencyCareProgramStageId: "o8Hw1OCD7Tr",
    },
    dataElements: {
        etaRegistryId: "QStbireWKjW",
        euDispositionId: "ijG1c7IqeZb",
        facilityDispositionId: "CZhIs5wGCiz",
        triageCategoryId: "wfFqGrIfAa4",
        arrivalDateId: "xCMeFQWSPCb",
        firstProviderDateId: "yJfWxXN5Rel",
        glucoseId: "BhjTEQUYYO9",
        initialRBGId: "bN3ZHmLQX4r",
        ageInYearsId: "aZCay6g4LX6",
        ageCategoryId: "PaU3O4hknYt",
        initialSBPId: "hWdpU2Wqfvy",
        ivfId: "neKXuzIRaFm",
    },
    optionSets: {
        euDispoICU: "6",
        euDispoMortuaryOrDied: "7",
        facilityDispoMortuaryOrDied: "5",
        triageRed: "1",
        triageGreen: "3",
        triageCategory1: "6",
        triageCategory4: "9",
        triageCategory5: "10",
        triageLevelI: "11",
        triageLevelII: "12",
        triageCategoryLevelIV: "14",
        triageCategoryLevelV: "15",
        triageImmediateRed1: "16",
        triageStandardGreen4: "19",
        triageNonUrgentBlue5: "20",
        triageLevel1: "21",
        triageLevel2: "22",
        triageLevel4: "24",
        triageLevel5: "25",
        triageImmediateRed: "27",
        triageMinorGreen: "29",
        triagePriority1: "32",
        triagePriority3: "34",
        rbgLow: "3",
    },
};

const csvFields = ["registerId"] as const;
type CsvField = typeof csvFields[number];
type AuditItemRow = Record<CsvField, string>;

const auditQueryStrings = {
    "overall-mortality": [
        `&dimension=${metadata.dataElements.euDispositionId}:IN:${metadata.optionSets.euDispoMortuaryOrDied}`,
        `&dimension=${metadata.dataElements.facilityDispositionId}:IN:${metadata.optionSets.facilityDispoMortuaryOrDied}`,
    ],
    "low-acuity": [
        `&dimension=${metadata.dataElements.triageCategoryId}:IN:
            ${metadata.optionSets.triageGreen};
            ${metadata.optionSets.triageCategory4};
            ${metadata.optionSets.triageCategory5};
            ${metadata.optionSets.triageCategoryLevelIV};
            ${metadata.optionSets.triageCategoryLevelV};
            ${metadata.optionSets.triageStandardGreen4};
            ${metadata.optionSets.triageNonUrgentBlue5};
            ${metadata.optionSets.triageLevel4};
            ${metadata.optionSets.triageLevel5};
            ${metadata.optionSets.triageMinorGreen};
            ${metadata.optionSets.triagePriority3}`,
        `&dimension=${metadata.dataElements.euDispositionId}:IN:${metadata.optionSets.euDispoICU}`,
    ],
    "highest-triage": [
        `&dimension=${metadata.dataElements.triageCategoryId}:IN:
            ${metadata.optionSets.triageRed};
            ${metadata.optionSets.triageCategory1};
            ${metadata.optionSets.triageLevelI};
            ${metadata.optionSets.triageLevelII};
            ${metadata.optionSets.triageImmediateRed1};
            ${metadata.optionSets.triageLevel1};
            ${metadata.optionSets.triageLevel2};
            ${metadata.optionSets.triageImmediateRed};
            ${metadata.optionSets.triagePriority1}`,
        `&dimension=${metadata.dataElements.arrivalDateId}`,
        `&dimension=${metadata.dataElements.firstProviderDateId}`,
    ],
    "initial-rbg": [
        `&dimension=${metadata.dataElements.initialRBGId}:IN:${metadata.optionSets.rbgLow}`,
        `&dimension=${metadata.dataElements.glucoseId}`,
    ],
    "shock-ivf": [
        `&dimension=${metadata.dataElements.ageInYearsId}:GE:16`,
        `&dimension=${metadata.dataElements.ageCategoryId}:IN:3`,
        `&dimension=${metadata.dataElements.initialSBPId}:LT:90`,
        `&dimension=${metadata.dataElements.ivfId}`,
    ],
};
