import getVaultService from '../services/getVaultService';
import getConfig from '../utils/getConfig';

class PoolShareBalanceProvider {
  /**
   * Subscribes to PoolBalanceChanged event, every time this event is fired on blockchain we trigger pool share balance fetch for all tempus pools.
   */
  init() {
    getConfig().tempusPools.forEach(poolConfig => {
      const vaultService = getVaultService();

      vaultService.onPoolBalanceChanged(poolConfig.poolId, this.onPoolBalanceChanged);
    });
  }

  /**
   * Call this to cleanup PoolBalanceChanged event subscriptions.
   */
  destroy() {
    getConfig().tempusPools.forEach(poolConfig => {
      const vaultService = getVaultService();

      vaultService.offPoolBalanceChanged(poolConfig.poolId, this.onPoolBalanceChanged);
    });
  }

  private async onPoolBalanceChanged(poolId: string) {
    console.log(poolId);
    debugger;
  }
}
export default PoolShareBalanceProvider;
