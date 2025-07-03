import { Maybe } from "../../../../types/utils";
import { NamedRef } from "../../../common/entities/Ref";

export type DataElementSubscription = {
    dataElement: NamedRef;
    dataElementGroups: NamedRef[];
    section: Maybe<NamedRef>;
};
