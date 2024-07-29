import _ from "lodash";
import { emptyPage, paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem, AuditType } from "../../../domain/reports/csy-audit-trauma/entities/AuditItem";
import { D2Api } from "../../../types/d2-api";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";
import {
    AuditOptions,
    AuditItemRepository,
} from "../../../domain/reports/csy-audit-trauma/repositories/AuditItemRepository";
import { Id } from "../../../domain/common/entities/Base";
import {
    AuditAnalyticsData,
    AuditAnalyticsResponse,
    buildRefs,
    getEventQueryString,
} from "../../../domain/common/entities/AuditAnalyticsResponse";
import { Maybe } from "../../../types/utils";

export class AuditItemD2Repository implements AuditItemRepository {
    constructor(private api: D2Api) {}

    async get(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging, year, orgUnitPaths, quarter, auditType } = options;
        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);

        if (_.isEmpty(orgUnitIds)) return emptyPage;
        const auditItems = await this.getAuditItems(auditType, orgUnitIds, period);

        return paginate(auditItems, paging);
    }

    private async getAuditItems(auditType: AuditType, orgUnitIds: string[], period: string): Promise<AuditItem[]> {
        const queryStrings = auditQueryStrings[auditType];

        const analyticsResponse = await promiseMap(queryStrings, async queryString => {
            const { programs, programStages } = metadata;
            const eventQueryString = getEventQueryString(
                programs.traumaCareProgramId,
                programStages.traumaCareProgramStageId,
                orgUnitIds.join(";"),
                period,
                queryString
            );

            const analyticsResponse = await this.api.get<AuditAnalyticsResponse>(eventQueryString).getData();

            return new AuditAnalyticsData(analyticsResponse);
        });

        return this.getAuditItemsByAuditType(auditType, analyticsResponse);
    }

    private getRegisterIds(response: Maybe<AuditAnalyticsData>, id: Id): string[] {
        return response ? response.getColumnValues(id) : [];
    }

    private getAuditItemsByAuditType(auditType: AuditType, data: AuditAnalyticsData[]): AuditItem[] {
        return buildRefs(this.getMatchedIds(auditType, data));
    }

    private getMatchedIds(auditType: AuditType, data: AuditAnalyticsData[]): string[] {
        const { dataElements, programIndicators } = metadata;
        const { etaRegistryId, initialAVPUId, initialGCSId } = dataElements;
        const { gapEvents, ktsEvents, mgapEvents, rtsEvents } = programIndicators;

        switch (auditType) {
            case "mortality": {
                const [euDispoData, facilityDispoData, scoreData] = data;
                if (!scoreData) return [];

                const scoreIds = _(scoreData.rows)
                    .map(row => {
                        const gapColumnIndex = scoreData.getColumnIndex(gapEvents);
                        const mgapColumnIndex = scoreData.getColumnIndex(rtsEvents);
                        const rtsColumnIndex = scoreData.getColumnIndex(rtsEvents);
                        const ktsColumnIndex = scoreData.getColumnIndex(ktsEvents);

                        const gapValue = Number(row[gapColumnIndex]);
                        const mgapValue = Number(row[mgapColumnIndex]);
                        const rtsValue = Number(row[rtsColumnIndex]);
                        const ktsValue = Number(row[ktsColumnIndex]);

                        // for (GAP=19-24) OR (MGAP=23-29) OR (RTS=11-12) OR (KTS=14-16)
                        if (
                            (gapValue >= 19 && gapValue <= 24) ||
                            (mgapValue >= 23 && mgapValue <= 29) ||
                            (rtsValue >= 11 && rtsValue <= 12) ||
                            (ktsValue >= 14 && ktsValue <= 16)
                        ) {
                            const registryIdColumnIndex = scoreData.getColumnIndex(etaRegistryId);

                            return row[registryIdColumnIndex];
                        }

                        return undefined;
                    })
                    .compact()
                    .value();

                const euDispoIds = this.getRegisterIds(euDispoData, etaRegistryId);
                const facilityDispoIds = this.getRegisterIds(facilityDispoData, etaRegistryId);
                const mortality = _.union(euDispoIds, facilityDispoIds);

                return _.intersection(mortality, scoreIds);
            }
            case "hypoxia": {
                const [euProcedureData, oxygenMethData, oxygenSaturationData] = data;

                const euProcedureIds = this.getRegisterIds(euProcedureData, etaRegistryId);
                const oxMethIds = this.getRegisterIds(oxygenMethData, etaRegistryId);
                const oxSatIds = this.getRegisterIds(oxygenSaturationData, etaRegistryId);

                return _.union(_.intersection(euProcedureIds, oxMethIds), oxSatIds);
            }
            case "tachypnea": {
                const [euProcedureData, spontaneousRR30Data, spontaneousRR12Data] = data;

                const euProcedureIds = this.getRegisterIds(euProcedureData, etaRegistryId);
                const spontaneousRR30 = this.getRegisterIds(spontaneousRR30Data, etaRegistryId);
                const spontaneousRR12 = this.getRegisterIds(spontaneousRR12Data, etaRegistryId);

                return _.union(spontaneousRR30, spontaneousRR12).filter(item => !euProcedureIds.includes(item));
            }
            case "mental": {
                const [euProcedureData, mentalData] = data;
                if (!mentalData) return [];

                const euProcedureIds = this.getRegisterIds(euProcedureData, etaRegistryId);
                const rows = mentalData.rows;

                const gcsColumnIndex = mentalData.getColumnIndex(initialGCSId);
                const avpuColumnIndex = mentalData.getColumnIndex(initialAVPUId);
                const registryIdColumnIndex = mentalData.getColumnIndex(etaRegistryId);

                const gcsAndAvpuIds = _(rows)
                    .map(row => {
                        if (Number(row[gcsColumnIndex]) < 8 || [3, 4].includes(Number(row[avpuColumnIndex]))) {
                            return row[registryIdColumnIndex];
                        }
                        return undefined;
                    })
                    .compact()
                    .value();

                return gcsAndAvpuIds.filter(item => !euProcedureIds.includes(item));
            }
            case "allMortality": {
                const [euDispoData, facilityDispoData] = data;

                const euMortIds = this.getRegisterIds(euDispoData, etaRegistryId);
                const facilityMortIds = this.getRegisterIds(facilityDispoData, etaRegistryId);

                return _.union(euMortIds, facilityMortIds);
            }
            case "emergencyUnit": {
                const [euDispoData] = data;

                return this.getRegisterIds(euDispoData, etaRegistryId);
            }
            case "hospitalMortality": {
                const [facilityDispoData] = data;

                return this.getRegisterIds(facilityDispoData, etaRegistryId);
            }
            case "severeInjuries": {
                const [gapData, rtsData, ktsInjuriesData, ktsIccData, mgapDetailsData, mgapIccData] = data;

                // audit definition = (KTS<11) OR (MGAP=3-17) OR (GAP=3-10) OR (RTS≤3)
                const gapIds = this.getRegisterIds(gapData, etaRegistryId);
                const rtsIds = this.getRegisterIds(rtsData, etaRegistryId);
                const ktsIds = this.combineScores(etaRegistryId, ktsEvents, ktsInjuriesData, ktsIccData, 0, 10);
                const mgapIds = this.combineScores(etaRegistryId, mgapEvents, mgapDetailsData, mgapIccData, 3, 17);

                return _.intersection(..._.filter([gapIds, rtsIds, ktsIds, mgapIds], ids => !_.isEmpty(ids)));
            }
            case "moderateSevereInjuries": {
                const [gapData, rtsData, ktsInjuriesData, ktsIccData, mgapDetailsData, mgapIccData] = data;

                // audit definition = (KTS≤13) OR (MGAP≤22) OR (GAP≤18) OR (RTS≤10)
                const gapIds = this.getRegisterIds(gapData, etaRegistryId);
                const rtsIds = this.getRegisterIds(rtsData, etaRegistryId);
                const ktsIds = this.combineScores(etaRegistryId, ktsEvents, ktsInjuriesData, ktsIccData, 0, 13);
                const mgapIds = this.combineScores(etaRegistryId, mgapEvents, mgapDetailsData, mgapIccData, 3, 22);

                return _.intersection(..._.filter([gapIds, rtsIds, ktsIds, mgapIds], ids => !_.isEmpty(ids)));
            }
            case "moderateInjuries": {
                const [gapData, rtsData, ktsInjuriesData, ktsIccData, mgapDetailsData, mgapIccData] = data;

                // audit definition = (KTS=11-13) OR (MGAP=18-22) OR (GAP=11-18) OR (RTS=4-10)
                const gapIds = this.getRegisterIds(gapData, etaRegistryId);
                const rtsIds = this.getRegisterIds(rtsData, etaRegistryId);
                const ktsIds = this.combineScores(etaRegistryId, ktsEvents, ktsInjuriesData, ktsIccData, 11, 13);
                const mgapIds = this.combineScores(etaRegistryId, mgapEvents, mgapDetailsData, mgapIccData, 18, 22);

                return _.intersection(..._.filter([gapIds, rtsIds, ktsIds, mgapIds], ids => !_.isEmpty(ids)));
            }
            default:
                return [];
        }
    }

    private combineScores(
        sharedUid: string,
        columnUid: string,
        scores1Data: Maybe<AuditAnalyticsData>,
        scores2Data: Maybe<AuditAnalyticsData>,
        minValue: number,
        maxValue: number
    ): string[] {
        if (!scores1Data || !scores2Data) return [];

        const column1Ids = this.getRegisterIds(scores1Data, sharedUid);
        const column2Ids = this.getRegisterIds(scores2Data, sharedUid);
        const sharedIds = _.intersection(column1Ids, column2Ids);

        const ids: Record<string, string> = {};
        this.getScoreIds(columnUid, sharedUid, scores1Data, sharedIds, ids);
        this.getScoreIds(columnUid, sharedUid, scores2Data, sharedIds, ids);

        return _(ids)
            .omitBy((value: string) => parseInt(value) >= minValue && parseInt(value) <= maxValue)
            .values()
            .compact()
            .value();
    }

    private getScoreIds(
        columnUid: string,
        sharedUid: string,
        scoresData: AuditAnalyticsData,
        sharedIds: string[],
        ids: Record<string, string>
    ) {
        const columnIndex = scoresData.getColumnIndex(columnUid);
        const sharedColumnIndex = scoresData.getColumnIndex(sharedUid);

        _.forEach(scoresData.rows, row => {
            const rowValue = row[columnIndex] ?? "";
            const rowValueShared = row[sharedColumnIndex] ?? "";

            if (sharedIds.includes(rowValueShared)) {
                ids[rowValueShared] = rowValue;
            }
        });
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
        traumaCareProgramId: "auqdJ66DqAT",
    },
    programStages: {
        traumaCareProgramStageId: "mnNpBtanIQo",
    },
    dataElements: {
        etaRegistryId: "QStbireWKjW",
        euDispositionId: "ijG1c7IqeZb",
        facilityDispositionId: "CZhIs5wGCiz",
        euProceduresId: "AlkbwOe8hCK",
        oxygenAdminId: "RBQXVln19aY",
        initialOxygenSaturationId: "pvnRZkpycwP",
        initialSpontaneousRRId: "CVodhbK2wQ2",
        initialGCSId: "WJE7ozQ21LA",
        initialAVPUId: "kj3SOKykiDg",
    },
    programIndicators: {
        ktsEvents: "UQ8ENntnDDd",
        mgapEvents: "O38wkAQbK9z",
        rtsEvents: "NebmxV8fnTD",
        gapEvents: "h0XlP7VstW7",
        ktsFilterSevereInjuries: "lbnI2bNoDVO",
        ktsFilterInitialConditions: "W7WKKF11CDB",
        mgapFilterInjuryDetails: "NCvjnccLi17",
        mgapFilterInitialConditions: "xp4OMOI1c1z",
        rtsFilter: "fg1VDHZ2QkJ",
        gapFilter: "F8UsnxWi9XM",
    },
    // option set codes
    optionSets: {
        euDispoMortuaryOrDied: "7",
        facilityDispoMortuaryOrDied: "5",
        euProceduresBasicAirway: "2",
        euProceduresEndotrachealIntubation: "3",
        euProceduresSurgicalAirway: "4",
        euProceduresOxygen: "5",
        supplementalOxygen: "2",
    },
};

