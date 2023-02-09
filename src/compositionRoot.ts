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
import { GetSortOrderUseCase } from "./domain/reports/mal-data-approval/usecases/GetSortOrderUseCase";
import { GenerateSortOrderUseCase } from "./domain/reports/mal-data-approval/usecases/GenerateSortOrderUseCase";
import { GetMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/GetMonitoringUseCase";
import { SaveMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMonitoringUseCase";
import { DuplicateDataValuesUseCase } from "./domain/reports/mal-data-approval/usecases/DuplicateDataValuesUseCase";
import { Dhis2DataFormRepository } from "./data/common/Dhis2DataFormRepository";
import { SaveDataFormValueUseCase } from "./domain/common/usecases/SaveDataFormValue";
import { GetDataFormUseCase } from "./domain/common/usecases/GetDataFormUseCase";
import { GetDataFormValuesUseCase } from "./domain/common/usecases/GetDataFormValuesUseCase";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api, getReportType());
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
    const dataDuplicationRepository = new MalDataApprovalDefaultRepository(api);
    const widpAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);
    const dataFormRepository = new Dhis2DataFormRepository(api);

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
        dataForms: getExecute({
            get: new GetDataFormUseCase(dataFormRepository),
            getValues: new GetDataFormValuesUseCase(dataFormRepository),
            saveValue: new SaveDataFormValueUseCase(dataFormRepository),
        }),
        orgUnits: getExecute({
            get: new GetOrgUnitsUseCase(orgUnitsRepository),
        }),
        config: getExecute({
            get: new GetConfig(configRepository),
        }),
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
