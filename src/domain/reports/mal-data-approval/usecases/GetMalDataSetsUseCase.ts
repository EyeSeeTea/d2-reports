import { UseCase } from "../../../../compositionRoot";
import { promiseMap } from "../../../../utils/promises";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { AppSettingsRepository } from "../../../common/repositories/AppSettingsRepository";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItem } from "../entities/MalDataApprovalItem";
import { getDataDuplicationItemMonitoringValue } from "../entities/MonitoringValue";
import { MalDataApprovalRepository, MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";
import { MonitoringValueRepository } from "../repositories/MonitoringValueRepository";

type DataSetsOptions = MalDataApprovalOptions;

export class GetMalDataSetsUseCase implements UseCase {
    constructor(
        private malDataRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private monitoringValueRepository: MonitoringValueRepository,
        private appSettingsRepository: AppSettingsRepository
    ) {}

    async execute(
        monitoringNamespace: string,
        options: DataSetsOptions
    ): Promise<PaginatedObjects<MalDataApprovalItem>> {
        const appSettings = await this.appSettingsRepository.get();
        const result = await this.malDataRepository.get(options);
        const monitoringValue = await this.monitoringValueRepository.get(monitoringNamespace);

        const response = await promiseMap(result.objects, async item => {
            const dataElementsWithValues = await new WmrDiffReport(
                this.dataValueRepository,
                this.dataSetRepository,
                appSettings
            ).getDiff(item.dataSetUid, item.orgUnitUid, item.period);

            return {
                ...item,
                monitoring: monitoringValue ? getDataDuplicationItemMonitoringValue(item, monitoringValue) : false,
                modificationCount: dataElementsWithValues.length > 0 ? String(dataElementsWithValues.length) : "",
            };
        });

        return { ...result, objects: response };
    }
}
