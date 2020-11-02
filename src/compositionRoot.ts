import { D2Api } from "./types/d2-api";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { GetDataValuesUseCase } from "./domain/usecases/GetDataValuesUseCase";
import { GetConfig } from "./domain/usecases/GetConfig";
import { Dhis2ConfigRepository } from "./data/Dhis2ConfigRepository";
import { CsvWriterCsvRepository } from "./data/CsvWriterCsvRepository";
import { BrowserFileRepository } from "./data/BrowserFileRepository";
import { SaveDataValuesCsvUseCase } from "./domain/usecases/SaveDataValuesCsvUseCase";

// TODO: Testing (unit, cypress)

export function getCompositionRoot(api: D2Api) {
    const dataValueRepository = new Dhis2DataValueRepository(api);
    const configRepository = new Dhis2ConfigRepository(api);
    const csvRepository = new CsvWriterCsvRepository();
    const fileRepository = new BrowserFileRepository();

    return {
        dataValues: {
            get: new GetDataValuesUseCase(dataValueRepository),
            saveCsv: new SaveDataValuesCsvUseCase(csvRepository, fileRepository),
        },
        config: {
            get: new GetConfig(configRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
