import React from "react";
import { Id } from "../../../domain/common/entities/Base";
import { useReload } from "../../utils/use-reload";

export function useDataEntrySelector(): { orgUnitId: Id; dataSetId: Id; period: string; reloadKey: string } {
    const [reloadKey, reload] = useReload();
    const { dhis2 } = window;
    const isRunningInDataEntry = dhis2;

    React.useEffect(() => {
        if (!dhis2) return;
        dhis2.util.on(dhis2.de.event.dataValuesLoaded, () => {
            console.debug("dhis2.de.event.dataValuesLoaded");
            reload();
        });
    });

    if (isRunningInDataEntry) {
        return {
            orgUnitId: dhis2.de.currentOrganisationUnitId,
            dataSetId: dhis2.de.currentDataSetId,
            period: dhis2.de.getSelectedPeriod()?.iso || "",
            reloadKey,
        };
    } else {
        const params = new URLSearchParams(window.location.search);

        return {
            orgUnitId: params.get("orgUnitId") || "jFOZHDZpjPL", // Angola
            period: params.get("period") || "2019",
            dataSetId: "r8DqSf2FDvP",
            reloadKey,
        };
    }
}

interface Period {
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
    id: string;
    iso: string;
    name: string;
}

declare global {
    interface Window {
        dhis2?: {
            de: {
                currentOrganisationUnitId: Id;
                currentDataSetId: Id;
                getSelectedPeriod: () => Period | undefined;
                event: { dataValuesLoaded: string };
            };
            util: {
                on: (event: string, action: () => void) => void;
            };
        };
    }
}
