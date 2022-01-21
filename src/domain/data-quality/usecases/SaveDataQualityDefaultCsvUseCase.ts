
import { IndicatorsByExpression } from "../../common/entities/IndicatorsByExpression";
import { ProgramIndicatorsByExpression } from "../../common/entities/ProgramIndicatorsByExpression";
import { DataQualityRepository, DataQualityRepositorySaveOptions } from "../repositories/DataQualityRepository";

export class SaveDataQualityDefaultCsvUseCase {
    constructor(private metadataRepository: DataQualityRepository) { }

    async execute(options: DataQualityRepositorySaveOptions): Promise<void> {
        if (options.indicators) {
            this.metadataRepository.saveIndicators(options.indicatorLastUpdated, options.indicators);
        } else if (options.programIndicators) {
            this.metadataRepository.saveProgramIndicators(options.programIndicatorsLastUpdated, options.programIndicators);
        }
    }
}
