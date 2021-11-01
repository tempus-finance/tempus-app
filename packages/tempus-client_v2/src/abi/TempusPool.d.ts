/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface TempusPoolInterface extends ethers.utils.Interface {
  functions: {
    "backingToken()": FunctionFragment;
    "controller()": FunctionFragment;
    "currentInterestRate()": FunctionFragment;
    "deposit(uint256,address)": FunctionFragment;
    "depositBacking(uint256,address)": FunctionFragment;
    "estimatedMintedShares(uint256,bool)": FunctionFragment;
    "estimatedRedeem(uint256,uint256,bool)": FunctionFragment;
    "finalize()": FunctionFragment;
    "getFeesConfig()": FunctionFragment;
    "initialInterestRate()": FunctionFragment;
    "matured()": FunctionFragment;
    "maturityInterestRate()": FunctionFragment;
    "maturityTime()": FunctionFragment;
    "maxDepositFee()": FunctionFragment;
    "maxEarlyRedeemFee()": FunctionFragment;
    "maxMatureRedeemFee()": FunctionFragment;
    "numAssetsPerYieldToken(uint256,uint256)": FunctionFragment;
    "numYieldTokensPerAsset(uint256,uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "pricePerPrincipalShare()": FunctionFragment;
    "pricePerPrincipalShareStored()": FunctionFragment;
    "pricePerYieldShare()": FunctionFragment;
    "pricePerYieldShareStored()": FunctionFragment;
    "principalShare()": FunctionFragment;
    "protocolName()": FunctionFragment;
    "redeem(address,uint256,uint256,address)": FunctionFragment;
    "redeemToBacking(address,uint256,uint256,address)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setFeesConfig(tuple)": FunctionFragment;
    "startTime()": FunctionFragment;
    "totalFees()": FunctionFragment;
    "transferFees(address,address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "version()": FunctionFragment;
    "yieldBearingToken()": FunctionFragment;
    "yieldShare()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "backingToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "controller",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "currentInterestRate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "depositBacking",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "estimatedMintedShares",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "estimatedRedeem",
    values: [BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(functionFragment: "finalize", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getFeesConfig",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialInterestRate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "matured", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "maturityInterestRate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maturityTime",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxDepositFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxEarlyRedeemFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxMatureRedeemFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "numAssetsPerYieldToken",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "numYieldTokensPerAsset",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pricePerPrincipalShare",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "pricePerPrincipalShareStored",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "pricePerYieldShare",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "pricePerYieldShareStored",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "principalShare",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "protocolName",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [string, BigNumberish, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "redeemToBacking",
    values: [string, BigNumberish, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setFeesConfig",
    values: [
      {
        depositPercent: BigNumberish;
        earlyRedeemPercent: BigNumberish;
        matureRedeemPercent: BigNumberish;
      }
    ]
  ): string;
  encodeFunctionData(functionFragment: "startTime", values?: undefined): string;
  encodeFunctionData(functionFragment: "totalFees", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transferFees",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "yieldBearingToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "yieldShare",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "backingToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "controller", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "currentInterestRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositBacking",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "estimatedMintedShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "estimatedRedeem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "finalize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getFeesConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "initialInterestRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "matured", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "maturityInterestRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maturityTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxDepositFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxEarlyRedeemFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxMatureRedeemFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "numAssetsPerYieldToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "numYieldTokensPerAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pricePerPrincipalShare",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pricePerPrincipalShareStored",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pricePerYieldShare",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pricePerYieldShareStored",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "principalShare",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "protocolName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "redeemToBacking",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFeesConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "startTime", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "totalFees", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "yieldBearingToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "yieldShare", data: BytesLike): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export class TempusPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: TempusPoolInterface;

  functions: {
    backingToken(overrides?: CallOverrides): Promise<[string]>;

    controller(overrides?: CallOverrides): Promise<[string]>;

    currentInterestRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    deposit(
      yieldTokenAmount: BigNumberish,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositBacking(
      backingTokenAmount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    estimatedMintedShares(
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    estimatedRedeem(
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    finalize(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getFeesConfig(
      overrides?: CallOverrides
    ): Promise<
      [
        [BigNumber, BigNumber, BigNumber] & {
          depositPercent: BigNumber;
          earlyRedeemPercent: BigNumber;
          matureRedeemPercent: BigNumber;
        }
      ]
    >;

    initialInterestRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    matured(overrides?: CallOverrides): Promise<[boolean]>;

    maturityInterestRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    maturityTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    maxDepositFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    maxEarlyRedeemFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    maxMatureRedeemFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    numAssetsPerYieldToken(
      yieldTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    numYieldTokensPerAsset(
      backingTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pricePerPrincipalShare(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    pricePerPrincipalShareStored(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    pricePerYieldShare(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    pricePerYieldShareStored(overrides?: CallOverrides): Promise<[BigNumber]>;

    principalShare(overrides?: CallOverrides): Promise<[string]>;

    protocolName(overrides?: CallOverrides): Promise<[string]>;

    redeem(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    redeemToBacking(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFeesConfig(
      newFeesConfig: {
        depositPercent: BigNumberish;
        earlyRedeemPercent: BigNumberish;
        matureRedeemPercent: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    startTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalFees(overrides?: CallOverrides): Promise<[BigNumber]>;

    transferFees(
      authorizer: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;

    yieldBearingToken(overrides?: CallOverrides): Promise<[string]>;

    yieldShare(overrides?: CallOverrides): Promise<[string]>;
  };

  backingToken(overrides?: CallOverrides): Promise<string>;

  controller(overrides?: CallOverrides): Promise<string>;

  currentInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

  deposit(
    yieldTokenAmount: BigNumberish,
    recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositBacking(
    backingTokenAmount: BigNumberish,
    recipient: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  estimatedMintedShares(
    amount: BigNumberish,
    isBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  estimatedRedeem(
    principals: BigNumberish,
    yields: BigNumberish,
    toBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  finalize(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getFeesConfig(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      depositPercent: BigNumber;
      earlyRedeemPercent: BigNumber;
      matureRedeemPercent: BigNumber;
    }
  >;

  initialInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

  matured(overrides?: CallOverrides): Promise<boolean>;

  maturityInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

  maturityTime(overrides?: CallOverrides): Promise<BigNumber>;

  maxDepositFee(overrides?: CallOverrides): Promise<BigNumber>;

  maxEarlyRedeemFee(overrides?: CallOverrides): Promise<BigNumber>;

  maxMatureRedeemFee(overrides?: CallOverrides): Promise<BigNumber>;

  numAssetsPerYieldToken(
    yieldTokens: BigNumberish,
    interestRate: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  numYieldTokensPerAsset(
    backingTokens: BigNumberish,
    interestRate: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  pricePerPrincipalShare(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  pricePerPrincipalShareStored(overrides?: CallOverrides): Promise<BigNumber>;

  pricePerYieldShare(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  pricePerYieldShareStored(overrides?: CallOverrides): Promise<BigNumber>;

  principalShare(overrides?: CallOverrides): Promise<string>;

  protocolName(overrides?: CallOverrides): Promise<string>;

  redeem(
    from: string,
    principalAmount: BigNumberish,
    yieldAmount: BigNumberish,
    recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  redeemToBacking(
    from: string,
    principalAmount: BigNumberish,
    yieldAmount: BigNumberish,
    recipient: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFeesConfig(
    newFeesConfig: {
      depositPercent: BigNumberish;
      earlyRedeemPercent: BigNumberish;
      matureRedeemPercent: BigNumberish;
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  startTime(overrides?: CallOverrides): Promise<BigNumber>;

  totalFees(overrides?: CallOverrides): Promise<BigNumber>;

  transferFees(
    authorizer: string,
    recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  yieldBearingToken(overrides?: CallOverrides): Promise<string>;

  yieldShare(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    backingToken(overrides?: CallOverrides): Promise<string>;

    controller(overrides?: CallOverrides): Promise<string>;

    currentInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      yieldTokenAmount: BigNumberish,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        mintedShares: BigNumber;
        depositedBT: BigNumber;
        fee: BigNumber;
        rate: BigNumber;
      }
    >;

    depositBacking(
      backingTokenAmount: BigNumberish,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        mintedShares: BigNumber;
        depositedYBT: BigNumber;
        fee: BigNumber;
        rate: BigNumber;
      }
    >;

    estimatedMintedShares(
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedRedeem(
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    finalize(overrides?: CallOverrides): Promise<void>;

    getFeesConfig(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        depositPercent: BigNumber;
        earlyRedeemPercent: BigNumber;
        matureRedeemPercent: BigNumber;
      }
    >;

    initialInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

    matured(overrides?: CallOverrides): Promise<boolean>;

    maturityInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

    maturityTime(overrides?: CallOverrides): Promise<BigNumber>;

    maxDepositFee(overrides?: CallOverrides): Promise<BigNumber>;

    maxEarlyRedeemFee(overrides?: CallOverrides): Promise<BigNumber>;

    maxMatureRedeemFee(overrides?: CallOverrides): Promise<BigNumber>;

    numAssetsPerYieldToken(
      yieldTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numYieldTokensPerAsset(
      backingTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    pricePerPrincipalShare(overrides?: CallOverrides): Promise<BigNumber>;

    pricePerPrincipalShareStored(overrides?: CallOverrides): Promise<BigNumber>;

    pricePerYieldShare(overrides?: CallOverrides): Promise<BigNumber>;

    pricePerYieldShareStored(overrides?: CallOverrides): Promise<BigNumber>;

    principalShare(overrides?: CallOverrides): Promise<string>;

    protocolName(overrides?: CallOverrides): Promise<string>;

    redeem(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        redeemedYieldTokens: BigNumber;
        fee: BigNumber;
        rate: BigNumber;
      }
    >;

    redeemToBacking(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        redeemedYieldTokens: BigNumber;
        redeemedBackingTokens: BigNumber;
        fee: BigNumber;
        rate: BigNumber;
      }
    >;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setFeesConfig(
      newFeesConfig: {
        depositPercent: BigNumberish;
        earlyRedeemPercent: BigNumberish;
        matureRedeemPercent: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    startTime(overrides?: CallOverrides): Promise<BigNumber>;

    totalFees(overrides?: CallOverrides): Promise<BigNumber>;

    transferFees(
      authorizer: string,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    version(overrides?: CallOverrides): Promise<BigNumber>;

    yieldBearingToken(overrides?: CallOverrides): Promise<string>;

    yieldShare(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;
  };

  estimateGas: {
    backingToken(overrides?: CallOverrides): Promise<BigNumber>;

    controller(overrides?: CallOverrides): Promise<BigNumber>;

    currentInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      yieldTokenAmount: BigNumberish,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositBacking(
      backingTokenAmount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    estimatedMintedShares(
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedRedeem(
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    finalize(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getFeesConfig(overrides?: CallOverrides): Promise<BigNumber>;

    initialInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

    matured(overrides?: CallOverrides): Promise<BigNumber>;

    maturityInterestRate(overrides?: CallOverrides): Promise<BigNumber>;

    maturityTime(overrides?: CallOverrides): Promise<BigNumber>;

    maxDepositFee(overrides?: CallOverrides): Promise<BigNumber>;

    maxEarlyRedeemFee(overrides?: CallOverrides): Promise<BigNumber>;

    maxMatureRedeemFee(overrides?: CallOverrides): Promise<BigNumber>;

    numAssetsPerYieldToken(
      yieldTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numYieldTokensPerAsset(
      backingTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pricePerPrincipalShare(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    pricePerPrincipalShareStored(overrides?: CallOverrides): Promise<BigNumber>;

    pricePerYieldShare(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    pricePerYieldShareStored(overrides?: CallOverrides): Promise<BigNumber>;

    principalShare(overrides?: CallOverrides): Promise<BigNumber>;

    protocolName(overrides?: CallOverrides): Promise<BigNumber>;

    redeem(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    redeemToBacking(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFeesConfig(
      newFeesConfig: {
        depositPercent: BigNumberish;
        earlyRedeemPercent: BigNumberish;
        matureRedeemPercent: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    startTime(overrides?: CallOverrides): Promise<BigNumber>;

    totalFees(overrides?: CallOverrides): Promise<BigNumber>;

    transferFees(
      authorizer: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;

    yieldBearingToken(overrides?: CallOverrides): Promise<BigNumber>;

    yieldShare(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    backingToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    controller(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    currentInterestRate(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      yieldTokenAmount: BigNumberish,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositBacking(
      backingTokenAmount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    estimatedMintedShares(
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    estimatedRedeem(
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    finalize(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getFeesConfig(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialInterestRate(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    matured(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    maturityInterestRate(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    maturityTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    maxDepositFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    maxEarlyRedeemFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    maxMatureRedeemFee(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numAssetsPerYieldToken(
      yieldTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numYieldTokensPerAsset(
      backingTokens: BigNumberish,
      interestRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pricePerPrincipalShare(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    pricePerPrincipalShareStored(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    pricePerYieldShare(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    pricePerYieldShareStored(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    principalShare(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    protocolName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    redeem(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    redeemToBacking(
      from: string,
      principalAmount: BigNumberish,
      yieldAmount: BigNumberish,
      recipient: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFeesConfig(
      newFeesConfig: {
        depositPercent: BigNumberish;
        earlyRedeemPercent: BigNumberish;
        matureRedeemPercent: BigNumberish;
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    startTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferFees(
      authorizer: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    yieldBearingToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    yieldShare(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
