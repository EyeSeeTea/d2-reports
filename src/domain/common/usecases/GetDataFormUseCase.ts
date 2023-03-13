import { Id } from "@eyeseetea/d2-api";
import { Period } from "../entities/DataValue";
import { DataFormRepository } from "../repositories/DataFormRepository";

export class GetDataFormUseCase {
    constructor(private dataFormRepository: DataFormRepository) {}

    execute(options: { dataSetId: Id; period: Period }) {
        return this.dataFormRepository.get({ id: options.dataSetId, period: options.period });
    }
}
