import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { Dhis2DataSetRepository } from "./data/Dhis2DataSetRepository";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { Dhis2OrgUnitsRepository } from "./data/Dhis2OrgUnitsRepository";
import { WIDPAdminDefaultRepository } from "./data/WIDPAdminDefaultRepository";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetReportColumnsUseCase } from "./domain/common/usecases/GetReportColumnsUseCase";
import { SaveReportColumnsUseCase } from "./domain/common/usecases/SaveReportColumnsUseCase";
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
    const dataValueRepository = new Dhis2DataValueRepository(api);
    const dataSetRepository = new Dhis2DataSetRepository(api);
    const wIDPAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);

    return {
        admin: {
            get: new GetWIDPAdminDefaultUseCase(wIDPAdminDefaultRepository),
            save: new SaveWIDPAdminDefaultCsvUseCase(wIDPAdminDefaultRepository),
        },
        dataComments: {
            get: new GetDataValuesUseCase(dataValueRepository),
            save: new SaveDataValuesUseCase(dataValueRepository),
        },
        dataApproval: {
            get: new GetDataSetsUseCase(dataSetRepository),
            save: new SaveDataSetsUseCase(dataSetRepository),
        },
        orgUnits: {
            get: new GetOrgUnitsUseCase(orgUnitsRepository),
        },
        config: {
            get: new GetConfig(configRepository),
            getReportColumns: new GetReportColumnsUseCase(configRepository),
            saveReportColumns: new SaveReportColumnsUseCase(configRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
