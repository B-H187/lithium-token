import { Tabs, Tab } from 'react-bootstrap'
import lthBank from '../abis/lthBank.json'
import React, { Component } from 'react';
import Lithium from '../abis/Lithium.json'
import lthCoin from '../lthCoin.png';
import Web3 from 'web3';
import './App.css';


class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const ethEnabled = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return true;
      }
      return false;
    }
    //check if MetaMask exists
    if (!ethEnabled()) {
      window.alert("Please install MetaMask to use the Lithium Bank!");
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log(chainId)
    const web3 = new Web3(window.ethereum)
    const networkId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts()

    // load balance
    if (typeof accounts[0] !== 'undefined'){
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({ account: accounts[0], balance, web3})
    } else {
      window.alert('Please login to MetaMask')
    }

    // load the contracts
    try {
      const lithium = new web3.eth.Contract(Lithium.abi, Lithium.networks[networkId].address)
      const lthbank = new web3.eth.Contract(lthBank.abi, lthBank.networks[networkId].address)
      const lthBankAddress = lthBank.networks[networkId].address
      const lthBalance = web3.utils.fromWei(await lithium.methods.balanceOf(this.state.account).call())
      this.setState({lithium, lthbank, lthBankAddress, lthBalance})
      console.log(lthBankAddress)
    }
    catch (err) {
      console.log('Error: ', err)
      window.alert('Contracts not deployed to the current network.')
    }
  }

  async deposit(amount) {
    if (this.state.lthbank!=="undefined"){
      try{
        await this.state.lthbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (err){
        console.log("Error during deposit: ", err)
      }
    }
  }

  async withdraw(withdrawEvent) {
    withdrawEvent.preventDefault()
    if(this.state.lthbank!=="undefined"){
      try{
        await this.state.lthbank.methods.withdraw().send({from: this.state.account})
      } catch (err) {
        console.log("Error during withdrawal: ", err)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      lthbank: null,
      balance: 0,
      lthBankAddress: null,
      lthBalance: 0
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://www.empfohlen.de"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={lthCoin} className="App-logo" alt="logo" height="32"/>
          <b>LTH bank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to the Lithium Bank</h1>
          <h2>Your ETH account: {this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <br/>
                    How much do you want to deposit?
                    <br/>
                    (min. amount is 0.01 ETH)
                    <br/>
                    (1 deposit is possible at this time)
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to WEI
                      this.deposit(amount)
                    }}>
                      <div className="form-group mr-sm-2">
                        <br/>
                        <input 
                          id="depositAmount" 
                          step="0.01" 
                          type="number" 
                          className="form-control form-control-md" 
                          placeholder="amount" 
                          required 
                          ref={(input) => { this.depositAmount = input}}/>
                      </div>
                      <button type="submit" className="btn btn-primary">Deposit</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                  <div>
                    <br/>
                    Do you want to withdraw plus interest in LTH?
                    <br/>
                    <br/>
                  </div>
                  <div>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      onClick={(withdrawEvent) => this.withdraw(withdrawEvent)}>Withdraw</button>
                  </div>
                </Tab>
                <Tab eventKey="interest" title="Interest in LTH">
                  <div>
                    <br/>
                    Your LTH balance: {this.state.lthBalance}
                    <br/>
                    <br/>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;