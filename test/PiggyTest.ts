import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Contract cases", function () {
  
  async function deployContractsInstances() {
    
  
    const [owner, otherAccount] = await ethers.getSigners();

    const WCXTOKEN = await ethers.getContractFactory("WCXTOKEN");
    const token = await WCXTOKEN.deploy();

    const Piggy = await ethers.getContractFactory("Piggy");
    const piggy = await Piggy.deploy(token.target);

    return { token, piggy, owner, otherAccount };
  }

  describe("Contracts Deployments", function () {
    it("Should pass if WCXTOKEN contract has deployed succesffully", async function () {
      const { token } = await loadFixture(deployContractsInstances);

      expect(token).to.exist;
    });
    it("Should pass if Piggy contract has deployed succesffully", async function () {
      const { piggy } = await loadFixture(deployContractsInstances);

      expect(piggy).to.exist;
    });
  });

  describe("Deposit TOKEN", function () {
    it("Should pass with revertedWithCustomError, when attempted to deposit with amount equal 0", async function () {
      const { piggy } = await loadFixture(deployContractsInstances);
      const tx = piggy.depositToken(0)
      expect(tx).to.be.revertedWithCustomError;
    })

    it("Should pass with revertedWithCustomError from WCXTOKEN, when attempted to deposit without approval to spend token or having token type", async function () {
      const { piggy } = await loadFixture(deployContractsInstances);
      const tx = piggy.depositToken(100)
      //  ERC20InsufficientAllowance
      expect(tx).to.be.revertedWithCustomError;
    })

    it("Should pass an emit after successful transaction", async function () {
      const { piggy, token } = await loadFixture(deployContractsInstances);
      await token.approve(piggy.target, 100)
      const tx = piggy.depositToken(100)

      expect(tx).to.emit;
    })

    it("Should increase user's token in piggy on safe deposit", async function () {
      const { piggy, token, owner } = await loadFixture(deployContractsInstances);
      await token.approve(piggy.target, 100)
      await piggy.depositToken(50)
      const bal = await piggy.checkSavings(piggy.target, 1)
      expect(bal).to.equal(50);
    })

    it("Should pass with revertedWithCustomError, when attempted to deposit with amount greater than users owned token", async function () {
      const { piggy, token, owner } = await loadFixture(deployContractsInstances);
      await token.approve(piggy.target, 100)
      const tx = piggy.depositToken(1000)
      expect(tx).to.be.revertedWithCustomError;
    })
  })
  describe("Withdraw TOKEN", function () {
    it("Should pass with revertedWith, when attempted to withdraw amount equal 0", async function () {
      const { piggy, token } = await loadFixture(deployContractsInstances);
      await token.approve(piggy.target, 100)
      const tx = piggy.depositToken(100)
      expect(tx).to.be.revertedWithCustomError;
    })
  })

  describe("Withdraw ETHER", function () {
    it("Should be able to withdraw all and render savings balance zero", async function () {
      const { piggy } = await loadFixture(deployContractsInstances);
      // Send 1 ETH
      const depositTx = await piggy.depositEthers({ value: ethers.parseEther("1") });
      //   withdraw all ETH
      const balance = await piggy.withdrawEthers()
      expect(balance.value).to.equal(0);
    })
    
  })

  describe("Deposit ETHER", function () {
    it("Should pass with revertedWithCustomError, when attempted to deposit with amount equal 0", async function () {
      const { piggy } = await loadFixture(deployContractsInstances);
      const tx = piggy.depositEthers({value: ethers.parseEther("0")})
      expect(tx).to.be.revertedWithCustomError;
    })
    it("Should be able to deposit", async function () {
      const { piggy} = await loadFixture(deployContractsInstances);
       // deposit 1wei
          const depositTx = await piggy.depositEthers({value:1});
          const balance = await piggy.checkContractBal()
          expect(balance).to.equal(1);
        });
    })
})