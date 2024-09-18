import { emptyPage, paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { D2Api } from "../../../types/d2-api";
import { AuditItem, AuditType } from "../../../domain/reports/csy-audit-operative/entities/AuditItem";
import {
    AuditItemRepository,
    AuditOptions,
} from "../../../domain/reports/csy-audit-operative/repositories/AuditRepository";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { promiseMap } from "../../../utils/promises";
import { getEventQueryString } from "../../common/entities/AuditAnalytics";
import {
    AuditAnalyticsData,
    AuditAnalyticsResponse,
    buildRefs,
} from "../../../domain/common/entities/AuditAnalyticsResponse";
import { Maybe } from "../../../types/utils";
import { Id } from "../../../domain/common/entities/Base";
import _ from "lodash";

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
            const query = `${queryString}&dimension=${metadata.dataElements.etaRegistryId}`;

            const eventQueryString = getEventQueryString(
                programs.operativeCareProgramId,
                programStages.operativeCareProgramStageId,
                orgUnitIds.join(";"),
                period,
                query
            );

            const analyticsResponse = await this.api.get<AuditAnalyticsResponse>(eventQueryString).getData();

            return new AuditAnalyticsData(analyticsResponse);
        });

        return this.getAuditItemsByAuditType(auditType, analyticsResponse);
    }

    private getRegisterIds(data: Maybe<AuditAnalyticsData>, id: Id): string[] {
        return data ? data.getColumnValues(id) : [];
    }

    private getAuditItemsByAuditType(auditType: AuditType, data: AuditAnalyticsData[]): AuditItem[] {
        return buildRefs(this.getMatchedIds(auditType, data));
    }

    private getMatchedIds(auditType: AuditType, data: AuditAnalyticsData[]): string[] {
        const { arrivalDateId, etaRegistryId, firstOTDateId } = metadata.dataElements;

        switch (auditType) {
            case "lowRiskMortality": {
                const [deceasedDispoData, postSurgeryDispoData, asaScoreData] = data;

                const deceasedDispoIds = this.getRegisterIds(deceasedDispoData, etaRegistryId);
                const postSurgeryDispoIds = this.getRegisterIds(postSurgeryDispoData, etaRegistryId);
                const asaScoreIds = this.getRegisterIds(asaScoreData, etaRegistryId);

                const matchedDispoIds = _.union(deceasedDispoIds, postSurgeryDispoIds);

                return _.intersection(matchedDispoIds, asaScoreIds);
            }
            case "zeroComorbidityMortality": {
                const [deceasedDispoData, postSurgeryDispoData, medicalComorbiditiesData] = data;

                const deceasedDispoIds = this.getRegisterIds(deceasedDispoData, etaRegistryId);
                const postSurgeryDispoIds = this.getRegisterIds(postSurgeryDispoData, etaRegistryId);
                const medicalComorbiditiesIds = this.getRegisterIds(medicalComorbiditiesData, etaRegistryId);

                const matchedDispoIds = _.union(deceasedDispoIds, postSurgeryDispoIds);

                return _.intersection(matchedDispoIds, medicalComorbiditiesIds);
            }
            case "cSectionMortality": {
                const [
                    deceasedDispoData,
                    postSurgeryDispoData,
                    surgicalInterventionData,
                    surgicalIntervention2Data,
                    surgicalIntervention3Data,
                    surgicalIntervention4Data,
                    surgicalIntervention5Data,
                ] = data;

                const deceasedDispoIds = this.getRegisterIds(deceasedDispoData, etaRegistryId);
                const postSurgeryDispoIds = this.getRegisterIds(postSurgeryDispoData, etaRegistryId);
                const matchedDispoIds = _.union(deceasedDispoIds, postSurgeryDispoIds);

                const surgicalInterventionIds = this.getRegisterIds(surgicalInterventionData, etaRegistryId);
                const surgicalIntervention2Ids = this.getRegisterIds(surgicalIntervention2Data, etaRegistryId);
                const surgicalIntervention3Ids = this.getRegisterIds(surgicalIntervention3Data, etaRegistryId);
                const surgicalIntervention4Ids = this.getRegisterIds(surgicalIntervention4Data, etaRegistryId);
                const surgicalIntervention5Ids = this.getRegisterIds(surgicalIntervention5Data, etaRegistryId);
                const matchedSurgicalInterventionIds = _.union(
                    surgicalInterventionIds,
                    surgicalIntervention2Ids,
                    surgicalIntervention3Ids,
                    surgicalIntervention4Ids,
                    surgicalIntervention5Ids
                );

                return _.intersection(matchedDispoIds, matchedSurgicalInterventionIds);
            }
            case "emergentCase": {
                const [etaFacilityTransfersData, urgencyOfSurgeryData] = data;

                const etaFacilityTransfersIds = this.getRegisterIds(etaFacilityTransfersData, etaRegistryId);
                const urgencyOfSurgeryIds = this.getRegisterIds(urgencyOfSurgeryData, etaRegistryId);

                return _.intersection(etaFacilityTransfersIds, urgencyOfSurgeryIds);
            }
            case "surgeryChecklist": {
                const [surgeryChecklistData] = data;
                const surgeryChecklistIds = this.getRegisterIds(surgeryChecklistData, etaRegistryId);

                return surgeryChecklistIds;
            }
            case "otMortality": {
                const [deceasedDispoData] = data;
                const deceasedDispoIds = this.getRegisterIds(deceasedDispoData, etaRegistryId);

                return deceasedDispoIds;
            }
            case "acuteEmergentCase": {
                const [urgencyOfSurgeryData, arrivalDateData, firstOTDateData] = data;

                const urgencyOfSurgeryIds = this.getRegisterIds(urgencyOfSurgeryData, etaRegistryId);

                const dateIds = this.getRegisterIds(arrivalDateData, etaRegistryId);
                const arrivalDateIds = this.getRegisterIds(arrivalDateData, arrivalDateId);
                const firstOTDateIds = this.getRegisterIds(firstOTDateData, firstOTDateId);
                const arrivalDates = _.map(arrivalDateIds, arrivalDate => new Date(arrivalDate));
                const firstOTDates = _.map(firstOTDateIds, firstOTDate => new Date(firstOTDate));

                const timeDiffIds = _.compact(
                    _.filter(_.zip(dateIds, arrivalDates, firstOTDates), ([, arrivalDate, firstOTDate]) => {
                        const timeDifferenceInHours = 6;
                        const arrivalTime = arrivalDate?.getTime() ?? 0;
                        const firstOTTime = firstOTDate?.getTime() ?? 0;

                        return firstOTTime - arrivalTime > convertHoursToMilliseconds(timeDifferenceInHours);
                    }).map(([id]) => id)
                );

                return _.intersection(urgencyOfSurgeryIds, timeDiffIds);
            }
            case "nonSpecialistMortality": {
                const [
                    deceasedDispoData,
                    postSurgeryDispoData,
                    anaesthesiaProviderData,
                    surgicalProviderCategoryData,
                    surgicalProviderCategory2Data,
                    surgicalProviderCategory3Data,
                ] = data;

                const deceasedDispoIds = this.getRegisterIds(deceasedDispoData, etaRegistryId);
                const postSurgeryDispoIds = this.getRegisterIds(postSurgeryDispoData, etaRegistryId);
                const matchedDispoIds = _.union(deceasedDispoIds, postSurgeryDispoIds);

                const anaesthesiaProviderIds = this.getRegisterIds(anaesthesiaProviderData, etaRegistryId);
                const surgicalProviderCategoryIds = this.getRegisterIds(surgicalProviderCategoryData, etaRegistryId);
                const surgicalProviderCategory2Ids = this.getRegisterIds(surgicalProviderCategory2Data, etaRegistryId);
                const surgicalProviderCategory3Ids = this.getRegisterIds(surgicalProviderCategory3Data, etaRegistryId);
                const matchedNonSpecialistSurgicalCategoryIds = _.union(
                    anaesthesiaProviderIds,
                    surgicalProviderCategoryIds,
                    surgicalProviderCategory2Ids,
                    surgicalProviderCategory3Ids
                );

                return _.intersection(matchedDispoIds, matchedNonSpecialistSurgicalCategoryIds);
            }
            case "pulseOximetry": {
                const [intraOperativeData] = data;
                const intraOperativeIds = this.getRegisterIds(intraOperativeData, etaRegistryId);

                return intraOperativeIds;
            }
            case "intraOperativeComplications": {
                const [asaScoreData, medicalComorbiditiesData] = data;

                const asaScoreIds = this.getRegisterIds(asaScoreData, etaRegistryId);
                const medicalComorbiditiesIds = this.getRegisterIds(medicalComorbiditiesData, etaRegistryId);
                const matchedIds = _.union(asaScoreIds, medicalComorbiditiesIds);

                return _.intersection(matchedIds);
            }
            default:
                return [];
        }
    }
}

