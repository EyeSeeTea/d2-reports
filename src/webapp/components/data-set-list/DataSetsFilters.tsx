import React from "react";
import i18n from "../../../locales";
import MultipleDropdown from "../../components/dropdown/MultipleDropdown";
import { Id, NamedRef } from "../../../domain/entities/Base";
import { useAppContext } from "../../contexts/app-context";
import { getRootIds } from "../../../domain/entities/OrgUnit";
import { OrgUnitsFilterButton } from "./OrgUnitsFilterButton";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange(newFilters: DataSetsFilter): void;
}

export interface DataSetsFilter {
    dataSetIds: Id[];
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus: string[];
}

interface FilterOptions {
    dataSets: NamedRef[];
    periods: string[];
    completionStatus: string[];
}

export const DataSetsFilters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);
    const completionStatusItems = useMemoOptionsFromStrings(filterOptions.completionStatus);

    return (
        <div>
            <MultipleDropdown
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={dataSetIds => onChange({ ...filter, dataSetIds })}
                label={i18n.t("Data sets")}
            />

            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={paths => onChange({ ...filter, orgUnitPaths: paths })}
            />

            <MultipleDropdown
                items={periodItems}
                values={filter.periods}
                onChange={periods => onChange({ ...filter, periods })}
                label={i18n.t("Periods")}
            />

            <MultipleDropdown
                items={completionStatusItems}
                values={filterOptions.completionStatus}
                onChange={completionStatus => onChange({ ...filter, completionStatus })}
                label={i18n.t("Completion status")}
            />
        </div>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return React.useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return React.useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}
