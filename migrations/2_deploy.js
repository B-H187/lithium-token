const Lithium = artifacts.require("Lithium");
const dBank = artifacts.require("dBank");

module.exports = async function(deployer) {
	//deploy Token
	await deployer.deploy(Lithium)
	//assign token into variable to get it's address
	const lithium = await Lithium.deployed()
	//pass token address for dBank contract(for future minting)
	await deployer.deploy(dBank, lithium.address)
	//assign dBank contract into variable to get it's address
	const dbank = await dBank.deployed()
	//change token's owner/minter from deployer to dBank
	await lithium.passMinterRole(dbank.address)
};