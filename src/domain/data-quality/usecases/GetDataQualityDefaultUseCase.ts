import { ValidationResults } from "../../common/entities/ValidationResults";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class GetDataQualityDefaultUseCase {
    constructor(private dataQualityRepository: DataQualityRepository, 
        public getFromCache: boolean) {}

    execute(): Promise<ValidationResults[]> {
        if (this.getFromCache){
            return this.dataQualityRepository.getValidations();
        }else{
            return this.dataQualityRepository.reloadValidations();
    }
    }
}
