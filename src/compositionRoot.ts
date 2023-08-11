import { Dhis2ConfigRepository } from "./data/common/Dhis2ConfigRepository";
import { Dhis2OrgUnitsRepository } from "./data/common/Dhis2OrgUnitsRepository";
import { NHWADataApprovalDefaultRepository } from "./data/reports/nhwa-approval-status/NHWADataApprovalDefaultRepository";
import { NHWADataCommentsDefaultRepository } from "./data/reports/nhwa-comments/NHWADataCommentsDefaultRepository";
import { WIDPAdminDefaultRepository } from "./data/reports/admin/WIDPAdminDefaultRepository";
import { GetWIDPAdminDefaultUseCase } from "./domain/reports/admin/usecases/GetWIDPAdminDefaultUseCase";
import { SaveWIDPAdminDefaultCsvUseCase } from "./domain/reports/admin/usecases/SaveWIDPAdminDefaultCsvUseCase";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetOrgUnitsUseCase } from "./domain/common/usecases/GetOrgUnitsUseCase";
import { UpdateStatusUseCase } from "./domain/reports/nhwa-approval-status/usecases/UpdateStatusUseCase";
import { GetApprovalColumnsUseCase } from "./domain/reports/nhwa-approval-status/usecases/GetApprovalColumnsUseCase";
import { GetDataSetsUseCase } from "./domain/reports/nhwa-approval-status/usecases/GetDataSetsUseCase";
import { SaveApprovalColumnsUseCase } from "./domain/reports/nhwa-approval-status/usecases/SaveApprovalColumnsUseCase";
import { SaveDataSetsUseCase } from "./domain/reports/nhwa-approval-status/usecases/SaveDataSetsCsvUseCase";
import { GetDataValuesUseCase } from "./domain/reports/nhwa-comments/usecases/GetDataValuesUseCase";
import { SaveDataValuesUseCase } from "./domain/reports/nhwa-comments/usecases/SaveDataValuesCsvUseCase";
import { UpdateMalApprovalStatusUseCase } from "./domain/reports/mal-data-approval/usecases/UpdateMalApprovalStatusUseCase";
import { GetMalDataSetsUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataSetsUseCase";
import { SaveMalDataApprovalColumnsUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDataApprovalColumnsUseCase";
import { SaveMalDataSetsUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDataSetsUseCase";
import { D2Api } from "./types/d2-api";
import { GetMalDataDiffUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataDiffUseCase";
import { getReportType } from "./webapp/utils/reportType";
import { GetMalDataApprovalColumnsUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataApprovalColumnsUseCase";
import { MalDataApprovalDefaultRepository } from "./data/reports/mal-data-approval/MalDataApprovalDefaultRepository";
import { MalDataSubscriptionDefaultRepository } from "./data/reports/mal-data-subscription/MalDataSubscriptionDefaultRepository";
import { GetSortOrderUseCase } from "./domain/reports/mal-data-approval/usecases/GetSortOrderUseCase";
import { GenerateSortOrderUseCase } from "./domain/reports/mal-data-approval/usecases/GenerateSortOrderUseCase";
import { GetMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/GetMonitoringUseCase";
import { SaveMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMonitoringUseCase";
import { DuplicateDataValuesUseCase } from "./domain/reports/mal-data-approval/usecases/DuplicateDataValuesUseCase";
import { GetMalSubscriptionDataSetsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalSubscriptionDataSetsUseCase";
import { SaveMalDataSubscriptionColumnsUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveMalDataSubscriptionColumnsUseCase";
import { GetMalDataSubscriptionColumnsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDataSubscriptionColumnsUseCase";
import { GetSubscriptionSortOrderUseCase } from "./domain/reports/mal-data-subscription/usecases/GetSubscriptionSortOrderUseCase";
import { GenerateSubscriptionSortOrderUseCase } from "./domain/reports/mal-data-subscription/usecases/GenerateSubscriptionSortOrderUseCase";
import { SaveSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveSubscriptionUseCase";
import { GetSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetSubscriptionUseCase";
import { CSYAuditEmergencyDefaultRepository } from "./data/reports/csy-audit-emergency/CSYAuditEmergencyDefaultRepository";
import { GetAuditEmergencyUseCase } from "./domain/reports/csy-audit-emergency/usecases/GetAuditEmergencyUseCase";
import { SaveAuditEmergencyUseCase } from "./domain/reports/csy-audit-emergency/usecases/SaveAuditEmergencyUseCase";
import { GetAuditTraumaUseCase } from "./domain/reports/csy-audit-trauma/usecases/GetAuditTraumaUseCase";
import { SaveAuditTraumaUseCase } from "./domain/reports/csy-audit-trauma/usecases/SaveAuditTraumaUseCase";
import { GLASSDataSubmissionDefaultRepository } from "./data/reports/glass-data-submission/GLASSDataSubmissionDefaultRepository";
import { GetGLASSDataSubmissionUseCase } from "./domain/reports/glass-data-submission/usecases/GetGLASSDataSubmissionUseCase";
import { GetGLASSDataSubmissionColumnsUseCase } from "./domain/reports/glass-data-submission/usecases/GetGLASSDataSubmissionColumnsUseCase";
import { SaveGLASSDataSubmissionColumnsUseCase } from "./domain/reports/glass-data-submission/usecases/SaveGLASSDataSubmissionColumnsUseCase";
import { UpdateGLASSSubmissionUseCase } from "./domain/reports/glass-data-submission/usecases/UpdateGLASSSubmissionUseCase";
import { DHIS2MessageCountUseCase } from "./domain/reports/glass-data-submission/usecases/DHIS2MessageCountUseCase";
import { CSYSummaryDefaultRepository } from "./data/reports/csy-summary-patient/CSYSummaryDefaultRepository";
import { GetSummaryUseCase } from "./domain/reports/csy-summary-patient/usecases/GetSummaryUseCase";
import { SaveSummaryUseCase } from "./domain/reports/csy-summary-patient/usecases/SaveSummaryUseCase";
import { CSYSummaryMortalityDefaultRepository } from "./data/reports/csy-summary-mortality/CSYSummaryDefaultRepository";
import { GetSummaryMortalityUseCase } from "./domain/reports/csy-summary-mortality/usecases/GetSummaryUseCase";
import { SaveSummaryMortalityUseCase } from "./domain/reports/csy-summary-mortality/usecases/SaveSummaryUseCase";
import { CSYAuditTraumaDefaultRepository } from "./data/reports/csy-audit-trauma/CSYAuditTraumaDefaultRepository";
import { GetAutoCompleteComputeValuesUseCase } from "./domain/reports/nhwa-auto-complete-compute/usecases/GetAutoCompleteComputeValuesUseCase";
import { DataSetD2Repository } from "./data/common/DataSetD2Repository";
import { DataValuesD2Repository } from "./data/common/DataValuesD2Repository";
import { FixAutoCompleteComputeValuesUseCase } from "./domain/reports/nhwa-auto-complete-compute/usecases/FixAutoCompleteComputeValuesUseCase";
import { GetOrgUnitsByLevelUseCase } from "./domain/common/usecases/GetOrgUnitsByLevelUseCase";
import { AutoCompleteComputeSettingsD2Repository } from "./data/reports/nhwa-auto-complete-compute/AutoCompleteComputeSettingsD2Repository";
import { GetTotalsByActivityLevelUseCase } from "./domain/reports/nhwa-fix-totals/GetTotalsByActivityLevelUseCase";
import { FixTotalsValuesUseCase } from "./domain/reports/nhwa-fix-totals/usecases/FixTotalsValuesUseCase";
import { FixTotalsSettingsD2Repository } from "./data/reports/nhwa-fix-totals/FixTotalsSettingsD2Repository";
import { SubnationalCorrectD2Repository } from "./data/reports/nhwa-subnational-correct-orgunit/SubnationalCorrectD2Repository";
import { GetSubnationalCorrectUseCase } from "./domain/reports/nhwa-subnational-correct-orgunit/usecases/GetSubnationalCorrectUseCase";
import { DismissSubnationalCorrectValuesUseCase } from "./domain/reports/nhwa-subnational-correct-orgunit/usecases/DismissSubnationalCorrectValuesUseCase";
import { SubnationalCorrectD2SettingsRepository } from "./data/reports/nhwa-subnational-correct-orgunit/SubnationalCorrectD2SettingsRepository";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api, getReportType());
    const csyAuditEmergencyRepository = new CSYAuditEmergencyDefaultRepository(api);
    const csyAuditTraumaRepository = new CSYAuditTraumaDefaultRepository(api);
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
    const dataDuplicationRepository = new MalDataApprovalDefaultRepository(api);
    const dataSubscriptionRepository = new MalDataSubscriptionDefaultRepository(api);
    const widpAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const glassDataRepository = new GLASSDataSubmissionDefaultRepository(api);
    const csySummaryRepository = new CSYSummaryDefaultRepository(api);
    const csySummaryMortalityRepository = new CSYSummaryMortalityDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);
    const dataSetRepository = new DataSetD2Repository(api);
    const dataValuesRepository = new DataValuesD2Repository(api);
    const autoCompleteComputeSettingsRepository = new AutoCompleteComputeSettingsD2Repository(api);
    const fixTotalSettingsRepository = new FixTotalsSettingsD2Repository(api);
    const subnationalCorrectRepository = new SubnationalCorrectD2Repository(api);
    const subnationalCorrectSettingsRepository = new SubnationalCorrectD2SettingsRepository(api);

    return {
        admin: getExecute({
            get: new GetWIDPAdminDefaultUseCase(widpAdminDefaultRepository),
            save: new SaveWIDPAdminDefaultCsvUseCase(widpAdminDefaultRepository),
        }),
        dataComments: getExecute({
            get: new GetDataValuesUseCase(dataCommentsRepository),
            save: new SaveDataValuesUseCase(dataCommentsRepository),
        }),
        dataApproval: getExecute({
            get: new GetDataSetsUseCase(dataApprovalRepository),
            save: new SaveDataSetsUseCase(dataApprovalRepository),
            getColumns: new GetApprovalColumnsUseCase(dataApprovalRepository),
            saveColumns: new SaveApprovalColumnsUseCase(dataApprovalRepository),
            updateStatus: new UpdateStatusUseCase(dataApprovalRepository),
        }),
        malDataApproval: getExecute({
            get: new GetMalDataSetsUseCase(dataDuplicationRepository),
            getDiff: new GetMalDataDiffUseCase(dataDuplicationRepository),
            save: new SaveMalDataSetsUseCase(dataDuplicationRepository),
            getColumns: new GetMalDataApprovalColumnsUseCase(dataDuplicationRepository),
            saveColumns: new SaveMalDataApprovalColumnsUseCase(dataDuplicationRepository),
            getMonitoring: new GetMonitoringUseCase(dataDuplicationRepository),
            saveMonitoring: new SaveMonitoringUseCase(dataDuplicationRepository),
            updateStatus: new UpdateMalApprovalStatusUseCase(dataDuplicationRepository),
            duplicateValue: new DuplicateDataValuesUseCase(dataDuplicationRepository),
            getSortOrder: new GetSortOrderUseCase(dataDuplicationRepository),
            generateSortOrder: new GenerateSortOrderUseCase(dataDuplicationRepository),
        }),
        malDataSubscription: getExecute({
            get: new GetMalSubscriptionDataSetsUseCase(dataSubscriptionRepository),
            getColumns: new GetMalDataSubscriptionColumnsUseCase(dataSubscriptionRepository),
            saveColumns: new SaveMalDataSubscriptionColumnsUseCase(dataSubscriptionRepository),
            getSortOrder: new GetSubscriptionSortOrderUseCase(dataSubscriptionRepository),
            generateSortOrder: new GenerateSubscriptionSortOrderUseCase(dataSubscriptionRepository),
            getSubscription: new GetSubscriptionUseCase(dataSubscriptionRepository),
            saveSubscription: new SaveSubscriptionUseCase(dataSubscriptionRepository),
        }),
        auditEmergency: getExecute({
            get: new GetAuditEmergencyUseCase(csyAuditEmergencyRepository),
            save: new SaveAuditEmergencyUseCase(csyAuditEmergencyRepository),
        }),
        auditTrauma: getExecute({
            get: new GetAuditTraumaUseCase(csyAuditTraumaRepository),
            save: new SaveAuditTraumaUseCase(csyAuditTraumaRepository),
        }),
        glassDataSubmission: getExecute({
            get: new GetGLASSDataSubmissionUseCase(glassDataRepository),
            getColumns: new GetGLASSDataSubmissionColumnsUseCase(glassDataRepository),
            saveColumns: new SaveGLASSDataSubmissionColumnsUseCase(glassDataRepository),
            dhis2MessageCount: new DHIS2MessageCountUseCase(glassDataRepository),
            updateStatus: new UpdateGLASSSubmissionUseCase(glassDataRepository),
        }),
        summary: getExecute({
            get: new GetSummaryUseCase(csySummaryRepository),
            save: new SaveSummaryUseCase(csySummaryRepository),
        }),
        summaryMortality: getExecute({
            get: new GetSummaryMortalityUseCase(csySummaryMortalityRepository),
            save: new SaveSummaryMortalityUseCase(csySummaryMortalityRepository),
        }),
        orgUnits: getExecute({
            get: new GetOrgUnitsUseCase(orgUnitsRepository),
            getByLevel: new GetOrgUnitsByLevelUseCase(orgUnitsRepository),
        }),
        config: getExecute({
            get: new GetConfig(configRepository),
        }),
        nhwa: {
            getAutoCompleteComputeValues: new GetAutoCompleteComputeValuesUseCase(
                dataSetRepository,
                dataValuesRepository,
                autoCompleteComputeSettingsRepository
            ),
            fixAutoCompleteComputeValues: new FixAutoCompleteComputeValuesUseCase(dataValuesRepository),
            getTotalsByActivityLevel: new GetTotalsByActivityLevelUseCase(
                dataSetRepository,
                dataValuesRepository,
                fixTotalSettingsRepository
            ),
            fixTotalValues: new FixTotalsValuesUseCase(dataValuesRepository),
            getSubnationalCorrectValues: new GetSubnationalCorrectUseCase(subnationalCorrectRepository),
            dismissSubnationalCorrectValues: new DismissSubnationalCorrectValuesUseCase(
                dataValuesRepository,
                subnationalCorrectSettingsRepository
            ),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}

export interface UseCase {
    execute: Function;
}
