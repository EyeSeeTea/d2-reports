import { NamedRef } from "../../../common/entities/Ref";
import { DataElementSubscription } from "./DataElementSubscription";

type BaseSubscription = NamedRef & { children: DataElementSubscription[] };

export type DashboardSubscription = BaseSubscription & { type: "dashboards" };

export type VisualizationSubscription = BaseSubscription & { type: "visualizations" };
