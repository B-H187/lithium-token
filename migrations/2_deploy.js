const Lithium = artifacts.require("Lithium");
const lthBank = artifacts.require("lthBank");

module.exports = async function(deployer) {
	//deploy Token
	await deployer.deploy(Lithium)
	//assign token into variable to get it's address
	const lithium = await Lithium.deployed()
	//pass token address for dBank contract(for future minting)
	await deployer.deploy(lthBank, lithium.address)
	//assign dBank contract into variable to get it's address
	const dbank = await lthBank.deployed()
	//change token's owner/minter from deployer to dBank
	await lithium.passMinterRole(lthBank.address)
};