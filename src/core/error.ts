export enum ErrorCodes {
  UNKNOWN = -1,
  INSUFFICIENT_BTC_UTXO = -2,
  INSUFFICIENT_ASSET_UTXO = -3,
  NOT_SAFE_UTXOS = -4,
  ASSET_MAYBE_LOST = -5,
  ONLY_ONE_ARC20_CAN_BE_SENT = -6
}

export const ErrorMessages = {
  [ErrorCodes.UNKNOWN]: 'Unknown error',
  [ErrorCodes.INSUFFICIENT_BTC_UTXO]: 'Insufficient btc utxo',
  [ErrorCodes.INSUFFICIENT_ASSET_UTXO]: 'Insufficient asset utxo',
  [ErrorCodes.NOT_SAFE_UTXOS]: 'Not safe utxos',
  [ErrorCodes.ASSET_MAYBE_LOST]: 'Asset maybe lost',
  [ErrorCodes.ONLY_ONE_ARC20_CAN_BE_SENT]: 'Only one arc20 can be sent'
};

export class WalletUtilsError extends Error {
  public code = ErrorCodes.UNKNOWN;
  constructor(code: ErrorCodes, message = ErrorMessages[code] || 'Unknown error') {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, WalletUtilsError.prototype);
  }
}
