import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { NHWADataApprovalDefaultRepository } from "./data/NHWADataApprovalDefaultRepository";
import { NHWADataCommentsDefaultRepository } from "./data/NHWADataCommentsDefaultRepository";
import { Dhis2OrgUnitsRepository } from "./data/Dhis2OrgUnitsRepository";
import { WIDPAdminDefaultRepository } from "./data/WIDPAdminDefaultRepository";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetApprovalColumnsUseCase } from "./domain/nhwa-approval-status/usecases/GetApprovalColumnsUseCase";
import { SaveApprovalColumnsUseCase } from "./domain/nhwa-approval-status/usecases/SaveApprovalColumnsUseCase";
import { GetDataValuesUseCase } from "./domain/nhwa-comments/usecases/GetDataValuesUseCase";
import { GetOrgUnitsUseCase } from "./domain/common/usecases/GetOrgUnitsUseCase";
import { GetWIDPAdminDefaultUseCase } from "./domain/admin/usecases/GetWIDPAdminDefaultUseCase";
import { SaveDataSetsUseCase } from "./domain/nhwa-approval-status/usecases/SaveDataSetsCsvUseCase";
import { SaveDataValuesUseCase } from "./domain/nhwa-comments/usecases/SaveDataValuesCsvUseCase";
import { SaveWIDPAdminDefaultCsvUseCase } from "./domain/admin/usecases/SaveWIDPAdminDefaultCsvUseCase";
import { GetDataSetsUseCase } from "./domain/nhwa-approval-status/usecases/GetDataSetsUseCase";
import { D2Api } from "./types/d2-api";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
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
