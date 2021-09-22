import { D2Api } from "./types/d2-api";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { GetDataValuesUseCase } from "./domain/usecases/GetDataValuesUseCase";
import { GetConfig } from "./domain/usecases/GetConfig";
import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { SaveDataValuesUseCase } from "./domain/usecases/SaveDataValuesCsvUseCase";
import { GetOrgUnitsUseCase } from "./domain/usecases/GetOrgUnitsUseCase";
import { Dhis2OrgUnitsRepository } from "./data/Dhis2OrgUnitsRepository";
import { Dhis2MetadataRepository } from "./data/Dhis2MetadataRepository";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const dataValueRepository = new Dhis2DataValueRepository(api);
    const metadataRepository = new Dhis2MetadataRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);

    return {
        metadata: {
            get: new GetMetadataUseCase(metadataRepository),
            save: new SaveMetadataUseCase(metadataRepository),
        },
        dataValues: {
            get: new GetDataValuesUseCase(dataValueRepository),
            save: new SaveDataValuesUseCase(dataValueRepository),
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
