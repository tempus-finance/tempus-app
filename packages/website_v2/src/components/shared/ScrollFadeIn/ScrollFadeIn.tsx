import { FC } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';

import './ScrollFadeIn.scss';

const ScrollFadeIn: FC = ({ children }) => (
  <AnimationOnScroll animateIn="tw__fade-in-up" animateOnce duration={0.6} delay={0.5}>
    {children}
  </AnimationOnScroll>
);

export default ScrollFadeIn;
