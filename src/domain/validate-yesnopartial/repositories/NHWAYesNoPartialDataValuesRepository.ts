import { YesNoPartialViewModel } from "../../../webapp/reports/validate-yesnopartial/ValidateYesNoPartialnReportViewModel";
import { Config } from "../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../common/entities/PaginatedObjects";
import { DataValueItem, DataValueItemIdentifier } from "../entities/DataValueItem";
import { Id } from "../../common/entities/Base";

export interface NHWAYesNoPartialDataValuesRepository {
    get(options: NHWAYesNoPartialDataValuesRepositoryGetOptions): Promise<PaginatedObjects<DataValueItem>>;
    push(dataValues: DataValueItemIdentifier[], option: string): Promise<boolean>;
}

export interface NHWAYesNoPartialDataValuesRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<YesNoPartialViewModel>;
    periods: string[];
    orgUnitIds: Id[];
}
