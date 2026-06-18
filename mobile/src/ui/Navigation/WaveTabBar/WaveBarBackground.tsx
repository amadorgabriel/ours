import { useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/presentation/styles/tokens';

import { WAVE_TAB_BAR_HEIGHT } from './tab-config';

type WaveBarBackgroundProps = {
  height?: number;
};

export function WaveBarBackground({ height = WAVE_TAB_BAR_HEIGHT }: WaveBarBackgroundProps) {
  const { width } = useWindowDimensions();
  const centerX = width / 2;
  const notchHalfWidth = 40;
  const notchDepth = 10;

  const path = [
    `M 0 ${notchDepth}`,
    `L ${centerX - notchHalfWidth} ${notchDepth}`,
    `Q ${centerX - notchHalfWidth / 2} 0 ${centerX} 0`,
    `Q ${centerX + notchHalfWidth / 2} 0 ${centerX + notchHalfWidth} ${notchDepth}`,
    `L ${width} ${notchDepth}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    'Z',
  ].join(' ');

  return (
    <Svg height={height} style={{ position: 'absolute', left: 0, right: 0, top: 0 }} width={width}>
      <Path d={path} fill={colors.bgCream} stroke="rgba(107,88,67,0.08)" strokeWidth={1} />
    </Svg>
  );
}
