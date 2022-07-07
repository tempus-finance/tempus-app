import { FC } from 'react';
import ScrollAnimation from 'react-animate-on-scroll';

import './ScrollFadeIn.scss';

const ScrollFadeIn: FC = ({ children }) => (
  <ScrollAnimation animateIn="tw__fade-in-up" animateOnce duration={0.6} delay={0.5}>
    {children}
  </ScrollAnimation>
);

export default ScrollFadeIn;
