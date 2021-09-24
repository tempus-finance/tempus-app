import { FC, useCallback, useState } from 'react';
import { BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';

interface ApproveButtonProps {
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  tokenToApprove: string;
  amountToApprove: BigNumber;
  approved: boolean;
  onApproved: () => void;
}

const ApproveButton: FC<ApproveButtonProps> = props => {
  const { signer, poolDataAdapter, tokenToApprove, amountToApprove, approved, onApproved } = props;

  const [approving, setApproving] = useState<boolean>(false);

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer && poolDataAdapter) {
        try {
          const approveTransaction = await poolDataAdapter.approveToken(tokenToApprove, amountToApprove, signer);
          if (approveTransaction) {
            await approveTransaction.wait();
            onApproved();
            setApproving(false);
          }
        } catch (error) {
          console.log('ApproveButton - onApprove() - Error: ', error);
        }
      }
    };
    approve();

    setApproving(true);
  }, [onApproved, tokenToApprove, signer, poolDataAdapter, amountToApprove]);

  return (
    <>
      {/* Show Approve button if tokens are not approved already */}
      {!approved && (
        <Button color="primary" variant="contained" onClick={onApprove} disabled={approving}>
          <Typography variant="h5" color="inverted">
            Approve
          </Typography>
        </Button>
      )}

      {/* Show Approved label if tokens are approved */}
      {approved && <Typography variant="h5">Approved</Typography>}
    </>
  );
};
export default ApproveButton;
