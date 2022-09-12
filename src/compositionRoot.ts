import { Dhis2ConfigRepository } from "./data/common/Dhis2ConfigRepository";
import { Dhis2OrgUnitsRepository } from "./data/common/Dhis2OrgUnitsRepository";
import { NHWADataApprovalDefaultRepository } from "./data/reports/nhwa-approval-status/NHWADataApprovalDefaultRepository";
import { MALDataDuplicationDefaultRepository } from "./data/reports/mal-dataset-duplication/MALDataDuplicationDefaultRepository";
import { NHWADataCommentsDefaultRepository } from "./data/reports/nhwa-comments/NHWADataCommentsDefaultRepository";
import { WIDPAdminDefaultRepository } from "./data/reports/admin/WIDPAdminDefaultRepository";
import { GetWIDPAdminDefaultUseCase } from "./domain/reports/admin/usecases/GetWIDPAdminDefaultUseCase";
import { SaveWIDPAdminDefaultCsvUseCase } from "./domain/reports/admin/usecases/SaveWIDPAdminDefaultCsvUseCase";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetOrgUnitsUseCase } from "./domain/common/usecases/GetOrgUnitsUseCase";
import { UpdateStatusUseCase } from "./domain/reports/nhwa-approval-status/usecases/CompleteDataSetsUseCase";
import { GetApprovalColumnsUseCase } from "./domain/reports/nhwa-approval-status/usecases/GetApprovalColumnsUseCase";
import { GetDataSetsUseCase } from "./domain/reports/nhwa-approval-status/usecases/GetDataSetsUseCase";
import { SaveApprovalColumnsUseCase } from "./domain/reports/nhwa-approval-status/usecases/SaveApprovalColumnsUseCase";
import { SaveDataSetsUseCase } from "./domain/reports/nhwa-approval-status/usecases/SaveDataSetsCsvUseCase";
import { GetDataValuesUseCase } from "./domain/reports/nhwa-comments/usecases/GetDataValuesUseCase";
import { SaveDataValuesUseCase } from "./domain/reports/nhwa-comments/usecases/SaveDataValuesCsvUseCase";
import { UpdateStatusAndDuplicateUseCase } from "./domain/reports/mal-dataset-duplication/usecases/CompleteAndDuplicateDataSetsUseCase";
import { GetApprovalAndDuplicateColumnsUseCase } from "./domain/reports/mal-dataset-duplication/usecases/GetApprovalAndDuplicateColumnsUseCase";
import { GetDataSetsDuplicationUseCase } from "./domain/reports/mal-dataset-duplication/usecases/GetDataSetsDuplicationUseCaseOptions";
import { SaveApprovalAndDuplicateColumnsUseCase } from "./domain/reports/mal-dataset-duplication/usecases/SaveApprovalDuplicateColumnsUseCase";
import { SaveDataSetsDuplicationUseCase } from "./domain/reports/mal-dataset-duplication/usecases/SaveDataSetsDuplicationUseCase";
import { D2Api } from "./types/d2-api";
import { GetDataDiffUseCase } from "./domain/reports/mal-dataset-duplication/usecases/GetDataDiffUseCase";
import { getReportType } from "./webapp/utils/reportType";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api, getReportType());
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
    const dataDuplicationRepository = new MALDataDuplicationDefaultRepository(api);
    const widpAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);

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
        dataDuplicate: getExecute({
            get: new GetDataSetsDuplicationUseCase(dataDuplicationRepository),
            getDiff: new GetDataDiffUseCase(dataDuplicationRepository),
            save: new SaveDataSetsDuplicationUseCase(dataDuplicationRepository),
            getColumns: new GetApprovalAndDuplicateColumnsUseCase(dataDuplicationRepository),
            saveColumns: new SaveApprovalAndDuplicateColumnsUseCase(dataDuplicationRepository),
            updateStatus: new UpdateStatusAndDuplicateUseCase(dataDuplicationRepository),
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
