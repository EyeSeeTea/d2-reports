import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
    OrgUnitsFilterButton,
    OrgUnitsFilterButtonProps,
} from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { useAppContext } from "../../../contexts/app-context";
import _ from "lodash";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import { D2Api } from "../../../../types/d2-api";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import {
    Dropdown,
    DropdownProps,
    MultipleDropdownProps,
    DatePicker,
    DatePickerProps,
} from "@eyeseetea/d2-ui-components";
import {
    DataSubmissionPeriod,
    Module,
    Status,
} from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { useDataSubmissionList } from "./useDataSubmissionList";
import { Button } from "@material-ui/core";

export interface DataSetsFiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
    dataSubmissionPeriod?: DataSubmissionPeriod;
    isEARModule?: boolean;
}

export interface Filter {
    module: Module | undefined;
    orgUnitPaths: Id[];
    periods: string[];
    quarters: string[];
    from: Date | undefined;
    to: Date | undefined;
    completionStatus?: boolean;
    submissionStatus?: Status;
}

interface FilterOptions {
    periods: string[];
}

type OrgUnit = {
    id: string;
    name: string;
    level: number;
    path: string;
    children?: OrgUnit[];
};

export const statusItems = [
    { value: "NOT_COMPLETED", text: i18n.t("Not Completed") },
    { value: "COMPLETE", text: i18n.t("Data to be approved by country") },
    { value: "PENDING_APPROVAL", text: i18n.t("Waiting WHO Approval") },
    { value: "REJECTED", text: i18n.t("Rejected By WHO") },
    { value: "APPROVED", text: i18n.t("Approved") },
    { value: "UPDATE_REQUEST_ACCEPTED", text: i18n.t("Data update request accepted") },
    { value: "PENDING_UPDATE_APPROVAL", text: i18n.t("Waiting for WHO to approve your update request") },
];

