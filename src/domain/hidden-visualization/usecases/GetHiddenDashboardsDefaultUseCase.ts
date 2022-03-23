import { HiddenDashboardResult } from "../../common/entities/HiddenDashboardResult";
import { HiddenDashboardsRepository } from "../repositories/HiddenDashboardsRepository";

export class GetHiddenDashboardsDefaultUseCase {
    constructor(private hiddenDashboardsRepository: HiddenDashboardsRepository) {}

    execute(): Promise<HiddenDashboardResult[]> {
        return this.hiddenDashboardsRepository.getHiddenDashboards();
    }
}
