import { Either } from "../../common/entities/Either";
import { Struct } from "../../common/entities/Struct";
import { ValidationError } from "../../common/entities/ValidationError";
import { Id } from "./../../common/entities/Base";
import { WmrQuestion } from "./WmrQuestion";

export type WmrForm = { id: Id; name: string; questionRefs: Array<{ questionId: Id; combinationId: Id }> };

type CopyApprovalFormAttrs = {
    originalForm: WmrForm & { questions: WmrQuestion[] };
    targetForm: WmrForm & { questions: WmrQuestion[] };
    suffix: string;
};

export class ApprovalForm extends Struct<CopyApprovalFormAttrs>() {
    static build(data: CopyApprovalFormAttrs): Either<ValidationError<ApprovalForm>[], ApprovalForm> {
        const errorsSuffix = this.validateSuffixInName(data);

        if (errorsSuffix.length > 0) {
            return Either.error(errorsSuffix);
        }

        if (!data.suffix) {
            return Either.error([
                {
                    errors: ["field_cannot_be_blank"],
                    property: "suffix",
                    value: data.suffix,
                },
            ]);
        }

        return Either.success(this.create(data));
    }

    findMissingQuestions = (): WmrQuestion[] => {
        const suffix = this.suffix;
        const filteredTarget = this.targetForm.questions.filter(target => target.name.endsWith(suffix));
        if (filteredTarget.length === 0) return [];

        return this.originalForm.questions.filter(
            original => !filteredTarget.some(target => target.name === `${original.name}${suffix}`)
        );
    };

    private static validateSuffixInName(data: CopyApprovalFormAttrs): ValidationError<ApprovalForm>[] {
        const originalNameWithSuffix = `${data.originalForm.name}${data.suffix}`;

        if (originalNameWithSuffix !== data.targetForm.name) {
            return [
                {
                    errors: ["not_match"],
                    property: "originalForm",
                    value: data.originalForm.name,
                },
            ];
        }

        return [];
    }
}
