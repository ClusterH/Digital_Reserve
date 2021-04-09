import { Contract } from "web3-eth-contract";
import { DigitalReserveInstance } from "../../types/truffle-contracts";
import { getContractAddress, Network } from "../../utils/contract-by-network";

export const getTokensWorth = async (
  instance: DigitalReserveInstance,
  uniRouter: Contract,
  newtworkType: Network
) => {
  const tokens = await instance.totalTokenStored();

  const wethAddress = await uniRouter.methods.WETH().call();
  const amount1 = await uniRouter.methods
    .getAmountsIn(tokens[0].toString(), [
      wethAddress,
      getContractAddress("wbtc", newtworkType),
    ])
    .call();
  const amount2 = await uniRouter.methods
    .getAmountsIn(tokens[1].toString(), [
      wethAddress,
      getContractAddress("paxg", newtworkType),
    ])
    .call();
  const amount3 = await uniRouter.methods
    .getAmountsIn(tokens[2].toString(), [
      wethAddress,
      getContractAddress("usdc", newtworkType),
    ])
    .call();

  const tokenWorth1 = Number(web3.utils.fromWei(amount1[0]));
  const tokenWorth2 = Number(web3.utils.fromWei(amount2[0]));
  const tokenWorth3 = Number(web3.utils.fromWei(amount3[0]));
  const total = tokenWorth1 + tokenWorth2 + tokenWorth3;

  const percentage1 = Math.round((tokenWorth1 / total) * 100);
  const percentage2 = Math.round((tokenWorth2 / total) * 100);
  const percentage3 = Math.round((tokenWorth3 / total) * 100);

  return {
    tokenWorth: [tokenWorth1, tokenWorth2, tokenWorth3],
    tokenPercentage: [percentage1, percentage2, percentage3],
  };
};

export const getTokensWorthSet2 = async (
  instance: DigitalReserveInstance,
  uniRouter: Contract,
  newtworkType: Network
) => {
  const tokens = await instance.totalTokenStored();

  const wethAddress = await uniRouter.methods.WETH().call();
  const amount1 = await uniRouter.methods
    .getAmountsIn(tokens[0].toString(), [
      wethAddress,
      getContractAddress("wbtc", newtworkType),
    ])
    .call();
  const amount2 = await uniRouter.methods
    .getAmountsIn(tokens[1].toString(), [
      wethAddress,
      getContractAddress("paxg", newtworkType),
    ])
    .call();

  const tokenWorth1 = Number(web3.utils.fromWei(amount1[0]));
  const tokenWorth2 = Number(web3.utils.fromWei(amount2[0]));
  const tokenWorth3 = Number(web3.utils.fromWei(tokens[2]));
  const total = tokenWorth1 + tokenWorth2 + tokenWorth3;

  const percentage1 = Math.round((tokenWorth1 / total) * 100);
  const percentage2 = Math.round((tokenWorth2 / total) * 100);
  const percentage3 = Math.round((tokenWorth3 / total) * 100);

  return {
    tokenWorth: [tokenWorth1, tokenWorth2, tokenWorth3],
    tokenPercentage: [percentage1, percentage2, percentage3],
  };
};
