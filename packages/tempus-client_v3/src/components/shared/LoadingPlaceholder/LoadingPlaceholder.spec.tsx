import { render } from '@testing-library/react';
import LoadingPlaceholder, {
  LoadingPlaceholderHeight,
  LoadingPlaceholderProps,
  LoadingPlaceholderWidth,
} from './LoadingPlaceholder';

const subject = (props: LoadingPlaceholderProps) => render(<LoadingPlaceholder {...props} />);

describe('LoadingPlaceholder', () => {
  ['tiny', 'small', 'medium', 'large'].forEach(width => {
    ['small', 'medium'].forEach(height => {
      it(`renders a loading placeholder with ${width} width and ${height} height`, () => {
        const { container } = subject({
          width: width as LoadingPlaceholderWidth,
          height: height as LoadingPlaceholderHeight,
        });

        expect(container).not.toBeNull();
        expect(container).toMatchSnapshot();
      });
    });
  });
});
