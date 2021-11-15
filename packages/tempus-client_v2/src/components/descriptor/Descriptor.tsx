import { FC } from 'react';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';

import './Descriptor.scss';

interface DescriptorProps {
  title?: string;
}

const Descriptor: FC<DescriptorProps> = props => {
  const { title, children } = props;

  return (
    <div className="tc__descriptor">
      <div className="tc__descriptor__title">
        {title && <Typography variant="h1">{title}</Typography>}
        {title && <Spacer size={15} />}
      </div>
      {title && <Spacer size={15} />}
      <div className="tc__descriptor__content">
        {children && <Typography variant="card-body-text">{children}</Typography>}
      </div>
    </div>
  );
};
export default Descriptor;
