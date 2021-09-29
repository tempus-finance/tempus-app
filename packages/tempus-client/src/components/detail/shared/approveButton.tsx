import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';
import { TempusPool } from '../../../interfaces/TempusPool';

interface ApproveButtonProps {
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
  tokenToApprove: string;
  spenderAddress: string;
  amountToApprove: BigNumber;
  onApproved: () => void;
}

const ApproveButton: FC<ApproveButtonProps> = props => {
  const { signer, poolDataAdapter, tokenToApprove, spenderAddress, userWalletAddress, amountToApprove, onApproved } =
    props;

  const [approving, setApproving] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<number | null>(null);

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer && poolDataAdapter) {
        try {
          const approveTransaction = await poolDataAdapter.approveToken(
            tokenToApprove,
            spenderAddress,
            amountToApprove,
            signer,
          );
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
  }, [onApproved, tokenToApprove, signer, poolDataAdapter, amountToApprove, spenderAddress]);

  // Fetch token allowance
  useEffect(() => {
    const getAllowance = async () => {
      if (!poolDataAdapter || !signer) {
        return;
      }

      setAllowance(await poolDataAdapter.getTokenAllowance(tokenToApprove, spenderAddress, userWalletAddress, signer));
    };
    getAllowance();
  }, [poolDataAdapter, signer, spenderAddress, tokenToApprove, userWalletAddress]);

  const approved = useMemo(() => {
    const alreadyApproved = !!allowance && ethers.utils.parseEther(allowance.toString()).gte(amountToApprove);

    return !alreadyApproved;
  }, [allowance, amountToApprove]);

  if (approved) {
    onApproved();
  }

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
