import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { DigitalReserveInstance } from "../../types/truffle-contracts";
import IUniswapV2Router02 from "../../build/contracts/IUniswapV2Router02.json";
import { Network, getContractAddress } from "../../utils/contract-by-network";
import { getTokensWorth } from "../test-helpers/get-tokens-worth";
import { Rebalance } from "../../types/truffle-contracts/DigitalReserve";
import { getUnixTimeAfterMins } from "../../utils/timestamp";

const DigitalReserve = artifacts.require("DigitalReserve");

export const testRebalance = async () => {
  let instance: DigitalReserveInstance;

  let uniRouter: Contract;
  let newtworkType: Network;
  let prevPodPrice: number;

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
  });

  it("Should successfully rebalance vault", async () => {
    const rebalanceResult = await instance.rebalance(getUnixTimeAfterMins(10));

    const rebalanceLog = rebalanceResult.logs.find(
      (log) => log.event === "Rebalance"
    ) as Rebalance | undefined;

    assert.exists(rebalanceLog);

    if (rebalanceLog) {
      assert.equal(
        rebalanceLog.args.strategyTokens[0],
        getContractAddress("wbtc", newtworkType)
      );
      assert.equal(
        rebalanceLog.args.strategyTokens[1],
        getContractAddress("paxg", newtworkType)
      );
      assert.equal(
        rebalanceLog.args.strategyTokens[2],
        getContractAddress("usdc", newtworkType)
      );
      assert.equal(rebalanceLog.args.tokenPercentage[0].toNumber(), 40);
      assert.equal(rebalanceLog.args.tokenPercentage[1].toNumber(), 40);
      assert.equal(rebalanceLog.args.tokenPercentage[2].toNumber(), 20);
    }
  });

  it("Should match designed percentage after rebalance", async () => {
    const { tokenPercentage } = await getTokensWorth(
      instance,
      uniRouter,
      newtworkType
    );

    assert.equal(tokenPercentage[0], 40);
    assert.equal(tokenPercentage[1], 40);
    assert.equal(tokenPercentage[2], 20);
  });

  it("Should have similar proof of deposit price", async () => {
    const newPodPrice = Number(
      web3.utils.fromWei(await instance.getProofOfDepositPrice())
    );

    const newToOldRatio = Math.round((newPodPrice / prevPodPrice) * 100);

    assert.equal(newToOldRatio, 100);
  });
};
