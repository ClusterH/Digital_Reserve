import { testSetStrategy } from "./test-cases/set-strategy";
import { testInitialDeposit } from "./test-cases/initial-deposit";
import { testInitialSupply } from "./test-cases/initial-supply";
import { testSecondDeposit } from "./test-cases/second-deposit";
import { testPriceImpact } from "./test-cases/price-impact";
import { testRebalance } from "./test-cases/rebalance";
import { testChangeStrategy } from "./test-cases/change-strategy";
import { testWithdraw } from "./test-cases/withdraw";

contract("DigitalReserve", (accounts) => {
  describe("Initial supplies", async () => testInitialSupply());

  describe("Set Strategy", async () => testSetStrategy());

  describe("Deposit 1000 DRC", async () => testInitialDeposit(accounts));

  describe("Deposit 1000000 DRC", async () => testSecondDeposit(accounts));

  describe("Price impact", async () => testPriceImpact(accounts));

  describe("Rebalance", async () => testRebalance());

  describe("Change Strategy", async () => testChangeStrategy());

  describe("Withdrawal", async () => testWithdraw(accounts));
});
