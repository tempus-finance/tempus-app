import Words from './words';

const es: { [word in Words]: string } = {
  tempus: 'Tempus',
  max: 'max',
  min: 'min',
  dashboard: 'Panel de Control',
  analytics: 'Analítica',
  community: 'Comunidad',
  settings: 'Configuración',
  connectWallet: 'Conectar cartera',
  pending: 'Pendiente...',
  selectWallet: 'Seleccionar cartera',
  walletSelectorDisclaimer:
    'Al conectar su billetera, acepta estar sujeto a los <a href="https://tempus.finance/terms-of-service" target="_blank">Términos de servicio de Tempus</a>  y reconoce que ha leído y comprende el Descargo de responsabilidad del <a href="https://tempus.finance/disclaimer" target="_blank">Protocolo de Tempus.</a>',
  metamaskConnected: 'MetaMask conectado',
  changeNetworkRejected: 'Solicitud para cambiar la red rechazada por el usuario',
  changeNetworkRejectedExplain: 'Para usar la aplicación, conéctese a una de las redes admitidas',
  unsupportedNetwork: 'Red de billetera no compatible',
  unsupportedNetworkExplain: 'Apoyamos redes Mainnet o Fantom',
  walletConnectConnected: 'WalletConnect conectado',
  errorConnectingWallet: 'Error conectando la cartera',
  viewRecentTransactions: 'Ver transacciones recientes',
  walletOverview: 'Vista general de la billetera',
  switchWallet: 'Cambiar cartera',
  connectedWallet: 'Cartera conectada',
  viewOn: 'Ver en',
  pendingTransactions: 'Transacciones pendientes',
  transactionHistory: 'Historial de transacciones',
  clear: 'limpiar',
  installMetamask: 'Instalar MetaMask',
  availablePools: 'Pools disponibles',
  filter: 'Filtrar',
  asset: 'Activos',
  assetName: 'Nombre del activo',
  protocol: 'Source',
  protocolName: 'Nombre del protocolo',
  clearFilter: 'Vaciar Filtro',
  apply: 'Actualizar',
  token: 'token',
  fixedApr: 'Interes Fijo Anual',
  lifeTimeApr: 'Interés Permanente',
  apr: 'Interés Anual',
  aprRange: 'Rango APR',
  lpApr: 'APR Variable',
  fiat: 'Fiat',
  crypto: 'Cripto',
  pool: 'Pool',
  ofPool: 'del Pool',
  poolRatio: 'Ratio del Pool (Capitals / Yields)',
  redemption: 'Redención',
  earlyRedemption: 'Redención temprana',
  swap: 'Intercambiar',
  tvl: 'Total Valor Bloqueado',
  totalValueLocked: 'Valor gestionado',
  manage: 'Gestionar',
  basic: 'Basico',
  basicSubTitle: 'Opción recomendada',
  advanced: 'Avanzado',
  advancedSubTitle: 'Para usuarios avanzados',
  deposit: 'Depositar',
  withdraw: 'Retirar',
  mint: 'Emitir',
  removeLiquidity: 'Retirar liquidez',
  provideLiquidity: 'Proveer liquidez',
  earlyRedeem: 'Canjeo anticipado',
  depositDisabledNoLiquidity:
    'Actualmente, los depósitos están deshabilitados debido a la falta de liquidez en el grupo que ha seleccionado. Por favor, inténtelo de nuevo más tarde.',
  depositDisabledPoolMaturity: 'El depósito no está disponible porque este grupo ha alcanzado su vencimiento.',
  depositDisabledNegative:
    'El depósito se ha desactivado temporalmente debido a un rendimiento negativo en el grupo. Por favor, revise luego.',
  withdrawDisabledNoLiquidity:
    'El retiro está deshabilitado actualmente debido a la falta de liquidez en el grupo que ha seleccionado. Por favor, inténtelo de nuevo más tarde.',
  withdrawDisabledNoDeposit: 'El retiro estará disponible una vez que haya depositado en el grupo..',
  withdrawDisabledNegative:
    'El retiro se ha desactivado temporalmente debido a un rendimiento negativo en el grupo. Por favor, revise luego.',
  mintDisabledPoolMaturity: 'Acuñar no está disponible porque este grupo ha alcanzado la madurez.',
  swapDisabledNoLiquidity:
    'El intercambio está deshabilitado actualmente debido a la falta de liquidez en el grupo que ha seleccionado. Por favor, inténtelo de nuevo más tarde.',
  swapDisabledNoShares: 'El intercambio estará disponible una vez que haya depositado en el grupo.',
  swapDisabledPoolMaturity: 'El intercambio no está disponible porque este grupo ha alcanzado la madurez.',
  provideLiquidityDisabledNoDeposit:
    'La provisión de liquidez manual no está disponible hasta que haya depositado o acuñado.',
  provideLiquidityDisabledNoPrincipals:
    'La provisión de liquidez manual no está disponible hasta que haya comprado más tokens Capital.',
  provideLiquidityDisabledNoYields:
    'La provisión de liquidez manual no está disponible hasta que haya comprado más tokens de rendimiento.',
  provideLiquidityDisabledPoolMaturity:
    'La provisión de liquidez manual no está disponible porque este grupo ha alcanzado su vencimiento.',
  removeLiquidityDisabledNoDeposit:
    'Retirar liquidez estará disponible una vez que haya apostado sus tokens (depositados en TempusAMM).',
  removeLiquidityDisabledNoLpTokens: 'Retirar liquidez estará disponible una vez que haya agregado liquidez.',
  removeLiquidityDisabledPoolMaturity:
    "Retirar liquidez no está disponible porque este grupo ha alcanzado la madurez. Utilice 'Retirar'.",
  earlyRedemptionDisabledNoLiquidity:
    'El canje anticipado está deshabilitado actualmente debido a la falta de liquidez en el grupo que ha seleccionado. Por favor, inténtelo de nuevo más tarde.',
  availableToDeposit: 'Disponible para depositar',
  volume: 'Volumen',
  fees: 'Tarifas',
  term: 'Plazo',
  startDate: 'Fecha de inicio',
  maturity: 'Vencimiento',
  timeLeft: 'Tiempo restante ',
  currentPosition: 'Posición actual',
  principals: 'Capitals',
  principalTokens: 'Capitals',
  yields: 'Yields',
  lpTokens: 'LP Tokens',
  yieldTokens: 'Yields',
  staked: 'Invertido',
  approve: 'Aprobar',
  approved: 'Aprobado',
  approving: 'Aprobando',
  approvalFailed: 'Aprobación fallida',
  execute: 'Ejecutar',
  executing: 'Ejecutando',
  failed: 'Fallido',
  insufficientLiquidity: 'Liquidez insuficiente',
  profitLoss: 'Ganancia y pérdida ',
  currentValue: 'Valor actual ',
  from: 'Origen',
  to: 'Destino',
  and: 'e',
  via: 'via',
  balance: 'Balance',
  futureYield: 'Rendimiento Futuro',
  lifeTimeYield: 'Rendimiento de por vida',
  fixYourFutureYield: 'Fija tu rendimiento futuro',
  fixedYield: 'Rendimiento Fijo',
  yieldAtMaturity: 'Rentabilidad fija al vencimiento',
  estimatedYieldAtMaturity: 'Rendimiento estimado al vencimiento',
  totalAvailableAtMaturity: 'Total disponible al vencimiento',
  variableYield: 'Rendimiento Variable',
  amountReceived: 'Usted recibirá',
  approx: 'Aproximado',
  estimatedAmountReceived: 'Importe estimado recibido',
  estimated: 'Estimado',
  feesTooltipInfo:
    'Las comisiones de Depósito, Reembolso y Reembolso Anticipado se acumulan en la Tesorería de Tempus. Las tarifas de intercambio se acumulan para los proveedores de liquidez.',
  selectPlaceholder: 'Porfavor selecciona',
  warningEthGasFees: 'Al menos debes dejar 0,05 ETH en tu cartera para pagar las tarifas de gas.',
  selectTokenFirst: 'Porfavor, primero selecciona el token',
  about: 'Acerca de',
  tempusAnnouncements: 'Anuncios Tempus ',
  tempusChat: 'Chat de Tempus',
  interestRateProtectionTooltipText:
    'Fija tu rendimiento futuro con Tempus. Esta función bloquea su token de inversión, emite Capitals y Yields como resultado, y cambia todos los Yields por Capital a través de TempusAMM. Recibirá Capitals que se canjearán 1: 1 por el activo subyacente al vencimiento.',
  liquidityProvisionTooltipText:
    'Proporcione liquidez a Tempus para obtener un rendimiento adicional. Esta función bloquea su token  de inversión, emite Capitals y Yields a cambio, y utiliza el número máximo disponible de Capitals y Yields para proporcionar liquidez a TempusAMM.<br/><br/>Esto significa que recibirá el rendimiento subyacente y las comisiones de intercambio de Tempus, acumlados en un solo rendimiento.',
  slippageTolerance: 'Tolerancia al deslizamiento ',
  slippageTooltip: 'Tu transacción será revertida si el precio cambia desfavorablemente por más de ese porcentaje',
  auto: 'Automático',
  language: 'Idioma',
  mobileNotSupported:
    'El soporte móvl no está disponible aún, pero lo incluiremos más adelante. Gracias por su comprensión.',
  mobileLink: 'Leer más sobre Tempus',
  unstaked: 'Desinvertido',
  stakedPrincipals: 'Capitals invertido',
  stakedYields: 'Yields invertidos',
  mintDescription: 'Divida su token de rendimiento en Capitals y Yields.',
  swapDescription: 'Intercambio entre Capitals y Yields.',
  provideLiquidityDescription: 'Use sus tokens LP para proporcionar liquidez al grupo y ganar recompensas.',
  removeLiquidityDescription:
    'Retire su liquidez del grupo con las recompensas acumuladas en forma de sus tokens LP iniciales.',
  combinedApr: 'APR combinado',
  askUsOnDiscord:
    '¿Tienes más preguntas? Pregúntanos en el Discord: <a href="https://discord.com/invite/6gauHECShr" target="_blank">https://discord.com/invite/6gauHECShr</a>',
  depositDisabledByConfig: 'El depósito no está disponible actualmente.',
  mintDisabledByConfig: 'Acuñar no está disponible actualmente.',
  operationDisabledByConfig:
    'Ciertas acciones en relación con este pool de Tempus se desactivan temporalmente debido a la falta de confiabilidad intermitente del pool subyacente. Tenga paciencia con nosotros mientras investigamos este problema.',
  selectNetwork: 'Seleccione el Network',
  poolActionDisabledTitle: 'Ciertas acciones para este grupo están deshabilitadas temporalmente',
  governance: 'Gobernancia',
  unsupported: 'No soportado',
  switchNetwork: 'Cambiar red',
  unsupportedNetworkTooltipTitle: 'Red no compatible',
  unsupportedNetworkTooltipText1:
    'La red a la que está conectada su billetera no coincide con la red seleccionada aquí.',
  unsupportedNetworkTooltipText2: 'Conéctese a una red compatible para continuar.',
};
export default es;
