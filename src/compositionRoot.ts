import { DataQualityDefaultRepository } from "./data/DataQualityDefaultRepository";
import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { Dhis2OrgUnitsRepository } from "./data/Dhis2OrgUnitsRepository";
import { HiddenVisualizationDefaultRepository } from "./data/HiddenVisualizationDefaultRepository";
import { NHWADataApprovalDefaultRepository } from "./data/NHWADataApprovalDefaultRepository";
import { NHWADataCommentsDefaultRepository } from "./data/NHWADataCommentsDefaultRepository";
import { WIDPAdminDefaultRepository } from "./data/WIDPAdminDefaultRepository";
import { GetWIDPAdminDefaultUseCase } from "./domain/admin/usecases/GetWIDPAdminDefaultUseCase";
import { SaveWIDPAdminDefaultCsvUseCase } from "./domain/admin/usecases/SaveWIDPAdminDefaultCsvUseCase";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetOrgUnitsUseCase } from "./domain/common/usecases/GetOrgUnitsUseCase";
import { GetDataQualityDefaultUseCase } from "./domain/data-quality/usecases/GetDataQualityDefaultUseCase";
import { SaveDataQualityDefaultCsvUseCase } from "./domain/data-quality/usecases/SaveDataQualityDefaultCsvUseCase";
import { GetHiddenVisualizationDefaultUseCase } from "./domain/hidden-visualization/usecases/GetHiddenVisualizationDefaultUseCase";
import { SaveHiddenVisualizationDefaultUseCase } from "./domain/hidden-visualization/usecases/SaveHiddenVisualizationDefaultUseCase";
import { UpdateStatusUseCase } from "./domain/nhwa-approval-status/usecases/CompleteDataSetsUseCase";
import { GetApprovalColumnsUseCase } from "./domain/nhwa-approval-status/usecases/GetApprovalColumnsUseCase";
import { GetDataSetsUseCase } from "./domain/nhwa-approval-status/usecases/GetDataSetsUseCase";
import { SaveApprovalColumnsUseCase } from "./domain/nhwa-approval-status/usecases/SaveApprovalColumnsUseCase";
import { SaveDataSetsUseCase } from "./domain/nhwa-approval-status/usecases/SaveDataSetsCsvUseCase";
import { GetDataValuesUseCase } from "./domain/nhwa-comments/usecases/GetDataValuesUseCase";
import { SaveDataValuesUseCase } from "./domain/nhwa-comments/usecases/SaveDataValuesCsvUseCase";
import { D2Api } from "./types/d2-api";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
    const widpAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const dataQualityRepository = new DataQualityDefaultRepository(api);
    const hiddenVisualizationRepository = new HiddenVisualizationDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);

    return {
        dataQuality: getExecute({
            getValidations: new GetDataQualityDefaultUseCase(dataQualityRepository, true),
            reloadValidations: new GetDataQualityDefaultUseCase(dataQualityRepository, false),
            exportToCsv: new SaveDataQualityDefaultCsvUseCase(dataQualityRepository),
        }),
        hiddenVisualizations: getExecute({
            getHiddenVisualizations: new GetHiddenVisualizationDefaultUseCase(hiddenVisualizationRepository, "p5nJdwAhHcU", "visualizations"),
            getHiddenDashboards: new GetHiddenVisualizationDefaultUseCase(hiddenVisualizationRepository, "n5QWHt30SCu", "dashboards"),
            exportVisualizaitonsToCsv: new SaveHiddenVisualizationDefaultUseCase(hiddenVisualizationRepository, "p5nJdwAhHcU", "visualizations"),
            exportDashboardsToCsv: new SaveHiddenVisualizationDefaultUseCase(hiddenVisualizationRepository, "n5QWHt30SCu", "dashboards"),
        }),
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
