import _ from "lodash";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { promiseMap } from "../../../../utils/promises";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItemIdentifier, MonitoringValue } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";

export class UpdateMalApprovalStatusUseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository
    ) {}

    async execute(
        items: MalDataApprovalItemIdentifier[],
        action: UpdateAction,
        monitoring?: MonitoringValue
    ): Promise<boolean | MonitoringValue | void> {
        switch (action) {
            case "complete":
                return this.approvalRepository.complete(items);
            case "approve":
                return this.approvalRepository.approve(items);
            case "duplicate": {
                const dataElementsWithValues: DataDiffItemIdentifier[] = _(
                    await promiseMap(items, async item => {
                        return await new WmrDiffReport(this.dataValueRepository, this.dataSetRepository).getDiff(
                            item.dataSet,
                            item.orgUnit,
                            item.period
                        );
                    })
                )
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
                        };
                    })
                    .compact()
                    .value();

                return this.approvalRepository.duplicateDataSets(items, dataElementsWithValues);
            }
            case "revoke":
                return this.approvalRepository.unapprove(items);
            case "incomplete":
                return this.approvalRepository.incomplete(items);
            case "activate":
                return this.approvalRepository.getMonitoring(Namespaces.MONITORING);
            case "deactivate":
                return this.approvalRepository.saveMonitoring(Namespaces.MONITORING, monitoring ?? {});
            default:
                return false;
        }
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
