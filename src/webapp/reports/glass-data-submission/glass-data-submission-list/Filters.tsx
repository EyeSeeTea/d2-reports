import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
    OrgUnitsFilterButton,
    OrgUnitsFilterButtonProps,
} from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { Id } from "../../../../domain/common/entities/Base";
import { useAppContext } from "../../../contexts/app-context";
import _ from "lodash";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import { D2Api, MetadataPick } from "../../../../types/d2-api";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { Dropdown, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import { Status } from "../DataSubmissionViewModel";

export interface DataSetsFiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus?: boolean;
    submissionStatus?: Status;
}

interface FilterOptions {
    periods: string[];
}

const selectableOULevels = ["1", "2", "3"];
const orgUnitParams = {
    organisationUnits: {
        filter: { level: { in: selectableOULevels } },
        fields: {
            id: true,
            path: true,
            name: true,
            level: true,
            children: {
                level: true,
                path: true,
                children: {
                    level: true,
                    path: true,
                },
            },
        },
    },
} as const;
type OrgUnit = MetadataPick<typeof orgUnitParams>["organisationUnits"][number];

export const statusItems = [
    { value: "NOT_COMPLETED", text: i18n.t("Not Completed") },
    { value: "COMPLETE", text: i18n.t("Data to be approved by country") },
    { value: "PENDING_APPROVAL", text: i18n.t("Waiting WHO Approval") },
    { value: "REJECTED", text: i18n.t("Rejected By WHO") },
    { value: "APPROVED", text: i18n.t("Approved") },
    { value: "UPDATE_REQUEST_ACCEPTED", text: i18n.t("Data update request accepted") },
    { value: "PENDING_UPDATE_APPROVAL", text: i18n.t("Waiting for WHO to approve your update request") },
];

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    const completionStatusItems = React.useMemo(() => {
        return [
            { value: "true", text: i18n.t("Completed") },
            { value: "false", text: i18n.t("Not completed") },
        ];
    }, []);

    const submissionStatusItems = React.useMemo(() => statusItems, []);

    useEffect(() => {
        async function getOrganisationUnits(api: D2Api): Promise<OrgUnit[]> {
            const { organisationUnits } = await api.metadata.get(orgUnitParams).getData();
            return _.orderBy(organisationUnits, "level", "asc");
        }

        getOrganisationUnits(api).then(value => setOrgUnits(value));
    }, [api]);

    const { orgUnitPaths } = filter;
    const orgUnitsByPath = React.useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const setOrgUnitPaths = React.useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        newSelectedPaths => {
            const prevSelectedPaths = orgUnitPaths;
            const addedPaths = _.difference(newSelectedPaths, prevSelectedPaths);
            const removedPaths = _.difference(prevSelectedPaths, newSelectedPaths);

            const pathsToAdd = _.flatMap(addedPaths, addedPath => {
                const orgUnit = orgUnitsByPath[addedPath];

                if (orgUnit && orgUnit.level < countryLevel) {
                    return [orgUnit, ...orgUnit.children, ...orgUnit.children.flatMap(child => child.children)].map(
                        ou => ou.path
                    );
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
            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={setOrgUnitPaths}
                selectableLevels={[1, 2, 3]}
            />

            <DropdownStyled
                items={periodItems}
                values={filter.periods}
                onChange={setPeriods}
                label={i18n.t("Periods")}
            />

            <SingleDropdownStyled
                items={completionStatusItems}
                value={fromBool(filter.completionStatus)}
                onChange={setCompletionStatus}
                label={i18n.t("Questionnaire completed")}
            />

            <SingleDropdownStyled
                items={submissionStatusItems}
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

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];

const countryLevel = 3;
