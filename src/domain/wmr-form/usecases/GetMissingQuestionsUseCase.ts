import _ from "lodash";
import { getIds, Id } from "../../common/entities/Base";
import { ApprovalForm, WmrForm } from "../../wmr-form/entities/WmrForm";
import { WmrQuestion } from "../entities/WmrQuestion";
import { WmrFormRepository } from "../repositories/WmrFormRepository";
import { WmrQuestionRepository } from "../repositories/WmrQuestionRepository";

export class GetMissingQuestionsUseCase {
    constructor(private wmrFormRepository: WmrFormRepository, private wmrQuestionRepository: WmrQuestionRepository) {}

    async execute(options: UseCaseOptions): Promise<void> {
        const { originForm, targetForm } = await this.getForms(options);
        const { originQuestions, targetQuestions } = await this.getQuestionsByForms(originForm, targetForm);

        const approvalForm = this.buildApprovalForm(originForm, targetForm, originQuestions, targetQuestions, options);

        const { missingQuestionsToSave, questionIdsToClone } = this.buildMissingQuestions(approvalForm);

        console.debug(`Saving ${missingQuestionsToSave.length} dataElements...`);
        await this.wmrQuestionRepository.clone(missingQuestionsToSave, questionIdsToClone, options);

        await this.saveApprovalForm(targetForm, missingQuestionsToSave, options);
    }

    private async saveApprovalForm(
        targetForm: WmrForm,
        missingQuestionsToSave: WmrQuestion[],
        options: UseCaseOptions
    ): Promise<void> {
        console.debug(`Saving dataSet ${targetForm.name}...`);
        const targetFormToSave = this.buildTargetForm(targetForm, missingQuestionsToSave);
        await this.wmrFormRepository.save(targetFormToSave, options);
    }

    private buildTargetForm(targetForm: WmrForm, missingQuestionsToSave: WmrQuestion[]): WmrForm {
        const missingQuestionsToAdd = missingQuestionsToSave.map(question => ({
            questionId: question.id,
            combinationId: question.combinationId,
        }));

        const questions = _(targetForm.questionRefs)
            .concat(missingQuestionsToAdd)
            .uniqBy(question => question.questionId)
            .value();

        return { ...targetForm, questionRefs: questions };
    }

    private buildMissingQuestions(approvalForm: ApprovalForm): {
        missingQuestionsToSave: WmrQuestion[];
        questionIdsToClone: Id[];
    } {
        const missingQuestionsInTarget = approvalForm.findMissingQuestions();
        console.debug(
            `Total dataElements missing in ${approvalForm.targetForm.name} form: ${missingQuestionsInTarget.length}`
        );

        const questionIdsToClone = getIds(missingQuestionsInTarget);

        const questionsWithSuffix = missingQuestionsInTarget
            .map(question => ({
                ...question,
                id: question.id.toUpperCase(),
                name: `${question.name}${approvalForm.suffix}`,
                shortName: `${question.shortName}${approvalForm.suffix}`,
                code: `${question.code}${approvalForm.suffix}`,
            }))
            .filter(question => {
                const isCodeValid = question.code.length <= maxLength;
                const isShortNameValid = question.shortName.length <= maxLength;
                this.logWarning(
                    `Ignoring dataElement: ${question.id} because code is too long >${maxLength}: ${question.code}`,
                    !isCodeValid
                );
                this.logWarning(
                    `Ignoring dataElement: ${question.id} because shortName is too long >${maxLength}: ${question.shortName}`,
                    !isShortNameValid
                );
                return isCodeValid || isShortNameValid;
            });

        return { missingQuestionsToSave: questionsWithSuffix, questionIdsToClone: questionIdsToClone };
    }

    private logWarning(value: string, shouldLog: boolean): void {
        if (shouldLog) {
            console.warn(`warning: ${value}`);
        }
    }

    private buildApprovalForm(
        originalForm: WmrForm,
        targetForm: WmrForm,
        originalQuestions: WmrQuestion[],
        targetQuestions: WmrQuestion[],
        options: UseCaseOptions
    ) {
        return ApprovalForm.build({
            originalForm: { ...originalForm, questions: originalQuestions },
            targetForm: { ...targetForm, questions: targetQuestions },
            suffix: options.suffix,
        }).get();
    }

    private async getQuestionsByForms(
        originForm: WmrForm,
        targetForm: WmrForm
    ): Promise<{ originQuestions: WmrQuestion[]; targetQuestions: WmrQuestion[] }> {
        const originQuestionsIds = originForm.questionRefs.map(question => question.questionId);
        const targetQuestionsIds = targetForm.questionRefs.map(question => question.questionId);
        console.debug("Getting dataElements...");
        const originQuestions = await this.wmrQuestionRepository.getByIds(originQuestionsIds);
        const targetQuestions = await this.wmrQuestionRepository.getByIds(targetQuestionsIds);
        return { originQuestions, targetQuestions };
    }

    private async getForms(options: UseCaseOptions): Promise<{ originForm: WmrForm; targetForm: WmrForm }> {
        const { originFormId, targetFormId } = options;
        console.debug("Getting dataSets...", originFormId, targetFormId);
        const [originForm, targetForm] = await Promise.all([
            this.wmrFormRepository.getById(originFormId),
            this.wmrFormRepository.getById(targetFormId),
        ]);
        return { originForm, targetForm };
    }
}

type UseCaseOptions = { originFormId: Id; targetFormId: Id; suffix: string; persist: boolean; export: boolean };

const maxLength = 50;
