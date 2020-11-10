import { D2Api } from "./types/d2-api";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { GetDataValuesUseCase } from "./domain/usecases/GetDataValuesUseCase";
import { GetConfig } from "./domain/usecases/GetConfig";
import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { SaveDataValuesUseCase } from "./domain/usecases/SaveDataValuesCsvUseCase";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const dataValueRepository = new Dhis2DataValueRepository(api);

    return {
        dataValues: {
            get: new GetDataValuesUseCase(dataValueRepository),
            save: new SaveDataValuesUseCase(dataValueRepository),
        },
        config: {
            get: new GetConfig(configRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
