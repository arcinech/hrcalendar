export type PossibleStates = {
	error?: string | null;
	message?: string | null;
	status: number;
};

export const defaultState: PossibleStates = {
	error: null,
	message: null,
	status: 0,
};
