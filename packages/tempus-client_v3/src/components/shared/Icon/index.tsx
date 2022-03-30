import React, { FC, memo } from 'react';
import PlusRound from './PlusRound';
import CheckmarkRound from './CheckmarkRound';
import MinusRound from './MinusRound';
import CrossRound from './CrossRound';
import UpChevron from './UpChevron';
import RightChevron from './RightChevron';
import LeftChevron from './LeftChevron';
import DownChevron from './DownChevron';
import UpArrow from './UpArrow';
import RightArrow from './RightArrow';
import LeftArrow from './LeftArrow';
import DownArrow from './DownArrow';
import UpArrow2 from './UpArrow2';
import RightArrow2 from './RightArrow2';
import LeftArrow2 from './LeftArrow2';
import DownArrow2 from './DownArrow2';
import GridView from './GridView';
import ListView from './ListView';
import Plus from './Plus';
import Minus from './Minus';
import Menu from './Menu';
import Close from './Close';
import Info from './Info';
import InfoBordered from './InfoBordered';
import InfoSolid from './InfoSolid';
import Exclamation from './Exclamation';
import ExclamationBordered from './ExclamationBordered';
import ExclamationNeutral from './ExclamationNeutral';
import ExclamationError from './ExclamationError';
import Checkmark from './Checkmark';
import CheckmarkBordered from './CheckmarkBordered';
import CheckmarkSolid from './CheckmarkSolid';
import Loading from './Loading';
import External from './External';
import Twitter from './Twitter';
import Discord from './Discord';
import Medium from './Medium';
import Github from './Github';
import Telegram from './Telegram';
import Scroll from './Scroll';
import Slippage from './Slippage';
import Globe from './Globe';
import Dark from './Dark';

export const ICON_SIZE_SMALL = 16;
export const ICON_SIZE_MEDIUM = 24;
export const ICON_SIZE_LARGE = 32;
export const ICON_SIZE_DEFAULT = ICON_SIZE_MEDIUM;

export type IconType =
  | 'plus-round'
  | 'checkmark-round'
  | 'minus-round'
  | 'cross-round'
  | 'up-chevron'
  | 'right-chevron'
  | 'left-chevron'
  | 'down-chevron'
  | 'up-arrow'
  | 'right-arrow'
  | 'left-arrow'
  | 'down-arrow'
  | 'up-arrow2'
  | 'right-arrow2'
  | 'left-arrow2'
  | 'down-arrow2'
  | 'list-view'
  | 'grid-view'
  | 'plus'
  | 'minus'
  | 'menu'
  | 'close'
  | 'info'
  | 'info-bordered'
  | 'info-solid'
  | 'exclamation'
  | 'exclamation-bordered'
  | 'exclamation-neutral'
  | 'exclamation-error'
  | 'checkmark'
  | 'checkmark-bordered'
  | 'checkmark-solid'
  | 'loading'
  | 'external'
  | 'twitter'
  | 'discord'
  | 'medium'
  | 'github'
  | 'telegram'
  | 'scroll'
  | 'slippage'
  | 'globe'
  | 'dark';

export interface IconProps {
  size?: 'large' | 'medium' | 'small' | number;
}

const Icon: FC<IconProps & { type: IconType }> = props => {
  switch (props.type) {
    case 'plus-round':
      return <PlusRound {...props} />;
    case 'checkmark-round':
      return <CheckmarkRound {...props} />;
    case 'minus-round':
      return <MinusRound {...props} />;
    case 'cross-round':
      return <CrossRound {...props} />;
    case 'up-chevron':
      return <UpChevron {...props} />;
    case 'right-chevron':
      return <RightChevron {...props} />;
    case 'left-chevron':
      return <LeftChevron {...props} />;
    case 'down-chevron':
      return <DownChevron {...props} />;
    case 'up-arrow':
      return <UpArrow {...props} />;
    case 'right-arrow':
      return <RightArrow {...props} />;
    case 'left-arrow':
      return <LeftArrow {...props} />;
    case 'down-arrow':
      return <DownArrow {...props} />;
    case 'up-arrow2':
      return <UpArrow2 {...props} />;
    case 'right-arrow2':
      return <RightArrow2 {...props} />;
    case 'left-arrow2':
      return <LeftArrow2 {...props} />;
    case 'down-arrow2':
      return <DownArrow2 {...props} />;
    case 'grid-view':
      return <GridView {...props} />;
    case 'list-view':
      return <ListView {...props} />;
    case 'plus':
      return <Plus {...props} />;
    case 'minus':
      return <Minus {...props} />;
    case 'menu':
      return <Menu {...props} />;
    case 'close':
      return <Close {...props} />;
    case 'info':
      return <Info {...props} />;
    case 'info-bordered':
      return <InfoBordered {...props} />;
    case 'info-solid':
      return <InfoSolid {...props} />;
    case 'exclamation':
      return <Exclamation {...props} />;
    case 'exclamation-bordered':
      return <ExclamationBordered {...props} />;
    case 'exclamation-neutral':
      return <ExclamationNeutral {...props} />;
    case 'exclamation-error':
      return <ExclamationError {...props} />;
    case 'checkmark':
      return <Checkmark {...props} />;
    case 'checkmark-bordered':
      return <CheckmarkBordered {...props} />;
    case 'checkmark-solid':
      return <CheckmarkSolid {...props} />;
    case 'loading':
      return <Loading {...props} />;
    case 'external':
      return <External {...props} />;
    case 'twitter':
      return <Twitter {...props} />;
    case 'discord':
      return <Discord {...props} />;
    case 'medium':
      return <Medium {...props} />;
    case 'github':
      return <Github {...props} />;
    case 'telegram':
      return <Telegram {...props} />;
    case 'scroll':
      return <Scroll {...props} />;
    case 'slippage':
      return <Slippage {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'dark':
      return <Dark {...props} />;
    default:
      return null;
  }
};

export default memo(Icon);

export {
  PlusRound,
  CheckmarkRound,
  MinusRound,
  CrossRound,
  UpChevron,
  RightChevron,
  LeftChevron,
  DownChevron,
  UpArrow,
  RightArrow,
  LeftArrow,
  DownArrow,
  UpArrow2,
  RightArrow2,
  LeftArrow2,
  DownArrow2,
  GridView,
  ListView,
  Plus,
  Minus,
  Menu,
  Close,
  Info,
  InfoBordered,
  InfoSolid,
  Exclamation,
  ExclamationBordered,
  ExclamationNeutral,
  ExclamationError,
  Checkmark,
  CheckmarkBordered,
  CheckmarkSolid,
  Loading,
  External,
  Twitter,
  Discord,
  Medium,
  Github,
  Telegram,
  Scroll,
  Slippage,
  Globe,
  Dark,
};
