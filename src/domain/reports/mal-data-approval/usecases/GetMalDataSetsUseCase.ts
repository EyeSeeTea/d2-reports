import { UseCase } from "../../../../compositionRoot";
import { promiseMap } from "../../../../utils/promises";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItem } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository, MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";

type DataSetsOptions = MalDataApprovalOptions;

export class GetMalDataSetsUseCase implements UseCase {
    constructor(
        private malDataRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository
    ) {}

    async execute(options: DataSetsOptions): Promise<PaginatedObjects<MalDataApprovalItem>> {
        const result = await this.malDataRepository.get(options);

        const response = await promiseMap(result.objects, async item => {
            const dataElementsWithValues = await new WmrDiffReport(
                this.dataValueRepository,
                this.dataSetRepository
            ).getDiff(item.dataSetUid, item.orgUnitUid, item.period);

            return {
                ...item,
                modificationCount: dataElementsWithValues.length > 0 ? String(dataElementsWithValues.length) : "",
            };
        });

        return { ...result, objects: response };
    }
}
