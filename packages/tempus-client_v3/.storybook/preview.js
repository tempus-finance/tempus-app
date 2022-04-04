// Creates CSS variables for Storybook environment
import './../src/components/shared/Colors';
import './../src/components/shared/Shadow';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
