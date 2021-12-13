import React from "react";
import { MenuItem, Select } from "@material-ui/core";
import DropdownForm from "./DropdownForm";

type Value = string;

interface MultipleDropdownProps {
    className?: string;
    items: Array<{ value: Value; text: string }>;
    onChange: (values: Value[]) => void;
    label: string;
    values: Value[];
}

const MultipleDropdown: React.FC<MultipleDropdownProps> = props => {
    const { items, values, onChange, label, className } = props;
    const notifyChange = React.useCallback(ev => onChange(ev.target.value as string[]), [onChange]);

    return (
        <DropdownForm label={label} className={className}>
            <Select
                multiple={true}
                data-test-multiple-dropdown={label}
                value={values}
                onChange={notifyChange}
                MenuProps={menuPropsBottomLeft}
            >
                {items.map(item => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.text}
                    </MenuItem>
                ))}
            </Select>
        </DropdownForm>
    );
};

const menuPropsBottomLeft = {
    getContentAnchorEl: null,
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
} as const;

export default React.memo(MultipleDropdown);
