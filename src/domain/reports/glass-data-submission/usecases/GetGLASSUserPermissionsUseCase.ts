import { UseCase } from "../../../../compositionRoot";
import { GLASSUserPermission } from "../entities/GLASSDataSubmissionItem";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class GetGLASSUserPermissionsUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(): Promise<GLASSUserPermission> {
        return this.submissionRepository.getUserGroupPermissions();
    }
}
