import { DigitalReserveInstance } from "../../types/truffle-contracts";

const DigitalReserve = artifacts.require("DigitalReserve");

export const template = async (accounts: Truffle.Accounts) => {
  let instance: DigitalReserveInstance;

  before(async () => {
    instance = await DigitalReserve.deployed();
  });

  it("Should", async () => {});
};
