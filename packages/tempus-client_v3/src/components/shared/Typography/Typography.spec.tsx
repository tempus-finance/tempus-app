import { render } from '@testing-library/react';
import Typography, {
  TypographyColor,
  TypographyProps,
  TypographyType,
  TypographyVariant,
  TypographyWeight,
} from './Typography';

const defaultProps: TypographyProps = {
  variant: 'title',
};

const subject = (props: TypographyProps) => render(<Typography {...props} />);

describe('Typography', () => {
  (
    [
      'page-navigation',
      'header',
      'subheader',
      'title',
      'subtitle',
      'body-primary',
      'body-secondary',
      'body-tertiary',
    ] as TypographyVariant[]
  ).forEach(variant => {
    it(`render a text with variant ${variant}`, () => {
      const props = { ...defaultProps, variant, children: 'simple text' };
      const { container, queryByText } = subject(props);
      const text = queryByText(props.children);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });

    it(`render html with variant ${variant}`, () => {
      const str = 'simple text';
      const props = { ...defaultProps, variant, html: `<span>${str}</span>` };
      const { container, queryByText } = subject(props);
      const text = queryByText(str);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });
  });

  (
    [
      'text-primary',
      'text-secondary',
      'primary-dark',
      'text-primary-inverted',
      'text-success',
      'text-disabled',
      'text-disabled-secondary',
      'text-caption',
      'text-error',
    ] as TypographyColor[]
  ).forEach(color => {
    it(`render a text with color ${color}`, () => {
      const props = { ...defaultProps, color, children: 'simple text' };
      const { container, queryByText } = subject(props);
      const text = queryByText(props.children);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });

    it(`render html with color ${color}`, () => {
      const str = 'simple text';
      const props = { ...defaultProps, color, html: `<span>${str}</span>` };
      const { container, queryByText } = subject(props);
      const text = queryByText(str);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });
  });

  (['regular', 'medium', 'bold'] as TypographyWeight[]).forEach(weight => {
    it(`render a text with weight ${weight}`, () => {
      const props = { ...defaultProps, weight, children: 'simple text' };
      const { container, queryByText } = subject(props);
      const text = queryByText(props.children);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });

    it(`render html with weight ${weight}`, () => {
      const str = 'simple text';
      const props = { ...defaultProps, weight, html: `<span>${str}</span>` };
      const { container, queryByText } = subject(props);
      const text = queryByText(str);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });
  });

  (['regular', 'mono'] as TypographyType[]).forEach(type => {
    it(`render a text with type ${type}`, () => {
      const props = { ...defaultProps, type, children: 'simple text' };
      const { container, queryByText } = subject(props);
      const text = queryByText(props.children);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });

    it(`render html with type ${type}`, () => {
      const str = 'simple text';
      const props = { ...defaultProps, type, html: `<span>${str}</span>` };
      const { container, queryByText } = subject(props);
      const text = queryByText(str);

      expect(container).not.toBeNull();
      expect(text).not.toBeNull();

      expect(container).toMatchSnapshot();
    });
  });
});
