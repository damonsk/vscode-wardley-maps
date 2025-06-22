// Minimal shim for @mui/styles in environments where it's not available
// This is a stub implementation for components that might import @mui/styles

export const makeStyles = () => () => ({});
export const withStyles = () => (Component) => Component;
export const createStyles = (styles) => styles;
export const useTheme = () => ({});
export const ThemeProvider = ({ children }) => children;

export default {
	makeStyles,
	withStyles,
	createStyles,
	useTheme,
	ThemeProvider,
};
