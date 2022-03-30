import loadStyleVariables from '../loadStyleVariables';
import colorScheme from './colors.json';

export const colors = colorScheme;

loadStyleVariables(colors);

// Required by TS - we need at least one export or import so that TS considers this file a module
export {};
