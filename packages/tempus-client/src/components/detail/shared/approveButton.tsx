import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Button } from '@material-ui/core';
import PoolDataAdapter from '../../../adapters/PoolDataAdapter';
import Typography from '../../typography/Typography';

interface ApproveButtonProps {
  poolDataAdapter: PoolDataAdapter | null;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
  tokenToApprove: string;
  spenderAddress: string;
  amountToApprove: BigNumber | null;
  onApproved: () => void;
}

const ApproveButton: FC<ApproveButtonProps> = props => {
  const { signer, poolDataAdapter, tokenToApprove, spenderAddress, userWalletAddress, amountToApprove, onApproved } =
    props;

  const [approving, setApproving] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<number | null>(null);

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer && poolDataAdapter && amountToApprove) {
        try {
          const approveTransaction = await poolDataAdapter.approveToken(
            tokenToApprove,
            spenderAddress,
            amountToApprove,
            signer,
          );
          if (approveTransaction) {
            await approveTransaction.wait();

            // Set new allowance
            setAllowance(
              await poolDataAdapter.getTokenAllowance(tokenToApprove, spenderAddress, userWalletAddress, signer),
            );

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
  }, [onApproved, tokenToApprove, signer, poolDataAdapter, amountToApprove, spenderAddress, userWalletAddress]);

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
    if (!amountToApprove) {
      return false;
    }

    const amountToApproveParsed = Number(ethers.utils.formatEther(amountToApprove));

    const alreadyApproved = !!allowance && allowance >= amountToApproveParsed;

    return alreadyApproved;
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