const metadata = {
    programs: {
        operativeCareProgramId: "Cd144iCAheH",
    },
    programStages: {
        operativeCareProgramStageId: "fR7MnAYI7qO",
    },
    dataElements: {
        etaRegistryId: "QStbireWKjW",
        leavingTheatreDispoId: "RFHUqfwttmQ",
        postSurgeryDispoId: "HY1cx8VUKTJ",
        functionalStatusScoreId: "DDMhyMh8Akg",
        majorMedicalComorbiditiesId: "VFHOGGrm6U2",
        surgicalIntervention: "ErKjmQCZbX6",
        surgicalIntervention2: "htjb6oO289L",
        surgicalIntervention3: "Fz9M9wisOLE",
        surgicalIntervention4: "qYqAIU3egh1",
        surgicalIntervention5: "vlIZHCoDicY",
        etaFacilityTransfersId: "KnO9B1STfzZ",
        urgencyOfSurgeryId: "rb99kcPzmP8",
        safeSurgeryChecklistId: "yfhmIPel90Z",
        arrivalDateId: "xCMeFQWSPCb",
        firstOTDateId: "IBstQUA3RPC",
        surgicalProviderCategoryId: "iZfmQzsgdBb",
        surgicalProviderCategory2Id: "t5C6iIrp0Y4",
        surgicalProviderCategory3Id: "Oj0rFoQJysS",
        anaesthesiaProviderId: "piS3HyOQpZo",
        intraOperativeId: "B07nT1jiYrt",
    },
    // option set codes
    optionSets: {
        leavingTheatreDispoDeceased: "3",
        postSurgeryDispoDeceased: "3",
        asa1FunctionalStatusScore: "1",
        asa2FunctionalStatusScore: "2",
        cSectionSurgicalIntervention: "19",
        acuteEmergency: "1",
        noSafeSurgery: "0",
        surgeonSpecialist: "1",
        anaestheticPhysicianSpecialist: "1",
    },
};

