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
import { GetMalDataElementsSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDataElementsSubscriptionUseCase";
import { SaveMalDataSubscriptionColumnsUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveMalDataSubscriptionColumnsUseCase";
import { GetMalDataSubscriptionColumnsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDataSubscriptionColumnsUseCase";
import { SaveSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveSubscriptionUseCase";
import { GetSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetSubscriptionUseCase";
import { GetMonitoringUseCase as GetSubscriptionMonitoringUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMonitoringUseCase";
import { SaveMonitoringUseCase as SaveSubscriptionMonitoringUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveMonitoringUseCase";
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
import { GetMalDashboardsSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDashboardsSubscriptionUseCase";
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
import { GetEARDataSubmissionUseCase } from "./domain/reports/glass-data-submission/usecases/GetEARDataSubmissionUseCase";
import { GetMalCountryCodesUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalCountryCodesUseCase";
import { DataQualityDefaultRepository } from "./data/reports/data-quality/DataQualityDefaultRepository";
import { GetIndicatorsUseCase } from "./domain/reports/data-quality/usecases/GetIndicatorsUseCase";
import { GetProgramIndicatorsUseCase } from "./domain/reports/data-quality/usecases/GetProgramIndicatorsUseCase";
import { SaveDataQualityColumnsUseCase } from "./domain/reports/data-quality/usecases/SaveDataQualityColumnsUseCase";
import { GetDataQualityColumnsUseCase } from "./domain/reports/data-quality/usecases/GetDataQualityColumnsUseCase";
import { SaveDataQualityUseCase } from "./domain/reports/data-quality/usecases/SaveDataQualityUseCase";
import { LoadDataQualityValidation } from "./domain/reports/data-quality/usecases/loadDataQualityValidation";
import { ResetDataQualityValidation } from "./domain/reports/data-quality/usecases/ResetDataQualityValidation";
import { GetMonitoringDetailsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMonitoringDetailsUseCase";
import { GetGLASSDataMaintenanceUseCase } from "./domain/reports/glass-admin/usecases/GetGLASSDataMaintenanceUseCase";
import { GLASSDataMaintenanceDefaultRepository } from "./data/reports/glass-admin/GLASSDataMaintenanceDefaultRepository";
import { GetGLASSDataMaintenanceColumnsUseCase } from "./domain/reports/glass-admin/usecases/GetGLASSDataMaintenanceColumnsUseCase";
import { SaveGLASSDataMaintenanceColumnsUseCase } from "./domain/reports/glass-admin/usecases/SaveGLASSDataMaintenanceColumnsUseCase";
import { GetGLASSModulesUseCase } from "./domain/reports/glass-admin/usecases/GetGLASSModulesUseCase";
import { UpdateGLASSDataMaintenanceUseCase } from "./domain/reports/glass-admin/usecases/UpdateGLASSDataMaintenanceUseCase";
import { GetATCsUseCase } from "./domain/reports/glass-admin/usecases/GetATCsUseCase";
import { UploadATCFileUseCase } from "./domain/reports/glass-admin/usecases/UploadATCFileUseCase";
import { SaveAMCRecalculationLogic } from "./domain/reports/glass-admin/usecases/SaveAMCRecalculationLogic";
import { GetATCLoggerProgramUseCase } from "./domain/reports/glass-admin/usecases/GetATCLoggerProgramUseCase";
import { GetATCRecalculationLogicUseCase } from "./domain/reports/glass-admin/usecases/GetATCRecalculationLogicUseCase";
import { CancelRecalculationUseCase } from "./domain/reports/glass-admin/usecases/CancelRecalculationUseCase";
import { GetGLASSDataSubmissionModulesUseCase } from "./domain/reports/glass-data-submission/usecases/GetGLASSDataSubmissionModulesUseCase";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api, getReportType());
    const csyAuditEmergencyRepository = new CSYAuditEmergencyDefaultRepository(api);
    const csyAuditTraumaRepository = new CSYAuditTraumaDefaultRepository(api);
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
    const dataDuplicationRepository = new MalDataApprovalDefaultRepository(api);
    const dataSubscriptionRepository = new MalDataSubscriptionDefaultRepository(api);
    const dataQualityRepository = new DataQualityDefaultRepository(api);
    const widpAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const glassAdminRepository = new GLASSDataMaintenanceDefaultRepository(api);
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
            getCountryCodes: new GetMalCountryCodesUseCase(dataDuplicationRepository),
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
            get: new GetMalDataElementsSubscriptionUseCase(dataSubscriptionRepository),
            getDashboardDataElements: new GetMalDashboardsSubscriptionUseCase(dataSubscriptionRepository),
            getMonitoringDetails: new GetMonitoringDetailsUseCase(dataSubscriptionRepository),
            getColumns: new GetMalDataSubscriptionColumnsUseCase(dataSubscriptionRepository),
            saveColumns: new SaveMalDataSubscriptionColumnsUseCase(dataSubscriptionRepository),
            getSubscription: new GetSubscriptionUseCase(dataSubscriptionRepository),
            saveSubscription: new SaveSubscriptionUseCase(dataSubscriptionRepository),
            getMonitoring: new GetSubscriptionMonitoringUseCase(dataSubscriptionRepository),
            saveMonitoring: new SaveSubscriptionMonitoringUseCase(dataSubscriptionRepository),
        }),
        auditEmergency: getExecute({
            get: new GetAuditEmergencyUseCase(csyAuditEmergencyRepository),
            save: new SaveAuditEmergencyUseCase(csyAuditEmergencyRepository),
        }),
        auditTrauma: getExecute({
            get: new GetAuditTraumaUseCase(csyAuditTraumaRepository),
            save: new SaveAuditTraumaUseCase(csyAuditTraumaRepository),
        }),
        glassAdmin: getExecute({
            get: new GetGLASSDataMaintenanceUseCase(glassAdminRepository),
            getATCs: new GetATCsUseCase(glassAdminRepository),
            getModules: new GetGLASSModulesUseCase(glassAdminRepository),
            getATCRecalculationLogic: new GetATCRecalculationLogicUseCase(glassAdminRepository),
            cancelRecalculation: new CancelRecalculationUseCase(glassAdminRepository),
            getATCLoggerProgram: new GetATCLoggerProgramUseCase(glassAdminRepository),
            updateStatus: new UpdateGLASSDataMaintenanceUseCase(glassAdminRepository),
            saveRecalculationLogic: new SaveAMCRecalculationLogic(glassAdminRepository),
            uploadFile: new UploadATCFileUseCase(glassAdminRepository),
            getColumns: new GetGLASSDataMaintenanceColumnsUseCase(glassAdminRepository),
            saveColumns: new SaveGLASSDataMaintenanceColumnsUseCase(glassAdminRepository),
        }),
        glassDataSubmission: getExecute({
            get: new GetGLASSDataSubmissionUseCase(glassDataRepository),
            getModules: new GetGLASSDataSubmissionModulesUseCase(glassDataRepository),
            getEAR: new GetEARDataSubmissionUseCase(glassDataRepository),
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
        dataQuality: getExecute({
            getIndicators: new GetIndicatorsUseCase(dataQualityRepository),
            getProgramIndicators: new GetProgramIndicatorsUseCase(dataQualityRepository),
            saveDataQuality: new SaveDataQualityUseCase(dataQualityRepository),
            loadValidation: new LoadDataQualityValidation(dataQualityRepository),
            resetValidation: new ResetDataQualityValidation(dataQualityRepository),
            getColumns: new GetDataQualityColumnsUseCase(dataQualityRepository),
            saveColumns: new SaveDataQualityColumnsUseCase(dataQualityRepository),
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
