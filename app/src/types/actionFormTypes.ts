export type ActionFormTypes = {
	error?: string | null;
	message?: string | null;
	status: number;
};

export const initialState: ActionFormTypes = {
	error: null,
	message: null,
	status: 0,
};
