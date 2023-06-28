import React from "react";
import LocalForage from "localforage";
import Alert from "react-bootstrap/Alert";

import DashBkgd from "./Images/dash_digital-cash_logo_2018_rgb_for_screens.png";
import Image from "react-bootstrap/Image";

import TopNav from "./Components/TopNav/TopNav";
import BottomNav from "./Components/BottomNav/BottomNav";
import LoginBottomNav from "./Components/BottomNav/LoginBottomNav";

import LandingPage from "./Components/Pages/LandingPage";
import ConnectedWalletPage from "./Components/Pages/ConnectedWalletPage";

import Footer from "./Components/Footer";
import PaymentAddrComponent from "./Components/PaymentAddrComponent";
import TxHistoryComponent from "./Components/TxHistoryComponent";

import ConnectWalletModal from "./Components/TopNav/ConnectWalletModal";
import LogoutModal from "./Components/TopNav/LogoutModal";
import ConfirmPaymentModal from "./Components/Pages/ConfirmPaymentModal";
import RegisterDGMModal from "./Components/BottomNav/BottomNavModalFolder/RegisterDGMModal";
import TopUpIdentityModal from "./Components/BottomNav/BottomNavModalFolder/TopUpModal";

import "./App.css";

const Dash = require("dash");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      isLoading: false,
      isLoadingConfirmation: false,
      isLoadingButtons: false,
      isLoadingForm: false,

      mode: "dark",
      presentModal: "",
      isModalShowing: false,
      whichNetwork: "testnet",

      mnemonic: "",

      accountBalance: "",
      accountAddress: "",
      accountHistory: "",
      dgmDocuments: [],

      identity: "",
      identityInfo: "",
      identityRaw: "",
      uniqueName: "",

      sendToName: "",
      sendToAddress: "",
      amountToSend: 0,

      sendSuccess: false,
      sendFailure: false,
      nameSuccess: "",
      amtSuccess: 0,

      platformLogin: false,
      walletId: "",

      LocalForageKeys: [],
      DashMoneyLFKeys: [],
      skipSynchronizationBeforeHeight: 855000, 
      mostRecentBlockHeight: 855000,
      expandedTopNav: false,
    };
  }

  collapseTopNav = () => {
    this.setState({ expandedTopNav: false });
  };

  toggleTopNav = () => {
    if (this.state.expandedTopNav) {
      this.setState({ expandedTopNav: false });
    } else {
      this.setState({
        expandedTopNav: true,
      });
    }
  };


  hideModal = () => {
    this.setState({
      isModalShowing: false,
    });
  };

  showModal = (modalName) => {
    this.setState({
      presentModal: modalName,
      isModalShowing: true,
    });
  };

  showConfirmModal = (inputName, inputNumber, paymentAddress) => {
    this.setState(
      {
        sendSuccess: false,
        sendFailure: false,
        sendToName: inputName,
        amountToSend: Number(inputNumber).toFixed(3),
        sendToAddress: paymentAddress,
        presentModal: "ConfirmPaymentModal",
        isModalShowing: true,
      },
      () => {
        console.log(this.state.sendToName);
        console.log(this.state.amountToSend);
      }
    );
  };

  handleMode = () => {
    if (this.state.mode === "primary")
      this.setState({
        mode: "dark",
      });
    else {
      this.setState({
        mode: "primary",
      });
    }
  };

  handleSkipSyncLookBackFurther = () => {
    this.setState(
      {
        skipSynchronizationBeforeHeight:
          this.state.skipSynchronizationBeforeHeight - 10000,
        isLoading: true, // Need because Balance ===0 hides all the other spinners
      },
      () => this.handleLoginforRefreshWallet()
    );
  };

  handleLogout = () => {
    this.setState(
      {
        isLoggedIn: false,
        isLoading: false,
        isLoadingConfirmation: false,
        isLoadingButtons: false,
        isLoadingForm: false,
        presentModal: "",
        isModalShowing: false,
        mnemonic: "",
        accountBalance: "",
        accountAddress: "",
        accountHistory: "",
        identity: "",
        identityInfo: "",
        uniqueName: "",
        dgmDocuments: [],
        sendToName: "",
        amountToSend: 0,
        paymentAddress: "",
        sendSuccess: false,
        sendFailure: false,

        walletIdToTry: "",
        walletId: "",
        LocalForageKeys: [],
        skipSynchronizationBeforeHeight: 855000,
        mostRecentBlockHeight: 855000,
        expandedTopNav: false,
      },
      () => this.componentDidMount()
    ); 
  };

  updateCreditsAfterTopUp = (identInfo) => {
    this.setState({
      identityInfo: identInfo,
      isLoadingButtons: false,
      isLoadingConfirmation: false,
      isLoadingForm: false,
      accountBalance: this.state.accountBalance - 1000000,
    });
  };

  triggerTopUpEndLoadingsAfterFail = () => {
    this.setState({
      isLoadingButtons: false,
      isLoadingConfirmation: false,
      isLoadingForm: false,
    });
  };

  triggerTopUpLoading = () => {
    this.setState({
      isLoadingButtons: true,
      isLoadingConfirmation: true,
      isLoadingForm: true,
    });
  };

  componentDidMount() {

    //1) GET WALLETID KEYS For New Wallet Login and Wallet Sync
    LocalForage.config({
      name: "dashevo-wallet-lib", 
    });

    let dashevo = LocalForage.createInstance({
      name: "dashevo-wallet-lib",
    });

    dashevo.keys()
      .then((keys) => {
        this.setState({
          LocalForageKeys: keys,
        });
        console.log(keys);
      })
      .catch(function (err) {
        console.log(err);
      });

  //****************************** */   
  
  //2) GET WALLETID KEYS FOR OBTAINING IDENTITY

    LocalForage.config({
      name: "dashmoney-platform-login",
    });

    let DashMoneyLF = LocalForage.createInstance({
      name: "dashmoney-platform-login",
    });

    DashMoneyLF.keys()
      .then((keys) => {
        this.setState({
          DashMoneyLFKeys: keys,
        });
        console.log(keys);
      })
      .catch(function (err) {
        console.log(err);
      });

//****************************** */ 
    //3) GET MOST RECENT BLOCK HEIGHT FOR NEW WALLET LOGIN

    const clientOpts = {
      network: this.state.whichNetwork,
    };

    const client = new Dash.Client(clientOpts);

    const getMostRecentBlockHeight = async () => {
      const status = await client.getDAPIClient().core.getStatus();

      return status;
    };

    getMostRecentBlockHeight()
      .then((d) => {
        let blockHeight = d.chain.blocksCount;
        console.log("Most Recent Block Height:\n", blockHeight);
        this.setState({
          mostRecentBlockHeight: blockHeight - 2500,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
      })
      .finally(() => client.disconnect());
  }

//THIS SHOULD TRIGGER THE LOGIN PROCESS
handleWalletConnection = (theMnemonic) => {

  this.getWalletIdBeforeLogin(theMnemonic, this.state.skipSynchronizationBeforeHeight);

  this.setState({
    mnemonic: theMnemonic,
    isLoggedIn: true,
    isLoading: true,
    isLoadingPlatform: true,
  });
};

getWalletIdBeforeLogin = (theMnemonic,skipHeight) => {

  const clientOpts = {
    network: this.state.whichNetwork,
    wallet: {
      mnemonic: theMnemonic,
      offlineMode: true,
    },
  };
  const client = new Dash.Client(clientOpts);

  const createWallet = async () => {
    const account = await client.getWalletAccount();
    
    console.log("walletId:", account.walletId);
    return account.walletId;
  };

  createWallet()
    .then((d) => {
      this.setState({
        walletId: d,
      },()=>this.getIdentitywithMnem(theMnemonic, skipHeight));
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());
}

  
  handleFormClearThenRefresh = () => {
    document.getElementById("Pay-to-Name-form").reset();
    //https://stackoverflow.com/questions/43922508/clear-and-reset-form-input-fields
    this.handleLoginforRefreshWallet();
  };

  handleLoginforRefreshWallet = () => {
    this.setState({
      isLoadingConfirmation: true,
      isLoadingButtons: true,
    });

    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();

      this.setState({
        accountBalance: account.getTotalBalance(),
        accountAddress: account.getUnusedAddress().address, 
        accountHistory: account.getTransactionHistory(),
      });

      return account;
    };

    retrieveIdentityIds()
      .then((d) => {
        //console.log("Wallet Account:\n", d);
        this.setState({
          isLoadingConfirmation: false,
          isLoadingButtons: false,
          isLoading: false, //Need for Balance ===0, sets true
        });
      })
      .catch((e) => {
        console.error("Something went wrong getting Wallet:\n", e);
        this.setState({
          isLoadingConfirmation: false,
          isLoadingButtons: false,
          isLoading: false, //Need for Balance ===0, sets true
        });
      })
      .finally(() => client.disconnect());
  };

  getIdentitywithMnem = (theMnemonic, blockHeight) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: theMnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight: blockHeight,
        },
      },
    });

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();

      console.log(account.getTotalBalance());
      // console.log(account.getUnusedAddress().address);
      console.log(account.getTransactionHistory());

      this.setState({
        //accountWallet: client, //Can I use this for the send TX?-> NO
        accountBalance: account.getTotalBalance(),
        accountAddress: account.getUnusedAddress().address, //This can be used if you havent created the DGMDocument <-
        accountHistory: account.getTransactionHistory(),
      });

      return account.identities.getIdentityIds();
    };

    retrieveIdentityIds()
      .then((d) => {
        console.log("Mnemonic identities:\n", d);
        if (d.length === 0) {
          this.setState({
            isLoading: false,
            identity: "No Identity",
          });
        } else {
          this.setState(
            {
              identity: d[0],
              //maintain Loading bc continuing to other functions
            },
            () => this.conductFullLogin(d[0])
          );
        }
      })
      .catch((e) => {
        console.error("Something went wrong getting IdentityIds:\n", e);
        this.setState({
          isLoading: false,
          identity: "No Identity",
        });
      })
      .finally(() => client.disconnect());

      console.log('Checking Platform Login')
      this.checkPlatformOnlyLogin(theMnemonic);
  };

  conductFullLogin = (theIdentity) => {
    if (!this.state.platformLogin) {
      this.handleLoginQueries(theIdentity);
    }else{
      this.endInitialLogin();
    }
  };

  checkPlatformOnlyLogin = (theMnemonic) => {
    //THIS RUNS IN PARALLEL WITH THE getIdentitywithMnem
    
  let isKeyAvail =this.state.DashMoneyLFKeys.includes(this.state.walletId);
    
        console.log(`DashMoney LF Test -> ${isKeyAvail}`);

        if (isKeyAvail) {
          console.log("Parallel Login");

          let DashMoneyLF = LocalForage.createInstance({
            name: "dashmoney-platform-login",
          });

          DashMoneyLF.getItem(this.state.walletId)
            .then((val) => {
              console.log("Value Retrieved", val);

              if (
                val !== null ||
                typeof val.identity !== "string" ||
                val.identity === ""
              ) {
                this.setState({
                  platformLogin: true,
                  uniqueName: val.name,
                  identity: val.identity,
                  walletId: this.state.walletId,
                },()=>this.handleLoginQueries(val.identity));
                
              } else {
                console.log("Local Forage Values Failed");
              }
            })
            .catch((err) => {
              console.error(
                "Something went wrong getting from localForage:\n",
                err
              );
            });

        }
      
  };

  handleLoginQueries = (theIdentity) => {
    this.getIdentityInfo(theIdentity);
    this.queryDGMDocument(theIdentity);
    
    if (!this.state.platformLogin) {
      this.getNamefromIdentity(theIdentity);
    }
  };

  getIdentityInfo = (theIdentity) => {
    console.log("Called get Identity Info");

    const client = new Dash.Client({
      network: this.state.whichNetwork,
    });

    const retrieveIdentity = async () => {
      return client.platform.identities.get(theIdentity); // Your identity ID
    };

    retrieveIdentity()
      .then((d) => {
        console.log("Identity retrieved:\n", d.toJSON());
        let idInfo = d.toJSON();
        this.setState(
          {
            identityInfo: idInfo,
            identityRaw: d,
          });
      })
      .catch((e) => {
        console.error("Something went wrong in retrieving the identity:\n", e);
        this.setState({
          isLoading: false,
          identityInfo: "Load Failure", 
        });
      })
      .finally(() => client.disconnect());
  };

  getNamefromIdentity = (theIdentity) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
    });

    const retrieveNameByRecord = async () => {
      // Retrieve by a name's identity ID
      return client.platform.names.resolveByRecord(
        "dashUniqueIdentityId",
        theIdentity // Your identity ID
      );
    };

    retrieveNameByRecord()
      .then((d) => {
        let nameRetrieved = d[0].toJSON();
        console.log("Name retrieved:\n", nameRetrieved);

        //CREATE AN OBJECT AND PUT IT IN THERE!!!
        let lfObject = {
          identity: theIdentity,
          name: nameRetrieved.label,
        };

        let DashMoneyLF = LocalForage.createInstance({
          name: "dashmoney-platform-login",
        });

        DashMoneyLF.setItem(this.state.walletId, lfObject)
          .then((d) => {
            //return LocalForage.getItem(walletId);
            console.log("Return from LF setitem:", d);
          })
          .catch((err) => {
            console.error(
              "Something went wrong setting to localForage:\n",
              err
            );
          });
        //******************** */

        this.setState({
          uniqueName: nameRetrieved.label,
        },()=> this.endInitialLogin());
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        console.log("There is no dashUniqueIdentityId to retrieve.");
        this.setState({
          isLoading: false,
          uniqueName: "Er",
        });
      })
      .finally(() => client.disconnect());
  };

  queryDGMDocument = (theIdentity) => {
    const clientOpts = {
      network: this.state.whichNetwork,
      apps: {
        DGMContract: {
          contractId: 'DvFwMMxLRfPLp5bGK8D4CqaHME21iF7R9HnBnvf7Mk8g',
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const getDocuments = async () => {
      console.log("Called Query DGM Documents.");

      return client.platform.documents.get("DGMContract.dgmaddress", {
        where: [["$ownerId", "==", theIdentity]],
      });
    };

    getDocuments()
      .then((d) => {
        let docArray = [];
        for (const n of d) {
          console.log("Document:\n", n.toJSON());
          docArray = [...docArray, n.toJSON()];
        }

        this.setState(
          {
            dgmDocuments: docArray,
          });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
          isLoading: false,
          isLoadingButtons: false,
          
        });
      })
      .finally(() => client.disconnect());
  };

  endInitialLogin = () => {
    this.setState({
      isLoading: false,
      isLoadingButtons: false,
    });
  };

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  RegisterDGMAddress = () => {
    console.log("Called Register DGM Address");
    this.setState({
      isLoadingConfirmation: true,
      isLoadingButtons: true,
    });
    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        DGMContract: {
          contractId: 'DvFwMMxLRfPLp5bGK8D4CqaHME21iF7R9HnBnvf7Mk8g',
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const submitNoteDocument = async () => {
      const { platform } = client;
      const identity = await platform.identities.get(this.state.identity); // Your identity ID

      const docProperties = {
        address: this.state.accountAddress,
      };

      // Create the note document
      const dgmDocument = await platform.documents.create(
        "DGMContract.dgmaddress", /// I changed .note TO .dgmaddress***
        identity,
        docProperties
      );

      const documentBatch = {
        create: [dgmDocument], // Document(s) to create
        replace: [], // Document(s) to update
        delete: [], // Document(s) to delete
      };
      // Sign and submit the document(s)
      return platform.documents.broadcast(documentBatch, identity);
    };

    submitNoteDocument()
      .then((d) => {
        let returnedDoc = d.toJSON();
        console.log("Document:\n", returnedDoc);

        this.setState({
          dgmDocuments: [returnedDoc],
          isLoadingConfirmation: false,
          isLoadingButtons: false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
          isLoadingConfirmation: false,
          isLoadingButtons: false,
        });
      })
      .finally(() => client.disconnect());
  };

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  //FROM: https://dashpay.github.io/platform/Wallet-library/account/createTransaction/

  sendDashtoName = () => {
    this.setState({
      isLoadingButtons: true,
      isLoadingConfirmation: true,
      isLoadingForm: true,
    });

    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const payToRecipient = async () => {
      const account = await client.getWalletAccount();

      let dashAmt = this.state.amountToSend * 100000000;
      console.log("sats sent in TX:", dashAmt);
      console.log(typeof dashAmt);

      // let amt = dashAmt.toFixed(0).toString();
      // console.log(amt);
      // console.log(typeof amt);

      const transaction = account.createTransaction({
        recipient: this.state.sendToAddress,
        satoshis: dashAmt, //Must be a string!!
       
      });
      //return transaction;//Use to disable TX
      return account.broadcastTransaction(transaction);
    };

    payToRecipient()
      .then((d) => {
        console.log("Payment TX:\n", d);

        this.setState(
          {
            isLoadingConfirmation: false,
            isLoadingButtons: false,
            isLoadingForm: false,
            sendSuccess: true,
          },
          () => this.handleFormClearThenRefresh()
        ); 
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          isLoadingConfirmation: false,
          isLoadingButtons: false,
          isLoadingForm: false,
          sendFailure: true,
        });
      })
      //.finally(() => client.disconnect()); // <- Caused Error
  };

  render() {
    this.state.mode === "primary"
      ? (document.body.style.backgroundColor = "rgb(280,280,280)")
      : (document.body.style.backgroundColor = "rgb(20,20,20)");

    this.state.mode === "primary"
      ? (document.body.style.color = "black")
      : (document.body.style.color = "white");

    return (
      <>
        <TopNav
          handleMode={this.handleMode}
          mode={this.state.mode}
          showModal={this.showModal}
          whichNetwork={this.state.whichNetwork}
          isLoggedIn={this.state.isLoggedIn}
          toggleTopNav={this.toggleTopNav}
          expandedTopNav={this.state.expandedTopNav}
        />

        <Image fluid="true" id="dash-bkgd" src={DashBkgd} alt="Dash Logo" />

        {!this.state.isLoggedIn ? (
          <>
            <LandingPage />
            <LoginBottomNav mode={this.state.mode} showModal={this.showModal} />
            <Footer />
          </>
        ) : (
          <>
            <ConnectedWalletPage
              handleSkipSyncLookBackFurther={this.handleSkipSyncLookBackFurther}
              sendFailure={this.state.sendFailure}
              sendSuccess={this.state.sendSuccess}
              mnemonic={this.state.mnemonic}
              whichNetwork={this.state.whichNetwork}
              skipSynchronizationBeforeHeight={
                this.state.skipSynchronizationBeforeHeight
              }
              dgmDocuments={this.state.dgmDocuments}
              isLoading={this.state.isLoading}
              isLoadingButtons={this.state.isLoadingButtons}
              isLoadingConfirmation={this.state.isLoadingConfirmation}
              isLoadingForm={this.state.isLoadingForm}
              accountBalance={this.state.accountBalance}
              accountAddress={this.state.accountAddress}
              identity={this.state.identity}
              identityInfo={this.state.identityInfo}
              uniqueName={this.state.uniqueName}
              showConfirmModal={this.showConfirmModal}
            />

            {this.state.sendSuccess ? (
              <>
                <p></p>
                <Alert variant="success" dismissible>
                  <Alert.Heading>Payment Successful!</Alert.Heading>
                  You have successfully sent{" "}
                  <b>
                    {Number(this.state.amountToSend).toFixed(3)} Dash
                  </b> to <b>{this.state.sendToName}!</b>
                </Alert>
              </>
            ) : (
              <></>
            )}

            {this.state.sendFailure ? (
              <>
                <p></p>
                <Alert variant="danger" dismissible>
                  <Alert.Heading>Payment Failed</Alert.Heading>
                  <p>
                    You have run into a platform error or a repeated transaction
                    error. If everything seems correct, please retry{" "}
                    <b>Verify Payment</b> to try again.
                  </p>
                </Alert>
              </>
            ) : (
              <></>
            )}

            {!this.state.isLoading &&
            this.state.identity !== "No Identity" &&
            this.state.uniqueName !== "Er" &&
            this.state.accountBalance !== 0 ? (
              <BottomNav
                handleLoginforRefreshWallet={this.handleLoginforRefreshWallet}
                dgmDocuments={this.state.dgmDocuments}
                isLoadingButtons={this.state.isLoadingButtons}
                collapseTopNav={this.collapseTopNav}
                handleGetDocsandGetIdInfo={this.handleGetDocsandGetIdInfo}
                //Need to pass everything for TOPUP Function
                mode={this.state.mode}
                showModal={this.showModal}
              />
            ) : (
              <></>
            )}

            {!this.state.isLoading ? (
              <>
                <TxHistoryComponent
                  mode={this.state.mode}
                  accountHistory={this.state.accountHistory}
                  accountBalance={this.state.accountBalance}
                />

                <PaymentAddrComponent
                  mode={this.state.mode}
                  accountAddress={this.state.accountAddress}
                />
              </>
            ) : (
              <></>
            )}

            <Footer />
          </>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "ConnectWalletModal" ? (
          <ConnectWalletModal
            LocalForageKeys={this.state.LocalForageKeys}
            showModal={this.showModal}
            isModalShowing={this.state.isModalShowing}
           // handleNEWWalletConnection={this.handleNEWWalletConnection}
            handleWalletConnection={this.handleWalletConnection}
            hideModal={this.hideModal}
            mode={this.state.mode}
            collapseTopNav={this.collapseTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "ConfirmPaymentModal" ? (
          <ConfirmPaymentModal
            sendToName={this.state.sendToName}
            amountToSend={this.state.amountToSend}
            sendDashtoName={this.sendDashtoName}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            collapseTopNav={this.collapseTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "LogoutModal" ? (
          <LogoutModal
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            handleLogout={this.handleLogout}
            collapseTopNav={this.collapseTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "RegisterDGMModal" ? (
          <RegisterDGMModal
            RegisterDGMAddress={this.RegisterDGMAddress}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            collapseTopNav={this.collapseTopNav}
          />
        ) : (
          <></>
        )}

        {this.state.isModalShowing &&
        this.state.presentModal === "TopUpIdentityModal" ? (
          <TopUpIdentityModal
            triggerTopUpEndLoadingsAfterFail={
              this.triggerTopUpEndLoadingsAfterFail
            }
            triggerTopUpLoading={this.triggerTopUpLoading}
            updateCreditsAfterTopUp={this.updateCreditsAfterTopUp}
            mnemonic={this.state.mnemonic}
            whichNetwork={this.state.whichNetwork}
            skipSynchronizationBeforeHeight={
              this.state.skipSynchronizationBeforeHeight
            }
            identity={this.state.identity}
            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            collapseTopNav={this.collapseTopNav}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default App;