const csvFields = ["registerId"] as const;
type CsvField = typeof csvFields[number];
type AuditItemRow = Record<CsvField, string>;

const auditQueryStrings = {
    mortality: [
        `&dimension=${metadata.dataElements.euDispositionId}:IN:${metadata.optionSets.euDispoMortuaryOrDied}&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.dataElements.facilityDispositionId}:IN:${metadata.optionSets.facilityDispoMortuaryOrDied}&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.rtsEvents}&dimension=${metadata.programIndicators.gapEvents}&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    hypoxia: [
        `&dimension=${metadata.dataElements.euProceduresId}:IN:${metadata.optionSets.euProceduresSurgicalAirway}`,
        `&dimension=${metadata.dataElements.oxygenAdminId}:IN:${metadata.optionSets.supplementalOxygen}&dimension=${metadata.dataElements.etaRegistryId}`,
        `&filter=${metadata.dataElements.initialOxygenSaturationId}:LT:92&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    tachypnea: [
        `&dimension=${metadata.dataElements.euProceduresId}:IN:${metadata.optionSets.euProceduresSurgicalAirway}`,
        `&dimension=${metadata.dataElements.initialSpontaneousRRId}:GT:30&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.dataElements.initialSpontaneousRRId}:LT:12&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    mental: [
        `&dimension=${metadata.dataElements.euProceduresId}:IN:${metadata.optionSets.euProceduresBasicAirway};${metadata.optionSets.euProceduresEndotrachealIntubation};${metadata.optionSets.euProceduresOxygen};&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.dataElements.initialGCSId}&dimension=${metadata.dataElements.initialAVPUId}&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    allMortality: [
        `&dimension=${metadata.dataElements.euDispositionId}:IN:${metadata.optionSets.euDispoMortuaryOrDied}&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.dataElements.facilityDispositionId}:IN:${metadata.optionSets.facilityDispoMortuaryOrDied}&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    emergencyUnit: [
        `&dimension=${metadata.dataElements.euDispositionId}:IN:${metadata.optionSets.euDispoMortuaryOrDied}&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    hospitalMortality: [
        `&dimension=${metadata.dataElements.facilityDispositionId}:IN:${metadata.optionSets.facilityDispoMortuaryOrDied}&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    severeInjuries: [
        `&dimension=${metadata.programIndicators.gapFilter}:GE:1&dimension=${metadata.programIndicators.gapEvents}:GE:3:LE:10&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.rtsEvents}:GE:1&dimension=${metadata.programIndicators.rtsFilter}:GE:0:LE:3&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.ktsFilterSevereInjuries}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.ktsFilterInitialConditions}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.mgapFilterInjuryDetails}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.mgapFilterInitialConditions}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    moderateSevereInjuries: [
        `&dimension=${metadata.programIndicators.gapFilter}:GE:1&dimension=${metadata.programIndicators.gapEvents}:GE:3:LE:18&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.rtsEvents}:GE:1&dimension=${metadata.programIndicators.rtsFilter}:GE:0:LE:10&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.ktsFilterSevereInjuries}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.ktsFilterInitialConditions}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.mgapFilterInjuryDetails}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.mgapFilterInitialConditions}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
    moderateInjuries: [
        `&dimension=${metadata.programIndicators.gapFilter}:GE:1&dimension=${metadata.programIndicators.gapEvents}:GE:11:LE:18&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.rtsEvents}:GE:1&dimension=${metadata.programIndicators.rtsFilter}:GE:4:LE:10&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.ktsFilterSevereInjuries}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.ktsEvents}&dimension=${metadata.programIndicators.ktsFilterInitialConditions}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.mgapFilterInjuryDetails}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
        `&dimension=${metadata.programIndicators.mgapEvents}&dimension=${metadata.programIndicators.mgapFilterInitialConditions}:GE:1&dimension=${metadata.dataElements.etaRegistryId}`,
    ],
};
