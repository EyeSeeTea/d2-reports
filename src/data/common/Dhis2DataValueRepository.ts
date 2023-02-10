import { Id } from "../../domain/common/entities/Base";
import { DataValue, Period } from "../../domain/common/entities/DataValue";
import { DataValueRepository } from "../../domain/common/repositories/DataValueRepository";
import { D2Api } from "../../types/d2-api";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(options: { dataSetId: Id; orgUnitId: Id; period: Period }): Promise<DataValue[]> {
        const res = await this.api.dataValues
            .getSet({
                dataSet: [options.dataSetId],
                orgUnit: [options.orgUnitId],
                period: [options.period],
            })
            .getData();

        return res.dataValues.map(
            (dv): DataValue => ({
                dataElementId: dv.dataElement,
                value: dv.value,
                orgUnitId: dv.orgUnit,
                period: dv.period,
                categoryOptionComboId: dv.categoryOptionCombo,
            })
        );
    }

    async save(dataValue: DataValue): Promise<void> {
        return this.api.dataValues
            .post({
                ou: dataValue.orgUnitId,
                pe: dataValue.period,
                de: dataValue.dataElementId,
                value: dataValue.value,
            })
            .getData();
    }
}