export const earStatusItems = [
    { value: "DRAFT", text: i18n.t("Draft") },
    { value: "PENDING_APPROVAL", text: i18n.t("Waiting WHO Approval") },
    { value: "REJECTED", text: i18n.t("Rejected By WHO") },
    { value: "APPROVED", text: i18n.t("Approved") },
];

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const { dataSubmissionPeriod, isEARModule, userModules } = useDataSubmissionList(filter);

    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const quarterItems = React.useMemo(() => {
        return [
            { value: "Q1", text: i18n.t("January-March") },
            { value: "Q2", text: i18n.t("April-June") },
            { value: "Q3", text: i18n.t("July-September") },
            { value: "Q4", text: i18n.t("October-December") },
        ];
    }, []);

    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const [filterValues, setFilterValues] = useState(emptySubmissionFilter);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    const moduleItems = useMemoOptionsFromNamedRef(userModules);

    const completionStatusItems = React.useMemo(() => {
        return [
            { value: "true", text: i18n.t("Completed") },
            { value: "false", text: i18n.t("Not completed") },
        ];
    }, []);

    const submissionStatusItems = React.useMemo(() => statusItems, []);
    const earSubmissionStatusItems = React.useMemo(() => earStatusItems, []);

    useEffect(() => {
        async function getOrganisationUnits(api: D2Api): Promise<OrgUnit[]> {
            const { organisationUnits } = await api.metadata
                .get({
                    organisationUnits: {
                        fields: {
                            id: true,
                            name: true,
                            level: true,
                            path: true,
                            children: {
                                id: true,
                                name: true,
                                level: true,
                                path: true,
                                children: { id: true, name: true, level: true, path: true },
                            },
                        },
                        filter: { level: { eq: "1" } },
                    },
                })
                .getData();

            const ou2 = organisationUnits.flatMap(ou => ou.children);
            const ou3 = ou2.flatMap(ou => ou.children);
            const all = _.union(organisationUnits, ou2, ou3);

            return _.orderBy(all, "level", "asc");
        }

        getOrganisationUnits(api).then(value => setOrgUnits(value));
    }, [api]);

    const { orgUnitPaths } = filter;
    const orgUnitsByPath = React.useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const setModule = useCallback<SingleDropdownHandler>(module => {
        setFilterValues(filter => ({ ...filter, module: module as Module }));
    }, []);

    const setOrgUnitPaths = React.useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        newSelectedPaths => {
            const prevSelectedPaths = orgUnitPaths;
            const addedPaths = _.difference(newSelectedPaths, prevSelectedPaths);
            const removedPaths = _.difference(prevSelectedPaths, newSelectedPaths);

            const pathsToAdd = _.flatMap(addedPaths, addedPath => {
                const orgUnit = orgUnitsByPath[addedPath];
                if (orgUnit && orgUnit.level < countryLevel) {
                    return _.compact(
                        _.union(
                            [orgUnit],
                            orgUnit.children,
                            orgUnit.children?.flatMap(child => child.children)
                        )
                    ).map(ou => ou.path);
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

    const setPeriods = React.useCallback<DropdownHandler>(
        periods => setFilterValues(prev => ({ ...prev, periods })),
        []
    );

    const setStartDate = React.useCallback<DatePickerHandler>(from => setFilterValues(prev => ({ ...prev, from })), []);

    const setEndDate = React.useCallback<DatePickerHandler>(to => setFilterValues(prev => ({ ...prev, to })), []);

    const setQuarters = React.useCallback<DropdownHandler>(
        quarters => setFilterValues(prev => ({ ...prev, quarters })),
        []
    );

    const setCompletionStatus = React.useCallback<SingleDropdownHandler>(completionStatus => {
        setFilterValues(filter => ({ ...filter, completionStatus: toBool(completionStatus) }));
    }, []);

    const setSubmissionStatus = React.useCallback<SingleDropdownHandler>(submissionStatus => {
        setFilterValues(filter => ({ ...filter, submissionStatus: submissionStatus as Status }));
    }, []);

    const applyFilters = useCallback(() => {
        onChange(filterValues);
    }, [filterValues, onChange]);

    const clearFilters = useCallback(() => {
        onChange(emptySubmissionFilter);
        setFilterValues(emptySubmissionFilter);
    }, [onChange]);

    return (
        <>
            <Container>
                <SingleDropdownStyled
                    items={moduleItems}
                    value={filterValues.module}
                    onChange={setModule}
                    label={i18n.t("Module")}
                />

                <OrgUnitsFilterButton
                    api={api}
                    rootIds={rootIds}
                    selected={filterValues.orgUnitPaths}
                    setSelected={setOrgUnitPaths}
                    selectableLevels={[1, 2, 3]}
                />

                {!isEARModule ? (
                    <DropdownStyled
                        items={periodItems}
                        values={filterValues.periods}
                        onChange={setPeriods}
                        label={i18n.t("Years")}
                    />
                ) : (
                    <>
                        <DatePickerStyled
                            label="From"
                            value={filterValues.from ?? null}
                            maxDate={filterValues.to}
                            onChange={setStartDate}
                        />
                        <DatePickerStyled
                            label="To"
                            value={filterValues.to ?? null}
                            minDate={filterValues.from}
                            maxDate={new Date()}
                            onChange={setEndDate}
                        />
                    </>
                )}

                {dataSubmissionPeriod === "QUARTERLY" && (
                    <DropdownStyled
                        items={quarterItems}
                        values={filterValues.quarters}
                        onChange={setQuarters}
                        label={i18n.t("Quarters")}
                    />
                )}

                {!isEARModule && (
                    <SingleDropdownStyled
                        items={completionStatusItems}
                        value={fromBool(filterValues.completionStatus)}
                        onChange={setCompletionStatus}
                        label={i18n.t("Questionnaire completed")}
                    />
                )}

                <SingleDropdownStyled
                    items={isEARModule ? earSubmissionStatusItems : submissionStatusItems}
                    value={filterValues.submissionStatus}
                    onChange={setSubmissionStatus}
                    label={i18n.t("Status")}
                />
            </Container>

            <FilterButtonContainer>
                <Button disabled={!filterValues.module} onClick={applyFilters} variant="contained" color="primary">
                    {i18n.t("Apply filters")}
                </Button>

                <Button onClick={clearFilters} variant="contained">
                    {i18n.t("Clear filters")}
                </Button>
            </FilterButtonContainer>
        </>
    );
});

export const emptySubmissionFilter: Filter = {
    module: undefined,
    orgUnitPaths: [],
    periods: [],
    quarters: ["Q1"],
    from: undefined,
    to: undefined,
    completionStatus: undefined,
    submissionStatus: undefined,
};

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const FilterButtonContainer = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: end;
    width: 100%;
`;

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 250px;
`;

const DatePickerStyled = styled(DatePicker)`
    margin-top: -8px;
`;

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
type DatePickerHandler = DatePickerProps["onChange"];

const countryLevel = 3;
