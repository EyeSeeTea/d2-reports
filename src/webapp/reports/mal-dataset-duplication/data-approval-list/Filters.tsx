import { Dropdown, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import i18n from "../../../../locales";
import { D2Api } from "../../../../types/d2-api";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import {
    OrgUnitsFilterButton,
    OrgUnitsFilterButtonProps,
} from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<DataSetsFilter>>;
}

export interface DataSetsFilter {
    dataSetIds: Id[];
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus?: boolean;
    approvalStatus?: boolean;
}

interface FilterOptions {
    dataSets: NamedRef[];
    periods: string[];
}

interface OrgUnit {
    id: Id;
    path: string;
    name: string;
    level: number;
    children: {
        level: number;
        path: string;
    }[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>();

    const completionStatusItems = React.useMemo(() => {
        return [
            { value: "true", text: i18n.t("Completed") },
            { value: "false", text: i18n.t("Not completed") },
        ];
    }, []);

    const approvalStatusItems = React.useMemo(() => {
        return [
            { value: "true", text: i18n.t("Submitted") },
            { value: "false", text: i18n.t("Ready for submission") },
        ];
    }, []);

    useEffect(() => {
        async function getOrganisationUnits(api: D2Api, levels: string[]): Promise<OrgUnit[]> {
            const { organisationUnits } = await api.metadata
                .get({
                    organisationUnits: {
                        filter: { level: { in: levels } },
                        fields: {
                            id: true,
                            path: true,
                            name: true,
                            level: true,
                            children: { level: true, path: true },
                        },
                    },
                })
                .getData();

            return _.orderBy(organisationUnits, "level", "asc");
        }

        const levels = ["1", "2", "3"];
        getOrganisationUnits(api, levels).then(value => setOrgUnits(value));
    }, [api]);

    const setOrgUnitPaths = React.useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        paths => {
            const childrenPaths: string[] = [];
            const childrenPathsSelected: string[] = [];
            
            paths.map(path => {
                orgUnits?.map(ou => {
                    if (ou.path === path) {
                        childrenPaths.push(ou.path);
                        if (childrenPathsSelected.includes(path)) {
                            childrenPathsSelected.filter(s => !s.includes(path));
                        } else if (!childrenPathsSelected.includes(path)) {
                            childrenPathsSelected.push(ou.path);
                        }
                        ou.children.map(child => {
                            if (child.level <= 3) {
                                childrenPaths.push(child.path);
                                if (childrenPathsSelected.includes(child.path)) {
                                    childrenPathsSelected.filter(s => s !== child.path);
                                } else {
                                    childrenPathsSelected.push(child.path);
                                }
                            }
                            return childrenPathsSelected;
                        });
                    }
                    return childrenPathsSelected;
                });
                return childrenPathsSelected;
            });

            onChange(prev => ({
                ...prev,
                orgUnitPaths: childrenPathsSelected,
            }));
        },
        [onChange, orgUnits]
    );

    const setDataSetIds = React.useCallback<DropdownHandler>(
        dataSetIds => onChange(prev => ({ ...prev, dataSetIds })),
        [onChange]
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

    const setApprovalStatus = React.useCallback<SingleDropdownHandler>(
        approvalStatus => {
            onChange(filter => ({ ...filter, approvalStatus: toBool(approvalStatus) }));
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
            />

            <DropdownStyled
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={setDataSetIds}
                label={i18n.t("Data sets")}
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
                label={i18n.t("Completion status")}
            />

            <SingleDropdownStyled
                items={approvalStatusItems}
                value={fromBool(filter.approvalStatus)}
                onChange={setApprovalStatus}
                label={i18n.t("Submission status")}
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
    width: 180px;
`;

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
