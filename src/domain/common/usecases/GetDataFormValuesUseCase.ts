import { Id } from "@eyeseetea/d2-api";
import { Period } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class GetDataFormValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(dataSetId: Id, options: { orgUnitId: Id; period: Period }) {
        return this.dataValueRepository.get({ dataSetId: dataSetId, ...options });
    }
}
