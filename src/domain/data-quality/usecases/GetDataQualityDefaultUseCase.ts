import { ValidationResults } from "../../common/entities/ValidationResults";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class GetDataQualityDefaultUseCase {
    constructor(private dataQualityRepository: DataQualityRepository) { }

    execute(): Promise<ValidationResults> {
        return this.dataQualityRepository.getValidations();
    }
}
