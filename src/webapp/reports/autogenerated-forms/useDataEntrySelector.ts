import React from "react";
import _ from "lodash";
import { Id } from "../../../domain/common/entities/Base";
import { Maybe } from "../../../utils/ts-utils";
import { useReload } from "../../utils/use-reload";

type DataEntrySelectorRes = {
    orgUnitId: Id;
    dataSetId: Id;
    period: string;
    reloadKey: string;
    initForm: () => void;
};

export function useDataEntrySelector(): DataEntrySelectorRes {
    const [reloadKey, reload] = useReload();
    const { dhis2 } = window;
    const isRunningInDataEntry = dhis2;

    React.useEffect(() => {
        if (dhis2) {
            dhis2.util.on(dhis2.de.event.dataValuesLoaded, () => {
                reload();
            });
        }
    });

    if (isRunningInDataEntry) {
        return {
            orgUnitId: dhis2.de.currentOrganisationUnitId,
            dataSetId: dhis2.de.currentDataSetId,
            period: dhis2.de.getSelectedPeriod()?.iso || "",
            reloadKey,
            initForm: dhis2.de.addEventListeners,
        };
    } else {
        const params = new URLSearchParams(window.location.search);
        const orgUnitId = params.get("orgUnit");
        const dataSetId = params.get("dataSet");
        const period = params.get("period");

        if (!(orgUnitId && dataSetId && period))
            throw new Error(`Usage: ${window.location.origin}?orgUnit=ID&dataSet=ID&period=PERIOD`);

        return {
            orgUnitId,
            dataSetId,
            period,
            reloadKey,
            initForm: _.noop,
        };
    }
}

interface Period {
    startDate: string;
    endDate: string;
    id: string;
    iso: string;
    name: string;
}

declare global {
    interface Window {
        // It should be set when rendered in Data Entry App, but not on development.
        dhis2?: {
            de: {
                currentOrganisationUnitId: Id;
                currentDataSetId: Id;
                getSelectedPeriod(): Maybe<Period>;
                addEventListeners(): void;
                event: { dataValuesLoaded: string };
            };
            util: {
                on: (event: string, action: () => void) => void;
            };
        };
    }
}
