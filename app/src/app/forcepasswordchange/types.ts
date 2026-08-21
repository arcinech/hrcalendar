export type ChangePasswordState = {
	success?: boolean | false;
	error?: string | null;
	message?: string | null;
	status: number;
};

export const defaultState: ChangePasswordState = {
	success: false,
	error: null,
	message: null,
	status: 0,
};
