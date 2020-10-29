import _ from "lodash";
import { SnackbarState } from "d2-ui-components";

interface Options<T> {
    onFinally?(): void;
    onCatch?(): void;
}

export async function useSnackbarOnError<T>(
    snackbar: SnackbarState,
    fn: () => Promise<T>,
    options?: Options<T>
): Promise<T | undefined> {
    const { onCatch, onFinally } = options || {};
    try {
        const res = await fn();
        return res;
    } catch (err) {
        const bodyMessage = err.response?.data?.message;
        console.error(err);
        if (onCatch) onCatch();
        const message = _([err.message || err?.toString(), bodyMessage])
            .compact()
            .join(" - ");
        snackbar.error(message);
        return undefined;
    } finally {
        if (onFinally) onFinally();
    }
}
