import _ from "lodash";
import { DataValue, DataValuesSelector, DataValueToPost } from "../../domain/common/entities/DataValue";
import { Stats } from "../../domain/common/entities/Stats";
import { DataValuesRepository } from "../../domain/common/repositories/DataValuesRepository";
import { D2Api } from "../../types/d2-api";
import { promiseMap } from "../../utils/promises";

export class DataValuesD2Repository implements DataValuesRepository {
    constructor(private api: D2Api) {}

    async get(options: DataValuesSelector): Promise<DataValue[]> {
        const res$ = this.api.dataValues.getSet({
            dataSet: options.dataSetIds || [],
            orgUnit: options.orgUnitIds || [],
            period: options.periods,
        });

        const res = await res$.getData();
        return res.dataValues;
    }

    async saveAll(dataValues: DataValueToPost[]): Promise<Stats> {
        return this.saveDataValues(dataValues, "CREATE_AND_UPDATE");
    }

    async deleteAll(dataValues: DataValueToPost[]): Promise<Stats> {
        return this.saveDataValues(dataValues, "DELETE");
    }

    async saveDataValues(
        dataValues: DataValueToPost[],
        importStrategy: "CREATE_AND_UPDATE" | "DELETE"
    ): Promise<Stats> {
        if (_.isEmpty(dataValues)) return { deleted: 0, ignored: 0, imported: 0, updated: 0 };

        const result = await promiseMap(_.chunk(dataValues, 50), async dataValues => {
            const res = (await this.api.dataValues
                .postSet({ force: true, importStrategy }, { dataValues })
                .getData()) as unknown as ResponseDataValues;

            if (res.status !== "OK") {
                throw new Error(`Error on post: ${JSON.stringify(res, null, 4)}`);
            }

            return res.response.importCount;
        });

        return {
            imported: _(result).sumBy(x => x.imported),
            updated: _(result).sumBy(x => x.updated),
            ignored: _(result).sumBy(x => x.ignored),
            deleted: _(result).sumBy(x => x.deleted),
        };
    }
}

type ResponseDataValues = {
    status: string;
    response: {
        importCount: {
            imported: number;
            updated: 0;
            ignored: 0;
            deleted: 0;
        };
    };
};
