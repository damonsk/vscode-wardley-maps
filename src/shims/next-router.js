// Minimal shim for next/router in non-Next.js environments
export const useRouter = () => ({
	query: {},
	pathname: '',
	asPath: '',
	push: () => {},
	replace: () => {},
	back: () => {},
	prefetch: () => {},
	beforePopState: () => {},
	events: {
		on: () => {},
		off: () => {},
		emit: () => {},
	},
});

export default {
	push: () => {},
	replace: () => {},
	back: () => {},
	prefetch: () => {},
	beforePopState: () => {},
	events: {
		on: () => {},
		off: () => {},
		emit: () => {},
	},
};
