import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class GetMalCountryCodesUseCase implements UseCase {
    constructor(private dataSetRepository: MalDataApprovalRepository) {}

    execute(): Promise<{ id: string; code: string }[]> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.getCountryCodes();
    }
}
