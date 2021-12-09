import { D2Api } from "./types/d2-api";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { Dhis2DataSetRepository } from "./data/Dhis2DataSetRepository";
import { GetDataValuesUseCase } from "./domain/usecases/GetDataValuesUseCase";
import { GetDataSetsUseCase } from "./domain/usecases/GetDataSetsUseCase";
import { GetConfig } from "./domain/usecases/GetConfig";
import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { SaveDataValuesUseCase } from "./domain/usecases/SaveDataValuesCsvUseCase";
import { SaveDataSetsUseCase } from "./domain/usecases/SaveDataSetsCsvUseCase";
import { GetOrgUnitsUseCase } from "./domain/usecases/GetOrgUnitsUseCase";
import { Dhis2OrgUnitsRepository } from "./data/Dhis2OrgUnitsRepository";
import { GetWIDPAdminDefaultUseCase } from "./domain/usecases/GetWIDPAdminDefaultUseCase";
import { SaveWIDPAdminDefaultCsvUseCase } from "./domain/usecases/SaveWIDPAdminDefaultCsvUseCase";
import { WIDPAdminDefaultRepository } from "./data/WIDPAdminDefaultRepository";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const dataValueRepository = new Dhis2DataValueRepository(api);
    const dataSetRepository = new Dhis2DataSetRepository(api);
    const wIDPAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);

    return {
        metadata: {
            get: new GetWIDPAdminDefaultUseCase(wIDPAdminDefaultRepository),
            save: new SaveWIDPAdminDefaultCsvUseCase(wIDPAdminDefaultRepository),
        },
        dataValues: {
            get: new GetDataValuesUseCase(dataValueRepository),
            save: new SaveDataValuesUseCase(dataValueRepository),
        },
        dataSets: {
            get: new GetDataSetsUseCase(dataSetRepository),
            save: new SaveDataSetsUseCase(dataSetRepository),
        },
        orgUnits: {
            get: new GetOrgUnitsUseCase(orgUnitsRepository),
        },
        config: {
            get: new GetConfig(configRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
