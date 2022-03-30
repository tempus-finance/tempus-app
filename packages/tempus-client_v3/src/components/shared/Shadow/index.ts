import loadStyleVariables from '../loadStyleVariables';
import allShadows from './shadows.json';

export const shadows = allShadows;

loadStyleVariables(shadows, 'Shadow');
