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
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface StatsInterface extends ethers.utils.Interface {
  functions: {
    "estimateExitAndRedeem(address,uint256,uint256,uint256,bool)": FunctionFragment;
    "estimatedDepositAndFix(address,uint256,bool)": FunctionFragment;
    "estimatedDepositAndProvideLiquidity(address,uint256,bool)": FunctionFragment;
    "estimatedMintedShares(address,uint256,bool)": FunctionFragment;
    "estimatedRedeem(address,uint256,uint256,bool)": FunctionFragment;
    "getRate(bytes32)": FunctionFragment;
    "totalValueLockedAtGivenRate(address,bytes32)": FunctionFragment;
    "totalValueLockedInBackingTokens(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "estimateExitAndRedeem",
    values: [string, BigNumberish, BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "estimatedDepositAndFix",
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "estimatedDepositAndProvideLiquidity",
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "estimatedMintedShares",
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "estimatedRedeem",
    values: [string, BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(functionFragment: "getRate", values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: "totalValueLockedAtGivenRate",
    values: [string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "totalValueLockedInBackingTokens",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "estimateExitAndRedeem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "estimatedDepositAndFix",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "estimatedDepositAndProvideLiquidity",
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
  decodeFunctionResult(functionFragment: "getRate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalValueLockedAtGivenRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalValueLockedInBackingTokens",
    data: BytesLike
  ): Result;

  events: {};
}

export class Stats extends BaseContract {
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

  interface: StatsInterface;

  functions: {
    estimateExitAndRedeem(
      tempusAMM: string,
      lpTokens: BigNumberish,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    estimatedDepositAndFix(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { principals: BigNumber }>;

    estimatedDepositAndProvideLiquidity(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        lpTokens: BigNumber;
        principals: BigNumber;
        yields: BigNumber;
      }
    >;

    estimatedMintedShares(
      pool: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    estimatedRedeem(
      pool: string,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getRate(
      chainlinkAggregatorNodeHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { rate: BigNumber; rateDenominator: BigNumber }
    >;

    totalValueLockedAtGivenRate(
      pool: string,
      rateConversionData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    totalValueLockedInBackingTokens(
      pool: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  estimateExitAndRedeem(
    tempusAMM: string,
    lpTokens: BigNumberish,
    principals: BigNumberish,
    yields: BigNumberish,
    toBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  estimatedDepositAndFix(
    tempusAMM: string,
    amount: BigNumberish,
    isBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  estimatedDepositAndProvideLiquidity(
    tempusAMM: string,
    amount: BigNumberish,
    isBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      lpTokens: BigNumber;
      principals: BigNumber;
      yields: BigNumber;
    }
  >;

  estimatedMintedShares(
    pool: string,
    amount: BigNumberish,
    isBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  estimatedRedeem(
    pool: string,
    principals: BigNumberish,
    yields: BigNumberish,
    toBackingToken: boolean,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getRate(
    chainlinkAggregatorNodeHash: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { rate: BigNumber; rateDenominator: BigNumber }
  >;

  totalValueLockedAtGivenRate(
    pool: string,
    rateConversionData: BytesLike,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  totalValueLockedInBackingTokens(
    pool: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    estimateExitAndRedeem(
      tempusAMM: string,
      lpTokens: BigNumberish,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedDepositAndFix(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedDepositAndProvideLiquidity(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        lpTokens: BigNumber;
        principals: BigNumber;
        yields: BigNumber;
      }
    >;

    estimatedMintedShares(
      pool: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedRedeem(
      pool: string,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRate(
      chainlinkAggregatorNodeHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { rate: BigNumber; rateDenominator: BigNumber }
    >;

    totalValueLockedAtGivenRate(
      pool: string,
      rateConversionData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalValueLockedInBackingTokens(
      pool: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    estimateExitAndRedeem(
      tempusAMM: string,
      lpTokens: BigNumberish,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedDepositAndFix(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedDepositAndProvideLiquidity(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedMintedShares(
      pool: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    estimatedRedeem(
      pool: string,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRate(
      chainlinkAggregatorNodeHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalValueLockedAtGivenRate(
      pool: string,
      rateConversionData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalValueLockedInBackingTokens(
      pool: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    estimateExitAndRedeem(
      tempusAMM: string,
      lpTokens: BigNumberish,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    estimatedDepositAndFix(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    estimatedDepositAndProvideLiquidity(
      tempusAMM: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    estimatedMintedShares(
      pool: string,
      amount: BigNumberish,
      isBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    estimatedRedeem(
      pool: string,
      principals: BigNumberish,
      yields: BigNumberish,
      toBackingToken: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRate(
      chainlinkAggregatorNodeHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalValueLockedAtGivenRate(
      pool: string,
      rateConversionData: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalValueLockedInBackingTokens(
      pool: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
