import { Tooltip } from "@material-ui/core";
import styled from "styled-components";
import { FileResourcesViewModel } from "./FileResourcesViewModel";
import i18n from "../../../../locales";

const StyledTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)`
    & .MuiTooltip-tooltip {
        font-size: 14px;
    }
`;

export function showTooltip(row: FileResourcesViewModel) {
    const text = row.type;
    if (text === "Orphan") {
        return (
            <StyledTooltip
                title={i18n.t(
                    "This is an orphan fileResource. A file resource is orphan when it doesn't have any relation with an owner (document, dataValue, userAvatar, messageAttachment)"
                )}
                arrow
            >
                {<span>{text} *</span>}
            </StyledTooltip>
        );
    } else {
        return text;
    }
}
