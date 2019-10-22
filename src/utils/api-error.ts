
export class ApiError extends Error {
    constructor({message, status, stack}: {message: string, status?: number, stack?: string}) {
        super(message);
        this.status = status || httpStatus.INTERNAL_SERVER_ERROR;
        this.stack = stack;

        console.error(stack);
    }

    readonly status: number;
}
