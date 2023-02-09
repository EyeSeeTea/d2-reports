import { Id } from "@eyeseetea/d2-api";
import { DataFormValue, Period } from "../entities/DataForm";
import { DataFormRepository } from "../repositories/DataFormRepository";

export class SaveDataFormValueUseCase {
    constructor(private dataFormRepository: DataFormRepository) {}

    execute(dataValue: DataFormValueSimple, options: { orgUnitId: Id; period: Period }) {
        const dataValueComplete = { ...dataValue, ...options };
        return this.dataFormRepository.saveValue(dataValueComplete);
    }
}

type DataFormValueSimple = Pick<DataFormValue, "dataElementId" | "categoryOptionComboId" | "value">;
