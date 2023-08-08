import { Id } from "../../../common/entities/Base";

export type DataElementTotal = {
    dataElementTotal: Id;
    categoryOptionCombo: Id;
    children: DataElementChildren[];
};

export type DataElementChildren = {
    dataElement: Id;
};
