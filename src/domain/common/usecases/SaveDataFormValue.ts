import { Id } from "@eyeseetea/d2-api";
import { DataValue, Period } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class SaveDataFormValueUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(dataValue: DataFormValueSimple, options: { orgUnitId: Id; period: Period }) {
        const dataValueComplete = { ...dataValue, ...options };
        return this.dataValueRepository.save(dataValueComplete);
    }
}

type DataFormValueSimple = Pick<DataValue, "dataElementId" | "categoryOptionComboId" | "value">;