const { dataElements, optionSets } = metadata;

const auditQueryStrings: Record<AuditType, string[]> = {
    lowRiskMortality: [
        `&dimension=${dataElements.leavingTheatreDispoId}:EQ:${optionSets.leavingTheatreDispoDeceased}`,
        `&dimension=${dataElements.postSurgeryDispoId}:EQ:${optionSets.postSurgeryDispoDeceased}`,
        `&dimension=${dataElements.functionalStatusScoreId}:IN:${optionSets.asa1FunctionalStatusScore};${optionSets.asa2FunctionalStatusScore}`,
    ],
    zeroComorbidityMortality: [
        `&dimension=${dataElements.leavingTheatreDispoId}:EQ:${optionSets.leavingTheatreDispoDeceased}`,
        `&dimension=${dataElements.postSurgeryDispoId}:EQ:${optionSets.postSurgeryDispoDeceased}`,
        `&dimension=${dataElements.majorMedicalComorbiditiesId}:EQ:0`,
    ],
    cSectionMortality: [
        `&dimension=${dataElements.leavingTheatreDispoId}:EQ:${optionSets.leavingTheatreDispoDeceased}`,
        `&dimension=${dataElements.postSurgeryDispoId}:EQ:${optionSets.postSurgeryDispoDeceased}`,
        `&dimension=${dataElements.surgicalIntervention}:EQ:${optionSets.cSectionSurgicalIntervention}`,
        `&dimension=${dataElements.surgicalIntervention2}:EQ:${optionSets.cSectionSurgicalIntervention}`,
        `&dimension=${dataElements.surgicalIntervention3}:EQ:${optionSets.cSectionSurgicalIntervention}`,
        `&dimension=${dataElements.surgicalIntervention4}:EQ:${optionSets.cSectionSurgicalIntervention}`,
        `&dimension=${dataElements.surgicalIntervention5}:EQ:${optionSets.cSectionSurgicalIntervention}`,
    ],
    emergentCase: [
        `&dimension=${dataElements.etaFacilityTransfersId}:GT:1`,
        `&dimension=${dataElements.urgencyOfSurgeryId}:EQ:${optionSets.acuteEmergency}`,
    ],
    surgeryChecklist: [`&dimension=${dataElements.safeSurgeryChecklistId}:EQ:${optionSets.noSafeSurgery}`],
    otMortality: [`&dimension=${dataElements.leavingTheatreDispoId}:EQ:${optionSets.leavingTheatreDispoDeceased}`],
    acuteEmergentCase: [
        `&dimension=${dataElements.urgencyOfSurgeryId}:EQ:${optionSets.acuteEmergency}`,
        `&dimension=${dataElements.arrivalDateId}`,
        `&dimension=${dataElements.firstOTDateId}`,
    ],
    nonSpecialistMortality: [
        `&dimension=${dataElements.leavingTheatreDispoId}:EQ:${optionSets.leavingTheatreDispoDeceased}`,
        `&dimension=${dataElements.postSurgeryDispoId}:EQ:${optionSets.postSurgeryDispoDeceased}`,
        `&dimension=${dataElements.anaesthesiaProviderId}:NE:${optionSets.anaestheticPhysicianSpecialist}`,
        `&dimension=${dataElements.surgicalProviderCategoryId}:NE:${optionSets.surgeonSpecialist}`,
        `&dimension=${dataElements.surgicalProviderCategory2Id}:NE:${optionSets.surgeonSpecialist}`,
        `&dimension=${dataElements.surgicalProviderCategory3Id}:NE:${optionSets.surgeonSpecialist}`,
    ],
    pulseOximetry: [`&dimension=${dataElements.intraOperativeId}:EQ:0`],
    intraOperativeComplications: [
        `&dimension=${dataElements.functionalStatusScoreId}:IN:${optionSets.asa1FunctionalStatusScore};${optionSets.asa2FunctionalStatusScore}`,
        `&dimension=${dataElements.majorMedicalComorbiditiesId}:EQ:0`,
    ],
};

function convertHoursToMilliseconds(hours: number): number {
    return hours * 60 * 60 * 1000;
}
