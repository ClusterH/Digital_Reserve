import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { DigitalReserveInstance } from "../../types/truffle-contracts";
import IUniswapV2Router02 from "../../build/contracts/IUniswapV2Router02.json";
import { getContractAddress, Network } from "../../utils/contract-by-network";
import { getTokensWorth } from "../test-helpers/get-tokens-worth";
import { getUnixTimeAfterMins } from "../../utils/timestamp";

const DigitalReserve = artifacts.require("DigitalReserve");

export const testPriceImpact = async (accounts: Truffle.Accounts) => {
  let instance: DigitalReserveInstance;
  let uniRouter: Contract;
  let newtworkType: Network;
  let prevPodPrice: number;
  let prevPercentages: number[];
  let prevUserBalanceInDRC: number;

  before(async () => {
    instance = await DigitalReserve.deployed();

    newtworkType = (await web3.eth.net.getNetworkType()) as Network;

    uniRouter = new web3.eth.Contract(
      IUniswapV2Router02.abi as AbiItem[],
      getContractAddress("uniswap", newtworkType)
    );

    prevPodPrice = Number(
      web3.utils.fromWei(await instance.getProofOfDepositPrice())
    );
    prevPercentages = (await getTokensWorth(instance, uniRouter, newtworkType))
      .tokenPercentage;
    const valueInDrc = await instance.getUserVaultInDrc(accounts[0], 100);
    prevUserBalanceInDRC = valueInDrc[0].toNumber();

    const wethAddress = await uniRouter.methods.WETH().call();
    const path = [wethAddress, getContractAddress("wbtc", newtworkType)];
    const amountOut = (
      await uniRouter.methods.getAmountsOut(web3.utils.toWei("3"), path).call()
    )[1];

    await uniRouter.methods
      .swapExactETHForTokens(
        amountOut,
        path,
        accounts[0],
        getUnixTimeAfterMins(10)
      )
      .send({
        from: accounts[0],
        value: web3.utils.toWei("3"),
        gasPriceInput: 80,
        gasLimit: 5500000,
      });
  });

  it("Should have higher DR-POD unit price after price impact", async () => {
    const newPodPrice = Number(
      web3.utils.fromWei(await instance.getProofOfDepositPrice())
    );

    assert.isAbove(newPodPrice, prevPodPrice);
  });

  it("Should have different token percentage worth after price impact", async () => {
    const newPercentages = (
      await getTokensWorth(instance, uniRouter, newtworkType)
    ).tokenPercentage;

    assert.isAbove(newPercentages[0], prevPercentages[0]);
    assert.isBelow(newPercentages[1], prevPercentages[1]);
    assert.isBelow(newPercentages[2], prevPercentages[2]);

    const valueInDrc = await instance.getUserVaultInDrc(accounts[0], 100);
    const newUserBalanceInDRC = valueInDrc[0].toNumber();
    assert.isAbove(newUserBalanceInDRC, prevUserBalanceInDRC);
  });

  it("Should have more DRC can withdraw after price impact", async () => {
    const valueInDrc = await instance.getUserVaultInDrc(accounts[0], 100);
    const newUserBalanceInDRC = valueInDrc[0].toNumber();
    assert.isAbove(newUserBalanceInDRC, prevUserBalanceInDRC);
  });
};
