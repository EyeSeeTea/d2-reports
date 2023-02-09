import { Id } from "@eyeseetea/d2-api";
import { Period } from "../entities/DataForm";
import { DataFormRepository } from "../repositories/DataFormRepository";

export class GetDataFormValuesUseCase {
    constructor(private dataFormRepository: DataFormRepository) {}

    execute(dataSetId: Id, options: { orgUnitId: Id; period: Period }) {
        return this.dataFormRepository.getValues({ id: dataSetId, ...options });
    }
}
