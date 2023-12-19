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
import { Module, Status } from "../DataSubmissionViewModel";
import { DataSubmissionPeriod } from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { useDataSubmissionList } from "./useDataSubmissionList";

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

    const setModule = useCallback<SingleDropdownHandler>(
        module => {
            onChange(filter => ({ ...filter, module: module as Module }));
        },
        [onChange]
    );

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

            onChange(prev => ({ ...prev, orgUnitPaths: newSelectedPathsWithChildren }));
        },
        [onChange, orgUnitPaths, orgUnitsByPath]
    );

    const setPeriods = React.useCallback<DropdownHandler>(
        periods => onChange(prev => ({ ...prev, periods })),
        [onChange]
    );

    const setStartDate = React.useCallback<DatePickerHandler>(
        from => onChange(prev => ({ ...prev, from })),
        [onChange]
    );

    const setEndDate = React.useCallback<DatePickerHandler>(to => onChange(prev => ({ ...prev, to })), [onChange]);

    const setQuarters = React.useCallback<DropdownHandler>(
        quarters => onChange(prev => ({ ...prev, quarters })),
        [onChange]
    );

    const setCompletionStatus = React.useCallback<SingleDropdownHandler>(
        completionStatus => {
            onChange(filter => ({ ...filter, completionStatus: toBool(completionStatus) }));
        },
        [onChange]
    );

    const setSubmissionStatus = React.useCallback<SingleDropdownHandler>(
        submissionStatus => {
            onChange(filter => ({ ...filter, submissionStatus: submissionStatus as Status }));
        },
        [onChange]
    );

    return (
        <Container>
            <SingleDropdownStyled
                items={moduleItems}
                value={filter.module}
                onChange={setModule}
                label={i18n.t("Module")}
            />

            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={setOrgUnitPaths}
                selectableLevels={[1, 2, 3]}
            />

            {!isEARModule ? (
                <DropdownStyled
                    items={periodItems}
                    values={filter.periods}
                    onChange={setPeriods}
                    label={i18n.t("Years")}
                />
            ) : (
                <>
                    <DatePickerStyled
                        label="From"
                        value={filter.from ?? null}
                        maxDate={filter.to}
                        onChange={setStartDate}
                    />
                    <DatePickerStyled
                        label="To"
                        value={filter.to ?? null}
                        minDate={filter.from}
                        maxDate={new Date()}
                        onChange={setEndDate}
                    />
                </>
            )}

            {dataSubmissionPeriod === "QUARTERLY" && (
                <DropdownStyled
                    items={quarterItems}
                    values={filter.quarters}
                    onChange={setQuarters}
                    label={i18n.t("Quarters")}
                />
            )}

            {!isEARModule && (
                <SingleDropdownStyled
                    items={completionStatusItems}
                    value={fromBool(filter.completionStatus)}
                    onChange={setCompletionStatus}
                    label={i18n.t("Questionnaire completed")}
                />
            )}

            <SingleDropdownStyled
                items={isEARModule ? earSubmissionStatusItems : submissionStatusItems}
                value={filter.submissionStatus}
                onChange={setSubmissionStatus}
                label={i18n.t("Status")}
            />
        </Container>
    );
});

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
