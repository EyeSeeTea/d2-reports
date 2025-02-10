import { DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataSetsFilter } from "./Filters";
import { useAppContext } from "../../../contexts/app-context";
import { OrgUnitWithChildren } from "../../../../domain/reports/mal-data-approval/entities/OrgUnitWithChildren";
import { getOrgUnitsFromId, getRootIds } from "../../../../domain/common/entities/OrgUnit";
import _ from "lodash";
import { OrgUnitsFilterButtonProps } from "../../../components/org-units-filter/OrgUnitsFilterButton";

type DataSubmissionFilterProps = {
    values: DataSetsFilter;
    onChange: (filter: DataSetsFilter) => void;
};

type DataSubmissionFilterState = {
    filterValues: DataSetsFilter;
    rootIds: string[];
    selectableIds: string[];
    applyFilters: () => void;
    clearFilters: () => void;
    setFilterValues: {
        dataSetIds: DropdownHandler;
        orgUnitPaths: OrgUnitsFilterButtonProps["setSelected"];
        periods: DropdownHandler;
        completionStatus: SingleDropdownHandler;
        approvalStatus: SingleDropdownHandler;
    };
};

export function useDataSubmissionFilters(filterProps: DataSubmissionFilterProps): DataSubmissionFilterState {
    const { config, compositionRoot } = useAppContext();
    const { values: filter, onChange } = filterProps;
    const { orgUnitPaths } = filter;

    const [filterValues, setFilterValues] = useState(emptySubmissionFilter);
    const [orgUnits, setOrgUnits] = useState<OrgUnitWithChildren[]>([]);

    useEffect(() => {
        compositionRoot.malDataApproval.getOrgUnitsWithChildren().then(setOrgUnits);
    }, [compositionRoot.malDataApproval]);

    const dataSetOrgUnits = getOrgUnitsFromId(config.orgUnits, orgUnits);
    const selectableOUs = _.union(
        orgUnits.filter(org => org.level < 3),
        dataSetOrgUnits
    );
    const selectableIds = selectableOUs.map(ou => ou.id);
    const rootIds = useMemo(() => getRootIds(selectableOUs), [selectableOUs]);
    const orgUnitsByPath = useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const setOrgUnitPaths = useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        newSelectedPaths => {
            const prevSelectedPaths = orgUnitPaths;
            const addedPaths = _.difference(newSelectedPaths, prevSelectedPaths);
            const removedPaths = _.difference(prevSelectedPaths, newSelectedPaths);

            const pathsToAdd = _.flatMap(addedPaths, addedPath => {
                const orgUnit = orgUnitsByPath[addedPath];

                if (orgUnit && orgUnit.level < countryLevel) {
                    return [orgUnit, ...orgUnit.children].map(ou => ou.path);
                } else {
                    return [addedPath];
                }
            });

            const pathsToRemove = _.flatMap(removedPaths, pathToRemove => {
                return prevSelectedPaths.filter(path => path.startsWith(pathToRemove));
            });

            const newSelectedPathsWithChildren = _(prevSelectedPaths)
                .union(pathsToAdd)
                .difference(pathsToRemove)
                .uniq()
                .value();

            setFilterValues(prev => ({ ...prev, orgUnitPaths: newSelectedPathsWithChildren }));
        },
        [orgUnitPaths, orgUnitsByPath]
    );

    const setDataSetIds = useCallback<DropdownHandler>(
        dataSetIds => setFilterValues({ ...filter, dataSetIds }),
        [filter, setFilterValues]
    );

    const setPeriods = useCallback<DropdownHandler>(
        periods => setFilterValues({ ...filter, periods: periods }),
        [filter, setFilterValues]
    );

    const setCompletionStatus = useCallback<SingleDropdownHandler>(
        completionStatus => setFilterValues({ ...filter, completionStatus: toBool(completionStatus) }),
        [filter, setFilterValues]
    );

    const setApprovalStatus = useCallback<SingleDropdownHandler>(
        approvalStatus => setFilterValues({ ...filter, approvalStatus: toBool(approvalStatus) }),
        [filter, setFilterValues]
    );

    const applyFilters = useCallback(() => {
        onChange(filterValues);
    }, [filterValues, onChange]);

    const clearFilters = useCallback(() => {
        onChange(emptySubmissionFilter);
        setFilterValues(emptySubmissionFilter);
    }, [onChange]);

    return {
        filterValues: filterValues,
        rootIds: rootIds,
        selectableIds: selectableIds,
        applyFilters: applyFilters,
        clearFilters: clearFilters,
        setFilterValues: {
            dataSetIds: setDataSetIds,
            orgUnitPaths: setOrgUnitPaths,
            periods: setPeriods,
            completionStatus: setCompletionStatus,
            approvalStatus: setApprovalStatus,
        },
    };
}

const countryLevel = 3;

export const emptySubmissionFilter: DataSetsFilter = {
    dataSetIds: [],
    orgUnitPaths: [],
    periods: [],
    completionStatus: undefined,
    approvalStatus: undefined,
};

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
