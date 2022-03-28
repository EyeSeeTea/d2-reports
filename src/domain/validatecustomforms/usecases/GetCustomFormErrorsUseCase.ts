import { CustomFormErrorsRepository } from "../repositories/CustomFormErrorsRepository";

export class GetCustomFormErrorsUseCase {
    constructor(private customFormErrorsRepository: CustomFormErrorsRepository) {}

    execute(id: string): Promise<string[]> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.customFormErrorsRepository.get(id);
    }
}
