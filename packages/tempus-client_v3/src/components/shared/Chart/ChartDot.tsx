import { ReactElement, useMemo } from 'react';
import { colors } from '../Colors';

type ChartDotVariant = 'plus' | 'minus' | 'tick';

interface ChartDotProps {
  variant: ChartDotVariant;
  centerX: number;
  centerY: number;
  selected?: boolean;
}

function ChartDot(props: ChartDotProps): ReactElement<SVGElement> {
  const { variant, centerX, centerY, selected } = props;

  const symbolPath = useMemo(() => {
    switch (variant) {
      case 'plus':
        return 'M16.8 12C16.8 12.3183 16.6736 12.6235 16.4485 12.8485C16.2235 13.0736 15.9183 13.2 15.6 13.2H13.2V15.6C13.2 15.9183 13.0736 16.2235 12.8485 16.4485C12.6235 16.6736 12.3183 16.8 12 16.8C11.6817 16.8 11.3765 16.6736 11.1515 16.4485C10.9264 16.2235 10.8 15.9183 10.8 15.6V13.2H8.4C8.08174 13.2 7.77652 13.0736 7.55147 12.8485C7.32643 12.6235 7.2 12.3183 7.2 12C7.2 11.6817 7.32643 11.3765 7.55147 11.1515C7.77652 10.9264 8.08174 10.8 8.4 10.8H10.8V8.4C10.8 8.08174 10.9264 7.77652 11.1515 7.55147C11.3765 7.32643 11.6817 7.2 12 7.2C12.3183 7.2 12.6235 7.32643 12.8485 7.55147C13.0736 7.77652 13.2 8.08174 13.2 8.4V10.8H15.6C15.9183 10.8 16.2235 10.9264 16.4485 11.1515C16.6736 11.3765 16.8 11.6817 16.8 12Z';

      case 'minus':
        return 'M15.6 12C15.6 12.3183 15.4736 12.6235 15.2485 12.8485C15.0235 13.0736 14.7183 13.2 14.4 13.2H9.6C9.28174 13.2 8.97652 13.0736 8.75147 12.8485C8.52643 12.6235 8.4 12.3183 8.4 12C8.4 11.6817 8.52643 11.3765 8.75147 11.1515C8.97652 10.9264 9.28174 10.8 9.6 10.8H14.4C14.7183 10.8 15.0235 10.9264 15.2485 11.1515C15.4736 11.3765 15.6 11.6817 15.6 12Z';

      case 'tick':
        return 'M6 12.0752L10.5 16.5L18 9L16.5 7.5L10.5 13.5L7.5 10.5L6 12.0752Z';

      default:
        return null;
    }
  }, [variant]);

  return (
    <>
      <circle
        cx={centerX}
        cy={centerY}
        r={11}
        fill={selected ? colors.chartDotDominant : colors.chartDotNeutral}
        stroke={colors.chartDotDominant}
        strokeWidth="2"
      />
      {symbolPath && (
        <path
          d={symbolPath}
          fill={selected ? colors.chartDotNeutral : colors.chartDotDominant}
          transform={`translate(${centerX - 12} ${centerY - 12})`}
        />
      )}
    </>
  );
}

export default ChartDot;
