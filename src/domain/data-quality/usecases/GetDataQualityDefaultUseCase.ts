import { IndicatorsByExpression } from "../../common/entities/IndicatorsByExpression";
import { ProgramIndicatorsByExpression } from "../../common/entities/ProgramIndicatorsByExpression";
import { DataQualityRepository, DataQualityRepositoryGetOptions } from "../repositories/DataQualityRepository";

export class GetDataQualityDefaultUseCase {
    constructor(private dataQualityRepository: DataQualityRepository) { }

    execute(options: DataQualityRepositoryGetOptions): Promise<IndicatorsByExpression | ProgramIndicatorsByExpression> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        if (options.indicators) {
            return this.dataQualityRepository.getIndicatorByExpressions(this.dataQualityRepository.getLastUpdated("indicators"));
        } else {
            return this.dataQualityRepository.getProgramIndicatorByExpressions(this.dataQualityRepository.getLastUpdated("programIndicators"));
        }
    }
}
