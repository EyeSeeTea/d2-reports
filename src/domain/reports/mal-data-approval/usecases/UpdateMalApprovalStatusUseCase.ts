import _ from "lodash";
import { promiseMap } from "../../../../utils/promises";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { AppSettingsRepository } from "../../../common/repositories/AppSettingsRepository";

export class UpdateMalApprovalStatusUseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private appSettingsRepository: AppSettingsRepository
    ) {}

    async execute(items: MalDataApprovalItemIdentifier[], action: UpdateAction): Promise<boolean> {
        switch (action) {
            case "complete":
                return this.approvalRepository.complete(items);
            case "approve":
                // "Submit" in UI
                return this.approvalRepository.approve(items);
            case "duplicate": {
                // "Approve" in UI
                const dataElementsWithValues = await this.getDataElementsToDuplicate(items);
                return this.approvalRepository.duplicateDataSets(items, dataElementsWithValues);
            }
            case "revoke": {
                const revokeResult = await this.approvalRepository.unapprove(items);
                const incompleteResult = await this.approvalRepository.incomplete(items);
                return revokeResult && incompleteResult;
            }
            case "incomplete":
                return this.approvalRepository.incomplete(items);
            default:
                return false;
        }
    }

    private async getDataElementsToDuplicate(
        items: MalDataApprovalItemIdentifier[]
    ): Promise<DataDiffItemIdentifier[]> {
        const settings = await this.appSettingsRepository.get();
        const dataElementsWithValues = await promiseMap(items, async item => {
            return await new WmrDiffReport(this.dataValueRepository, this.dataSetRepository, settings).getDiff(
                item.dataSet,
                item.orgUnit,
                item.period
            );
        });

        return _(dataElementsWithValues)
            .flatten()
            .map(dataElementWithValues => {
                const { dataElement, value, apvdValue, comment } = dataElementWithValues;
                if (!dataElement) throw Error("No data element found");

                return {
                    dataSet: dataElementWithValues.dataSetUid,
                    orgUnit: dataElementWithValues.orgUnitUid,
                    period: dataElementWithValues.period,
                    dataElement: dataElement,
                    value: value ?? "",
                    apvdValue: apvdValue ?? "",
                    comment: comment,
                    attributeOptionCombo: dataElementWithValues.attributeOptionCombo,
                    categoryOptionCombo: dataElementWithValues.categoryOptionCombo,
                    dataElementBasicName: dataElementWithValues.dataElementBasicName,
                };
            })
            .compact()
            .value();
    }
}

type UpdateAction =
    | "complete"
    | "approve"
    | "duplicate"
    | "incomplete"
    | "unapprove"
    | "activate"
    | "deactivate"
    | "revoke";
