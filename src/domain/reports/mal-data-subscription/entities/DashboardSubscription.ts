import { NamedRef } from "../../../common/entities/Ref";
import { DataElementSubscription } from "./DataElementSubscription";

export type DashboardSubscription = { dashboard: NamedRef; children: DataElementSubscription[] };
