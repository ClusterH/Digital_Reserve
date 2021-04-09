import { DigitalReserveInstance } from "../../types/truffle-contracts";
import { StrategyChange } from "../../types/truffle-contracts/DigitalReserve";
import { assertRevert } from "../test-helpers/assertions";
import { Network, getContractAddress } from "../../utils/contract-by-network";
import { getUnixTimeAfterMins } from "../../utils/timestamp";

const DigitalReserve = artifacts.require("DigitalReserve");

export const testSetStrategy = async () => {
  let instance: DigitalReserveInstance;
  let newtworkType: Network;

  before(async () => {
    instance = await DigitalReserve.deployed();
    newtworkType = (await web3.eth.net.getNetworkType()) as Network;
  });

  it("Should revert if setting to 0 tokens", async () => {
    await assertRevert(
      instance.changeStrategy([], [], getUnixTimeAfterMins(10)),
      "Setting strategy to 0 tokens.",
      "Can't set strategy to empty array"
    );
  });

  it("Should revert if token numbers doesn't match percentage length", async () => {
    await assertRevert(
      instance.changeStrategy(
        [
          getContractAddress("wbtc", newtworkType),
          getContractAddress("paxg", newtworkType),
        ],
        [60],
        getUnixTimeAfterMins(10)
      ),
      "Strategy tokens length doesn't match token percentage length.",
      "Can't set strategy tokens different from percentage length"
    );
  });

  it("Should revert if percentage doesn't added to 100", async () => {
    await assertRevert(
      instance.changeStrategy(
        [
          getContractAddress("wbtc", newtworkType),
          getContractAddress("paxg", newtworkType),
        ],
        [50, 40],
        getUnixTimeAfterMins(10)
      ),
      "Total token percentage is not 100%.",
      "Wrong percentage"
    );
  });

  it("Should set strategy and emit event with new settings", async () => {
    const setStrategyResult = await instance.changeStrategy(
      [
        getContractAddress("wbtc", newtworkType),
        getContractAddress("paxg", newtworkType),
      ],
      [50, 50],
      getUnixTimeAfterMins(10)
    );

    const setStrategyLog = setStrategyResult.logs.find(
      (log) => log.event === "StrategyChange"
    ) as StrategyChange | undefined;

    assert.exists(setStrategyLog);

    if (setStrategyLog) {
      assert.equal(
        setStrategyLog.args.newTokens[0],
        getContractAddress("wbtc", newtworkType)
      );
      assert.equal(
        setStrategyLog.args.newTokens[1],
        getContractAddress("paxg", newtworkType)
      );
      assert.equal(setStrategyLog.args.newPercentage[0].toNumber(), 50);
      assert.equal(setStrategyLog.args.newPercentage[1].toNumber(), 50);
    }
  });

  it("Should set strategy and emit event with old and new settings", async () => {
    const changeStrategyResult = await instance.changeStrategy(
      [
        getContractAddress("wbtc", newtworkType),
        getContractAddress("paxg", newtworkType),
        getContractAddress("usdc", newtworkType),
      ],
      [40, 40, 20],
      getUnixTimeAfterMins(10)
    );

    const changeStrategyLog = changeStrategyResult.logs.find(
      (log) => log.event === "StrategyChange"
    ) as StrategyChange | undefined;

    assert.exists(changeStrategyLog);

    if (changeStrategyLog) {
      assert.equal(
        changeStrategyLog.args.oldTokens[0],
        getContractAddress("wbtc", newtworkType)
      );
      assert.equal(
        changeStrategyLog.args.oldTokens[1],
        getContractAddress("paxg", newtworkType)
      );
      assert.equal(changeStrategyLog.args.oldPercentage[0].toNumber(), 50);
      assert.equal(changeStrategyLog.args.oldPercentage[1].toNumber(), 50);
      assert.equal(changeStrategyLog.args.newPercentage[2].toNumber(), 20);
    }
  });

  it("Should have 3 tokens with 0 balance", async () => {
    const strateyTokenCount = (await instance.strategyTokenCount()).toNumber();
    assert.equal(strateyTokenCount, 3);

    const expectedAddresses = [
      getContractAddress("wbtc", newtworkType),
      getContractAddress("paxg", newtworkType),
      getContractAddress("usdc", newtworkType),
    ];
    const expectedPercentages = [40, 40, 20];
    for (let i = 0; i < strateyTokenCount; i++) {
      const strategyToken = await instance.strategyTokens(i);
      assert.equal(strategyToken[0], expectedAddresses[i]);
      assert.equal(strategyToken[1].toNumber(), expectedPercentages[i]);
    }

    const tokens = await instance.totalTokenStored();
    assert.equal(tokens[0].toNumber(), 0);
    assert.equal(tokens[1].toNumber(), 0);
    assert.equal(tokens[2].toNumber(), 0);
  });
};
