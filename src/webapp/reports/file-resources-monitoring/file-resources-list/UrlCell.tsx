import { useCallback, useState } from "react";
import { Tooltip } from "@material-ui/core";
import { FileResourcesViewModel } from "./FileResourcesViewModel";
import i18n from "../../../../locales";

export function showURLCell(row: FileResourcesViewModel) {
    return <UrlCell row={row} />;
}

interface UrlCellProps {
    row: FileResourcesViewModel;
}

export function UrlCell({ row }: UrlCellProps) {
    const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

    const handleCopy = useCallback(
        async (event: React.MouseEvent<HTMLAnchorElement>) => {
            if (!row.ownerUrl) return;

            event.preventDefault();

            try {
                await navigator.clipboard.writeText(row.ownerUrl);
                setShowCopiedTooltip(true);
                setTimeout(() => setShowCopiedTooltip(false), 2000);
            } catch (error) {
                console.error("Error copying to clipboard:", error);
            }
        },
        [row.ownerUrl]
    );

    return (
        <Tooltip title={showCopiedTooltip ? i18n.t("URL copied") : ""} open={showCopiedTooltip} placement="top">
            <a href={row.ownerUrl} onClick={handleCopy}>
                {row.ownerUrl}
            </a>
        </Tooltip>
    );
}
