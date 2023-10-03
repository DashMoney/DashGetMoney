import React from "react";
import LocalForage from "localforage";
//import Alert from "react-bootstrap/Alert";

import DashBkgd from "./Images/dash_digital-cash_logo_2018_rgb_for_screens.png";
import Image from "react-bootstrap/Image";

import TopNav from "./Components/TopNav/TopNav";
import BottomNav from "./Components/BottomNav/BottomNav";
import LoginBottomNav from "./Components/BottomNav/LoginBottomNav";

import LandingPage from "./Components/Pages/LandingPage";
import ConnectedWalletPage from "./Components/Pages/ConnectedWalletPage";

import Footer from "./Components/Footer";
//import PaymentAddrComponent from "./Components/PaymentAddrComponent";
//import TxHistoryComponent from "./Components/TxHistoryComponent";

import ConnectWalletModal from "./Components/TopNav/ConnectWalletModal";
import LogoutModal from "./Components/TopNav/LogoutModal";

import ConfirmAddrPaymentModal from "./Components/Pages/ConfirmAddrPaymentModal";
import RegisterDGMModal from "./Components/BottomNav/BottomNavModalFolder/RegisterDGMModal";
import TopUpIdentityModal from "./Components/BottomNav/BottomNavModalFolder/TopUpModal";
import ThreadModal from "./Components/ThreadModal";

import "./App.css";

const Dash = require("dash");

const {
  Essentials: { Buffer },
  PlatformProtocol: { Identifier },
} = Dash;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,

      isLoading: true, //what is this for -> ensure there is an identity and name  -> YES

      isLoadingWallet: true, //This is for the wallet for balance and txs
      isLoadingButtons: true,
      isLoadingForm: false,

      isLoadingRefresh: false, // This is not implemented maybe use to consolidate the confirmations, Buttons and Form?? or just add another?? -> So I think that the purpose of the refresh is currently only to keep the msgs viewable while the page reload/finishes the queries -> 

      isLoadingMsgs: true,

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
      messageToSend:'',
      sendToDGMAddressDoc:'',

      sendSuccess: false,
      sendFailure: false,
      nameSuccess: "",
      amtSuccess: 0,

      //*** *** *** *** ***

      Login1: false,
      Login2: false,
      Login3: false,
      Login4: false,
      Login5: false,
      Login6: false,
      Login7: false,

      ByYouMsgs: [],
      ByYouNames: [],
      ByYouThreads: [],

      ToYouMsgs: [],
      ToYouNames: [],
      ToYouThreads: [],

      //BELOW Most Recent Initial
      Initial1: false,
      Initial2: false,
      Initial3: false,
      Initial4: false,
      Initial5: false,
      Initial6: false,

      InitialDGMAddr: '',
      InitialIdentityInfo: '',
      InitialIdentityRaw: '',

      InitialByYouMsgs: [],
      InitialByYouNames: [],
      InitialByYouThreads: [],

      InitialToYouMsgs: [],
      InitialToYouNames: [],
      InitialToYouThreads: [],

      //ABOVE Most Recent Initial

      //BELOW Refresh
      Refresh1: false,
      Refresh2: false,
      Refresh3: false,
      Refresh4: false,
      Refresh5: false,
      Refresh6: false,
      
      RefreshIdentityInfo: '',
      RefreshIdentityRaw: '',

      RefreshByYouMsgs: [],
      RefreshByYouNames: [],
      RefreshByYouThreads: [],

      RefreshToYouMsgs: [],
      RefreshToYouNames: [],
      RefreshToYouThreads: [],

      //ABOVE Refresh

//*** *** *** *** ***

ThreadMessageId:'',
messageToWhomName:'',

      mostRecentLogin:false, // Need this for Initial to Display if True

      mostRecentIdentity: '',
      mostRecentName: '',

      LocalForageKeys: [],
      skipSynchronizationBeforeHeight: 900000, 
      //mostRecentBlockHeight: 855000, //Remove no longer any platfrom login

      DataContractDGM:'G2JM3r2AW1JB9oHapQVDqE2siRyATMLAxXi2KGiKXxBB',
      DataContractDPNS: "GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec",

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

  showAddrConfirmModal = (inputAddr, inputNumber) => {
    this.setState(
      {
        sendSuccess: false,
        sendFailure: false,
        amountToSend: Number((inputNumber * 100000000).toFixed(0)),
        sendToAddress: inputAddr,
        sendToName: '',
        presentModal: "ConfirmAddrPaymentModal",
        isModalShowing: true,
      },
      () => {
        console.log(this.state.sendToAddress);
        console.log(this.state.amountToSend);
      }
    );
  }

  showConfirmModal = (inputName, inputNumber, dgmAddressDoc, message) => {
    this.setState(
      {
        sendSuccess: false,
        sendFailure: false,
        sendToName: inputName,
        amountToSend: Number((inputNumber * 100000000).toFixed(0)), //Number(inputNumber).toFixed(3),<- Old way // put in sats!! -> DONE
        sendToAddress: dgmAddressDoc.address,
        sendToDGMAddressDoc: dgmAddressDoc,
        messageToSend: message,
        presentModal: "ConfirmPaymentModal",
        isModalShowing: true,
      }//,() => {
       // console.log(this.state.sendToName);
       // console.log(this.state.amountToSend);
       // console.log(this.state.messageToSend);
     // }
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

  handleSuccessAlert = () => {
    this.setState({
      sendSuccess: false,
    });
  }

  handleFailureAlert = () => {
    this.setState({
      sendFailure: false,
    });
  }

  handleThread = (msgDocId, toName) => {
    if (!this.state.isLoadingRefresh) {
      this.setState(
        {
          ThreadMessageId: msgDocId,
          messageToWhomName: toName,
        },
        () => this.showModal("ThreadModal")
      );
    }
  };

  handleLogout = () => { 
    this.setState(
      {
        isLoggedIn: false,
      isLoading: true, 

      isLoadingWallet: true,
      isLoadingButtons: true,
      isLoadingForm: false,

      isLoadingRefresh: false, 

      isLoadingMsgs: true,

      presentModal: "",
      isModalShowing: false,

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
      messageToSend:'',
      sendToDGMAddressDoc:'',

      sendSuccess: false,
      sendFailure: false,
      nameSuccess: "",
      amtSuccess: 0,

      Login1: false,
      Login2: false,
      Login3: false,
      Login4: false,
      Login5: false,
      Login6: false,
      Login7: false,

      ByYouMsgs: [],
      ByYouNames: [],
      ByYouThreads: [],

      ToYouMsgs: [],
      ToYouNames: [],
      ToYouThreads: [],

      Initial1: false,
      Initial2: false,
      Initial3: false,
      Initial4: false,
      Initial5: false,
      Initial6: false,

      InitialDGMAddr: '',
      InitialIdentityInfo: '',
      InitialIdentityRaw: '',

      InitialByYouMsgs: [],
      InitialByYouNames: [],
      InitialByYouThreads: [],

      InitialToYouMsgs: [],
      InitialToYouNames: [],
      InitialToYouThreads: [],

      Refresh1: false,
      Refresh2: false,
      Refresh3: false,
      Refresh4: false,
      Refresh5: false,
      Refresh6: false,
      
      RefreshIdentityInfo: '',
      RefreshIdentityRaw: '',

      RefreshByYouMsgs: [],
      RefreshByYouNames: [],
      RefreshByYouThreads: [],

      RefreshToYouMsgs: [],
      RefreshToYouNames: [],
      RefreshToYouThreads: [],


ThreadMessageId:'',
messageToWhomName:'',

      mostRecentLogin:false, 

      mostRecentIdentity: '',
      mostRecentName: '',

      LocalForageKeys: [],
      skipSynchronizationBeforeHeight: 900000, 

      expandedTopNav: false,
      },
      () => this.componentDidMount()
    ); 
  };

  updateCreditsAfterTopUp = (identInfo) => {
    this.setState({
      identityInfo: identInfo,
      isLoadingRefresh:false,
      isLoadingButtons: false,
      isLoadingWallet: false,
      isLoadingForm: false,
      accountBalance: this.state.accountBalance - 1000000,
    });
  };

  triggerTopUpEndLoadingsAfterFail = () => {
    this.setState({
      isLoadingRefresh:false,
      isLoadingButtons: false,
      isLoadingWallet: false,
      isLoadingForm: false,
    });
  };

  triggerTopUpLoading = () => {
    this.setState({
      isLoadingRefresh:true,
      isLoadingButtons: true,
      isLoadingWallet: true,
      isLoadingForm: true,
    });
  };

  componentDidMount() {


    //I don't need any of this because the wallet login handles it itself..

    // LocalForage.config({
    //   name: "dashevo-wallet-lib", 
    // });

    // let dashevo = LocalForage.createInstance({
    //   name: "dashevo-wallet-lib",
    // });

    // dashevo.keys()
    //   .then((keys) => {
    //     this.setState({
    //       LocalForageKeys: keys,
    //     });
    //     console.log(keys);
    //   })
    //   .catch(function (err) {
    //     console.log(err);
    //   });

  //****************************** */   
  
  //2) GET WALLETID KEYS FOR OBTAINING IDENTITY <- nope no more platform login
  // I only need the most recent -> do it -> DONE

  LocalForage.config({
    name: "dashmoney-platform-login",
  });

  LocalForage.getItem("mostRecentLogin")
    .then((val) => {
      if (val !== null) {
        //this.handleStartQuerySeq(val.identity); //NO -> Only call when sure!!!!
        this.handleInitialLogin(val.identity);

        this.setState({
          
          mostRecentIdentity: val.identity,
          mostRecentName: val.name,
        });
      } else {
        //console.log("There is no mostRecentLogin");
      }
    })
    .catch(function (err) {
      console.log(err);
    });

//****************************** */ 
    //3) GET MOST RECENT BLOCK HEIGHT FOR NEW WALLET LOGIN

    // const clientOpts = {
    //   network: this.state.whichNetwork,
    // };

    // const client = new Dash.Client(clientOpts);

    // const getMostRecentBlockHeight = async () => {
    //   const status = await client.getDAPIClient().core.getStatus();

    //   return status;
    // };

    // getMostRecentBlockHeight()
    //   .then((d) => {
    //     let blockHeight = d.chain.blocksCount;
    //     console.log("Most Recent Block Height:\n", blockHeight);
    //     this.setState({
    //       mostRecentBlockHeight: blockHeight - 2500,
    //     });
    //   })
    //   .catch((e) => {
    //     console.error("Something went wrong:\n", e);
    //   })
    //   .finally(() => client.disconnect());
  }

  handleInitialLogin = (theIdentity) => {
    this.getInitialByYou(theIdentity);
    this.getInitialToYou(theIdentity);

    this.getInitialIdentityInfo(theIdentity);
    this.getInitialDGMAddress(theIdentity);
    
  }

//THIS SHOULD TRIGGER THE LOGIN PROCESS
handleWalletConnection = (theMnemonic) => {

  this.getWalletAndIdentitywithMnem(theMnemonic);

  this.setState({
    mnemonic: theMnemonic,
    isLoggedIn: true,
  });
};
  
  handleFormClearThenRefresh = () => {

   // document.getElementById("Pay-to-Name-form").reset(); //if the form is not in the dom then breaks everything and its not in the dom when the tab is on the msgs -> 

    //https://stackoverflow.com/questions/43922508/clear-and-reset-form-input-fields

    this.handleLoginforPostPaymentWallet(); 
  };

  handleLoginforPostPaymentWallet = () => {

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

    const retrieveWallet = async () => {
      const account = await client.getWalletAccount();

      console.log(account.getTotalBalance());
      console.log(account);

      this.setState({
        accountBalance: account.getTotalBalance(),
        //accountAddress: account.getUnusedAddress().address, 
        accountHistory: account.getTransactionHistory(),
      });

      return account;
    };

    retrieveWallet()
      .then((d) => {
        //console.log("Wallet Account:\n", d);
        this.setState({
          isLoadingWallet: false,
          isLoadingButtons: false,
          isLoadingRefresh:false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong getting Wallet:\n", e);
        this.setState({
          isLoadingWallet: false,
          isLoadingButtons: false,
          isLoadingRefresh:false,
        });
      })
      .finally(() => client.disconnect());
  };

  getWalletAndIdentitywithMnem = (theMnemonic) => {
    const client = new Dash.Client({
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: theMnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight: this.state.skipSynchronizationBeforeHeight,
        },
      },
    });

    const retrieveIdentityIds = async () => {
      const account = await client.getWalletAccount();

      //console.log(account.getTotalBalance());
      //console.log(account);
      // console.log(account.getUnusedAddress().address);
      //console.log(account.getTransactionHistory());

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
      //  console.log("Mnemonic identities:\n", d);
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
        console.error("Something went wrong getWalletAndIdentitywithMnem:\n", e);
        this.setState({
          identity: "No Identity",
        });
      })
      .finally(() => client.disconnect());

  };

  conductFullLogin = (theIdentity) => { //Finish Login with Most Recent OR call all the queries for the 

    if(theIdentity === this.state.mostRecentIdentity){

      this.setState({
        mostRecentLogin:true,
        identity:this.state.mostRecentIdentity,
        uniqueName:this.state.mostRecentName,
      },()=>
      this.handleMostRecentLogin(theIdentity));
      
    }else{
      this.handleLoginQueries(theIdentity);
      
    }
  };

  // ADDED BELOW As the other half of most recent login catch
  //maybe move the identity info so that it is also in initial -> 
  handleMostRecentLogin = (theIdentity) => {
    
    if (this.state.Initial1 &&
          this.state.Initial2 &&
            this.state.Initial3 &&
              this.state.Initial4 &&
                this.state.Initial5 &&
                  this.state.Initial6) {
        this.setState({
          ByYouMsgs: this.state.InitialByYouMsgs,
          ByYouNames: this.state.InitialByYouNames,
          ByYouThreads: this.state.InitialByYouThreads,

          ToYouMsgs: this.state.InitialToYouMsgs,
          ToYouNames: this.state.InitialToYouNames,
          ToYouThreads: this.state.InitialToYouThreads,

          dgmDocuments: this.state.InitialDGMAddr,
          identityInfo: this.state.InitialIdentityInfo,
          identityRaw: this.state.InitialIdentityRaw,

          isLoadingWallet: false,
          isLoadingMsgs: false,
          isLoading: false,
          isLoadingButtons: false,
      });      
    }
  } 

  handleLoginQueries = (theIdentity) => {
    this.getByYou(theIdentity);
    this.getToYou(theIdentity);
    this.getIdentityInfo(theIdentity);
    this.queryDGMDocument(theIdentity);
    this.getNamefromIdentity(theIdentity);
   
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
            Login5: true,
          },
          () => this.checkLoginRace());
      })
      .catch((e) => {
        console.error("Something went wrong in retrieving the identity:\n", e);
        this.setState({
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

//Exchange this one

//CREATE AN OBJECT AND PUT IT IN THERE!!!
let lfObject = {
  identity: theIdentity,
  name: nameRetrieved.label,
};

LocalForage.setItem("mostRecentLogin", lfObject)
  .then((d) => {
    
    //console.log("Return from LF setitem:", d);
  })
  .catch((err) => {
    console.error(
      "Something went wrong setting to localForage:\n",
      err
    );
  });

        this.setState({
          uniqueName: nameRetrieved.label,
          Login6: true,
        },
        () => this.checkLoginRace());
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        console.log("There is no dashUniqueIdentityId to retrieve.");
        this.setState({
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
          contractId: this.state.DataContractDGM,
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
          console.log("address:\n", n.toJSON());
          docArray = [...docArray, n.toJSON()];
        }

        this.setState(
          {
            dgmDocuments: docArray,
            Login7: true,
          },
          () => this.checkLoginRace());
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
              
        });
      })
      .finally(() => client.disconnect());
  };


 checkLoginRace = () => {
    
  if (this.state.Login1 &&
        this.state.Login2 &&
          this.state.Login3 &&
            this.state.Login4 &&
              this.state.Login5 &&
                this.state.Login6 &&
                  this.state.Login7) {
      
      this.setState({

        isLoadingWallet: false,
        isLoadingMsgs: false,
        isLoading: false,
        isLoadingButtons: false,
    });
    
  }
};

getByYou = (theIdentity) => {
  //Add the thread call
  //console.log("Calling getByYou");

  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM, // Your contract ID
      },
    },
  };
  const client = new Dash.Client(clientOpts);


  const getDocuments = async () => {
    return client.platform.documents.get("DGMContract.dgmmsg", {
      limit: 60,
      where: [
        ["$ownerId", "==", theIdentity],
        ['$createdAt', '<=' , Date.now()]
    ],
    orderBy: [
    ['$createdAt', 'desc'],
  ],
    });
  };

  getDocuments()
    .then((d) => {
      if (d.length === 0) {
        //console.log("There are no ForyouByyouMsgs");

        this.setState(
          {
            Login1: true,
            Login2: true,
          },
          () => this.checkLoginRace()
        );
      } else {
        let docArray = [];
        //console.log("Getting ForyouByyouMsgs");
        for(const n of d) {
          let returnedDoc = n.toJSON()
           //console.log("Msg:\n", returnedDoc);
           returnedDoc.toId = Identifier.from(returnedDoc.toId, 'base64').toJSON();
           //console.log("newMsg:\n", returnedDoc);
          docArray = [...docArray, returnedDoc];
        }
        this.getByYouNames(docArray);
        this.getByYouThreads(docArray);
      }
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());
};

getByYouNames = (docArray) => {
  //Need to get the ToId not the ownerId -> 
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DPNS: {
        contractId: this.state.DataContractDPNS,
      },
    },
  };
  const client = new Dash.Client(clientOpts);
  //START OF NAME RETRIEVAL - ToId not the ownerId!!!

  let ownerarrayOfToIds = docArray.map((doc) => {
    return doc.toId;
  });

  let setOfToIds = [...new Set(ownerarrayOfToIds)];

  let arrayOfToIds = [...setOfToIds];

  arrayOfToIds = arrayOfToIds.map((item) =>
    Buffer.from(Identifier.from(item))
  );

  //console.log("Calling getByYouNames");

  const getNameDocuments = async () => {
    return client.platform.documents.get("DPNS.domain", {
      where: [["records.dashUniqueIdentityId", "in", arrayOfToIds]],
      orderBy: [["records.dashUniqueIdentityId", "asc"]],
    });
  };

  getNameDocuments()
    .then((d) => {
      //WHAT IF THERE ARE NO NAMES? -> THEN THIS WON'T BE CALLED
      if (d.length === 0) {
        //console.log("No DPNS domain documents retrieved.");
      }

      let nameDocArray = [];

      for (const n of d) {
        //console.log("NameDoc:\n", n.toJSON());

        nameDocArray = [n.toJSON(), ...nameDocArray];
      }
      //console.log(`DPNS Name Docs: ${nameDocArray}`);

      this.setState(
        {
          ByYouNames: nameDocArray,
          ByYouMsgs: docArray,
          Login1: true,
        },
        () => this.checkLoginRace()
      );
    })
    .catch((e) => {
      console.error("Something went wrong getting ByYou Names:\n", e);
    }).finally(() => client.disconnect());
  //END OF NAME RETRIEVAL
}; //Need to get the ToId not the ownerId -> 

    getByYouThreads = (docArray) => {
      //CHANGE from everyone to foryou ->
      const clientOpts = {
        network: this.state.whichNetwork,
        apps: {
          DGMContract: {
            contractId: this.state.DataContractDGM,
          },
        },
      };
      const client = new Dash.Client(clientOpts);

      // This Below is to get unique set of ByYou msg doc ids
      let arrayOfMsgIds = docArray.map((doc) => {
        return doc.$id;
      });

      //console.log("Array of ByYouThreads ids", arrayOfMsgIds);

      let setOfMsgIds = [...new Set(arrayOfMsgIds)];

      arrayOfMsgIds = [...setOfMsgIds];

      //console.log("Array of order ids", arrayOfMsgIds);

      const getDocuments = async () => {
        //console.log("Called Get ByYou Threads");

        return client.platform.documents.get("DGMContract.dgmthr", {
          where: [["msgId", "in", arrayOfMsgIds]], // check msgId ->
          orderBy: [["msgId", "asc"]],
        });
      };

      getDocuments()
        .then((d) => {
          let docArray = [];
          //THERE ISN'T NECESSARY MESSAGE TO GRAB SO COULD BE ZERO SO STILL NEED TO END LOADING ->

          for(const n of d) {
            let returnedDoc = n.toJSON()
             //console.log("Thr:\n", returnedDoc);
             returnedDoc.msgId = Identifier.from(returnedDoc.msgId, 'base64').toJSON();
             //console.log("newThr:\n", returnedDoc);
            docArray = [...docArray, returnedDoc];
          }

          if (docArray.length === 0) {
            this.setState(
              {
                Login2: true,
              },
              () => this.checkLoginRace()
            );
          } else {
            //this.getByYouThreadsNames(docArray); //Name Retrieval
            this.setState(
                      {
                        ByYouThreads: docArray,
                        Login2: true,
                      },
                      () => this.checkLoginRace())
          }
        })
        .catch((e) => {
          console.error("Something went wrong ByYouThreads:\n", e);
          this.setState({
            ByYouThreadsError: true, //handle error ->
          });
        })
        .finally(() => client.disconnect());
    };


getToYou = (theIdentity) => {

  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  const getDocuments = async () => {
    console.log("Called getToYou");


    return client.platform.documents.get("DGMContract.dgmmsg", {
      where: [["toId", "==", theIdentity],
      ['$createdAt', '<=' , Date.now()]
    ],
    orderBy: [
    ['$createdAt', 'desc'],
  ],
  });
  };

  getDocuments()
    .then((d) => {
      if (d.length === 0) {
        //console.log("There are no ForyouByyouMsgs");

        this.setState(
          {
            Login3: true,
            Login4: true,
          },
          () => this.checkLoginRace()
        );
      } else {
        let docArray = [];
        //console.log("Getting getToYou");
        for(const n of d) {
          let returnedDoc = n.toJSON()
           //console.log("ToYou Msg:\n", returnedDoc);
           returnedDoc.toId = Identifier.from(returnedDoc.toId, 'base64').toJSON();
           //console.log("newMsg:\n", returnedDoc);
          docArray = [...docArray, returnedDoc];
        }
        this.getToYouNames(docArray);
        this.getToYouThreads(docArray);
      }
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());

  
};

getToYouNames = (docArray) => {
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DPNS: {
        contractId: this.state.DataContractDPNS,
      },
    },
  };
  const client = new Dash.Client(clientOpts);
  //START OF NAME RETRIEVAL

  let ownerarrayOfOwnerIds = docArray.map((doc) => {
    return doc.$ownerId;
  });

  let setOfOwnerIds = [...new Set(ownerarrayOfOwnerIds)];

  let arrayOfOwnerIds = [...setOfOwnerIds];


  //console.log("Calling getToYouNames");

  const getNameDocuments = async () => {
    return client.platform.documents.get("DPNS.domain", {
      where: [["records.dashUniqueIdentityId", "in", arrayOfOwnerIds]],
      orderBy: [["records.dashUniqueIdentityId", "asc"]],
    });
  };

  getNameDocuments()
    .then((d) => {
      //WHAT IF THERE ARE NO NAMES? -> THEN THIS WON'T BE CALLED
      if (d.length === 0) {
        //console.log("No DPNS domain documents retrieved.");
      }

      let nameDocArray = [];

      for (const n of d) {
        //console.log("NameDoc:\n", n.toJSON());

        nameDocArray = [n.toJSON(), ...nameDocArray];
      }
      //console.log(`DPNS Name Docs: ${nameDocArray}`);

      this.setState(
        {
          ToYouNames: nameDocArray,
          ToYouMsgs: docArray,
          Login3: true,
        },
        () => this.checkLoginRace()
      );
    })
    .catch((e) => {
      console.error("Something went wrong getting ByYou Names:\n", e);
    }).finally(() => client.disconnect());
  //END OF NAME RETRIEVAL
}; 

getToYouThreads = (docArray) => {
  //CHANGE from everyone to foryou ->
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  // This Below is to get unique set of ByYou msg doc ids
  let arrayOfMsgIds = docArray.map((doc) => {
    return doc.$id;
  });

  //console.log("Array of ByYouThreads ids", arrayOfMsgIds);

  let setOfMsgIds = [...new Set(arrayOfMsgIds)];

  arrayOfMsgIds = [...setOfMsgIds];

  //console.log("Array of order ids", arrayOfMsgIds);

  const getDocuments = async () => {
    //console.log("Called Get ByYou Threads");

    return client.platform.documents.get("DGMContract.dgmthr", {
      where: [["msgId", "in", arrayOfMsgIds]], // check msgId ->
      orderBy: [["msgId", "asc"]],
    });
  };

  getDocuments()
    .then((d) => {
      let docArray = [];
      //THERE ISN'T NECESSARY MESSAGE TO GRAB SO COULD BE ZERO SO STILL NEED TO END LOADING ->

      for(const n of d) {
        let returnedDoc = n.toJSON()
         //console.log("Thr:\n", returnedDoc);
         returnedDoc.msgId = Identifier.from(returnedDoc.msgId, 'base64').toJSON();
         //console.log("newThr:\n", returnedDoc);
        docArray = [...docArray, returnedDoc];
      }

      if (docArray.length === 0) {
        this.setState(
          {
            Login4: true,
          },
          () => this.checkLoginRace()
        );
      } else {
        this.setState(
          {
            ToYouThreads: docArray,
            Login4: true,
          },
          () => this.checkLoginRace())

      }
    })
    .catch((e) => {
      console.error("Something went wrong ToYouThreads:\n", e);
      this.setState({
        ByYouThreadsError: true, //handle error ->
      });
    })
    .finally(() => client.disconnect());
};


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//CREATING DOCUMENTS AND MAKING PAYMENTS

  RegisterDGMAddress = () => {
    console.log("Called Register DGM Address");
    this.setState({
      isLoadingWallet: true,
      isLoadingButtons: true,
      isLoadingRefresh:true,
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
          contractId: this.state.DataContractDGM,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const submitNoteDocument = async () => {
      const { platform } = client;

     let identity = "";
      if (this.state.identityRaw !== "") {
        identity = this.state.identityRaw;
      } else {
        identity = await platform.identities.get(this.state.identity);
      } // Your identity ID

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
      await platform.documents.broadcast(documentBatch, identity);
      return dgmDocument
      
    };

    submitNoteDocument()
      .then((d) => {
        let returnedDoc = d.toJSON();
        console.log("Document:\n", returnedDoc);

        this.setState({
          dgmDocuments: [returnedDoc],
          isLoadingWallet: false,
          isLoadingButtons: false,
          isLoadingRefresh:false,
        });
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
          isLoadingWallet: false,
          isLoadingButtons: false,
          isLoadingRefresh:false,
        });
      })
      .finally(() => client.disconnect());
  };

  //FROM: https://dashpay.github.io/platform/Wallet-library/account/createTransaction/

  sendDashtoAddress = () => {
    this.setState({
      isLoadingRefresh: true,
      isLoadingButtons: true,
      isLoadingWallet: true,
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

      let dashAmt = this.state.amountToSend;
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
            isLoadingRefresh:false,
            isLoadingWallet: false,
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
          isLoadingRefresh:false,
          isLoadingWallet: false,
          isLoadingButtons: false,
          isLoadingForm: false,
          sendFailure: true,
        });
      })
      //.finally(() => client.disconnect()); // <- Caused Error -> YES error dont use
  };

  sendDashtoName = () => {
    this.setState({
      isLoadingRefresh:true,
      isLoadingButtons: true,
      isLoadingWallet: true,
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

      let dashAmt = this.state.amountToSend;
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
            // isLoadingWallet: false,
            // isLoadingButtons: false,
            // isLoadingForm: false,
            sendSuccess: true,
          },
          () => this.handlePostPayment(d)
        ); 
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          isLoadingRefresh:false,
          isLoadingWallet: false,
          isLoadingButtons: false,
          isLoadingForm: false,
          sendFailure: true,
        });
      })
      //.finally(() => client.disconnect()); // <- Caused Error in the past, added back seems to fix more recent payment error. -> YES error dont use
      
  };

  handlePostPayment = (txId) => {
    if(this.state.messageToSend === ''){
      this.setState({

        
    isLoadingForm: false,

      },()=>this.handleFormClearThenRefresh());
   
    }else{
    this.submitDGMMessage(txId); //But I also need to maintain the isLoading State??? -> 
    }
  }


  submitDGMMessage = (theTXId) => {

    console.log("Called Submit DGM MSG Doc");

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
          contractId: this.state.DataContractDGM,
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    let docProperties = {};

    const submitDocument = async () => {
      const { platform } = client;
      // const identity = await platform.identities.get(this.state.identity); // Your identity ID

      let identity = "";
      if (this.state.identityRaw !== "") {
        identity = this.state.identityRaw;
      } else {
        identity = await platform.identities.get(this.state.identity);
      } // Your identity ID


  docProperties = {
    msg: this.state.messageToSend,
    toId: this.state.sendToDGMAddressDoc.$ownerId,
    txId: theTXId
  };

  // Create the note document
  const dgmDocument = await platform.documents.create(
    "DGMContract.dgmmsg",
    identity,
    docProperties
  );

  //console.log(dsoDocument.toJSON());

  //############################################################
  //This below disconnects the document sending..***

  // return dgmDocument;

  //This is to disconnect the Document Creation***

  //############################################################

  const documentBatch = {
    create: [dgmDocument], // Document(s) to create
  };
 
  await platform.documents.broadcast(documentBatch, identity);
  return dgmDocument;
};

submitDocument()
  .then((d) => {
    
    let returnedDoc = d.toJSON();
    console.log("Msg Document:\n", returnedDoc);
    
    let newMsg;

// required:['toId','txId',"$createdAt", "$updatedAt"], 

      newMsg = {
        $ownerId: returnedDoc.$ownerId,
        $id: returnedDoc.$id,
        toId: this.state.sendToDGMAddressDoc.$ownerId,
        txId: theTXId,
        msg: this.state.messageToSend,
        $createdAt: returnedDoc.$createdAt,
      };

    this.setState({
      ByYouMsgs: [newMsg, ...this.state.ByYouMsgs],
      isLoadingForm: false,

    },()=>this.handleFormClearThenRefresh());
  })
  .catch((e) => {
    this.setState({
      errorToDisplay: true,
      isLoadingRefresh:false,
      isLoadingWallet: false,
      isLoadingButtons: false,
      isLoadingForm: false,
    });

    console.error("Something went wrong creating new msg:\n", e);
  })
  .finally(() => client.disconnect());

  //THIS BELOW IS THE NAME DOC ADD, SO PROCESSES DURING DOC SUBMISSION ***

  //NOT ME BUT WHO I AM SENDING TO!! <- Fixed!

  let nameDoc = {
    $ownerId: this.state.sendToDGMAddressDoc.$ownerId,
    label: this.state.sendToName,
  };

  this.setState({
    ByYouNames: [nameDoc, ...this.state.ByYouNames],
  });
  //END OF NAME DOC ADD***

}; 
 
submitDGMThread = (addedMessage) => {
    
    this.setState({
       isLoadingRefresh:true,
      isLoadingWallet: true,
      isLoadingButtons: true,
      isLoadingForm: true,
    });

    //console.log(addedMessage);
    const clientOpts = {
      network: this.state.whichNetwork,
      wallet: {
        mnemonic: this.state.mnemonic,
        adapter: LocalForage.createInstance, 
        unsafeOptions: {
          skipSynchronizationBeforeHeight:  this.state.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        DGMContract: {
          contractId: this.state.DataContractDGM, // Your contract ID
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    let docProperties = {};

    const submitDocuments = async () => {
      const { platform } = client;

      let identity = "";
      if (this.state.identityRaw !== "") {
        identity = this.state.identityRaw;
      } else {
        identity = await platform.identities.get(this.state.identity);
      } // Your identity ID

      docProperties = {
        msg: addedMessage,
        msgId: this.state.ThreadMessageId,
      };

      // Create the note document
      const dgmDocument = await platform.documents.create(
        "DGMContract.dgmthr",
        identity,
        docProperties
      );

      //console.log(dsoDocument.toJSON());

      //############################################################
      //This below disconnects the document sending..***

      // return dgmDocument;

      //This is to disconnect the Document Creation***

      //############################################################

      const documentBatch = {
        create: [dgmDocument], // Document(s) to create
      };
      
      await platform.documents.broadcast(documentBatch, identity);
      return dgmDocument;
    };

    submitDocuments()
      .then((d) => {
        
        let returnedDoc = d.toJSON();
        console.log("Thread Documents:\n", returnedDoc);
        
        let newThread;

// required: [' 'msg','msgId', "$createdAt", "$updatedAt"],

          newThread = {
            $ownerId: returnedDoc.$ownerId,
            $id: returnedDoc.$id,
            msgId: this.state.ThreadMessageId,
            msg: addedMessage,
            $createdAt: returnedDoc.$createdAt,
          };
        
        this.setState({
          ByYouThreads: [newThread, ...this.state.ByYouThreads],

          isLoadingRefresh: false,
      isLoadingWallet: false,
      isLoadingButtons: false,
      isLoadingForm: false,
        });
      })
      .catch((e) => {
        this.setState({
          errorToDisplay: true,
          isLoadingRefresh: false,
      isLoadingWallet: false,
      isLoadingButtons: false,
      isLoadingForm: false,
        });

        console.error("Something went wrong creating new thread:\n", e);
      })
      .finally(() => client.disconnect());

  }; 


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

 checkInitialRace = () => {
    
  if (this.state.Initial1 &&
        this.state.Initial2 &&
          this.state.Initial3 &&
            this.state.Initial4 &&
              this.state.Initial5 &&
                this.state.Initial6) {
    if(this.state.mostRecentLogin){
      
      this.setState({
        ByYouMsgs: this.state.InitialByYouMsgs,
        ByYouNames: this.state.InitialByYouNames,
        ByYouThreads: this.state.InitialByYouThreads,
  
        ToYouMsgs: this.state.InitialToYouMsgs,
        ToYouNames: this.state.InitialToYouNames,
        ToYouThreads: this.state.InitialToYouThreads,

        dgmDocuments: this.state.InitialDGMAddr,
        identityInfo: this.state.InitialIdentityInfo,
        identityRaw: this.state.InitialIdentityRaw,

        isLoadingWallet: false,
        isLoadingMsgs: false,
        isLoading: false,
        isLoadingButtons: false,
    });
    }
    
  }
};

getInitialIdentityInfo = (theIdentity) => {
  console.log("Called get Initial Identity Info");

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
          InitialIdentityInfo: idInfo,
          InitialIdentityRaw: d,
          Initial5: true,
        },
        () => this.checkInitialRace());
    })
    .catch((e) => {
      console.error("Something went wrong in getInitialIdentityInfo:\n", e);
      this.setState({
        identityInfo: "Load Failure", 
      });
    })
    .finally(() => client.disconnect());
}

getInitialDGMAddress = (theIdentity) => {
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  const getDocuments = async () => {
    console.log("Called Initial DGM Documents.");

    return client.platform.documents.get("DGMContract.dgmaddress", {
      where: [["$ownerId", "==", theIdentity]],
    });
  };

  getDocuments()
    .then((d) => {
      let docArray = [];
      for (const n of d) {
        //console.log("Addr:\n", n.toJSON());
        docArray = [...docArray, n.toJSON()];
      }

      this.setState(
        {
          InitialDGMAddr: docArray,
          Initial6:true,
        },
        () => this.checkInitialRace());
    })
    .catch((e) => {
      console.error("Something went wrong InitialDGMAddress:\n", e);
        
    })
    .finally(() => client.disconnect());
}

getInitialByYou = (theIdentity) => {
  //Add the thread call
  //console.log("Calling getInitialByYou");

  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM, // Your contract ID
      },
    },
  };
  const client = new Dash.Client(clientOpts);


  const getDocuments = async () => {
    return client.platform.documents.get("DGMContract.dgmmsg", {
      limit: 60,
      where: [
        ["$ownerId", "==", theIdentity],
        ['$createdAt', '<=' , Date.now()]
    ],
    orderBy: [
    ['$createdAt', 'desc'],
  ],
    });
  };

  getDocuments()
    .then((d) => {
      if (d.length === 0) {
        //console.log("There are no ForyouByyouMsgs");

        this.setState(
          {
            Initial1: true,
            Initial2: true,
          },
          () => this.checkInitialRace()
        );
      } else {
        let docArray = [];
        //console.log("Getting ForyouByyouMsgs");
        for(const n of d) {

          let returnedDoc = n.toJSON()
           //console.log("Msg:\n", returnedDoc);
           
           returnedDoc.toId = Identifier.from(returnedDoc.toId, 'base64').toJSON();
           //console.log("newMsg:\n", returnedDoc);
          docArray = [...docArray, returnedDoc];
        }

        this.getInitialByYouNames(docArray);
        this.getInitialByYouThreads(docArray);
      }
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());
}; 

getInitialByYouNames = (docArray) => {
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DPNS: {
        contractId: this.state.DataContractDPNS,
      },
    },
  };
  const client = new Dash.Client(clientOpts);
  //START OF NAME RETRIEVAL - ToId not the ownerId!!!

  let ownerarrayOfToIds = docArray.map((doc) => {
    return doc.toId;
  });

  let setOfToIds = [...new Set(ownerarrayOfToIds)];

  let arrayOfToIds = [...setOfToIds];

  //console.log("Calling getByYouNames");

  const getNameDocuments = async () => {
    return client.platform.documents.get("DPNS.domain", {
      where: [["records.dashUniqueIdentityId", "in", arrayOfToIds]],
      orderBy: [["records.dashUniqueIdentityId", "asc"]],
    });
  };

  getNameDocuments()
    .then((d) => {
      //WHAT IF THERE ARE NO NAMES? -> THEN THIS WON'T BE CALLED
      if (d.length === 0) {
        //console.log("No DPNS domain documents retrieved.");
      }

      let nameDocArray = [];

      for (const n of d) {
        //console.log("NameDoc:\n", n.toJSON());

        nameDocArray = [n.toJSON(), ...nameDocArray];
      }
      //console.log(`DPNS Name Docs: ${nameDocArray}`);

      this.setState(
        {
          InitialByYouNames: nameDocArray,
          InitialByYouMsgs: docArray,
          Initial1: true,
        },
        () => this.checkInitialRace()
      );
    })
    .catch((e) => {
      console.error("Something went wrong getting InitialByYou Names:\n", e);
    }).finally(() => client.disconnect());
  //END OF NAME RETRIEVAL
}; 

//how to do the names bc the names should only come from the msgs so there shouldnt be any new ones and then it is your name and others. I dont think I need the thread names and also need to make sure that only msgs from you or the receipient/sender are possible to show. -> 

    getInitialByYouThreads = (docArray) => {
      //CHANGE from everyone to foryou ->
      const clientOpts = {
        network: this.state.whichNetwork,
        apps: {
          DGMContract: {
            contractId: this.state.DataContractDGM,
          },
        },
      };
      const client = new Dash.Client(clientOpts);

      // This Below is to get unique set of ByYou msg doc ids
      let arrayOfMsgIds = docArray.map((doc) => {
        return doc.$id;
      });

      //console.log("Array of ByYouThreads ids", arrayOfMsgIds);

      let setOfMsgIds = [...new Set(arrayOfMsgIds)];

      arrayOfMsgIds = [...setOfMsgIds];

      //console.log("Array of order ids", arrayOfMsgIds);

      const getDocuments = async () => {
        //console.log("Called Get InitialByYou Threads");

        return client.platform.documents.get("DGMContract.dgmthr", {
          where: [["msgId", "in", arrayOfMsgIds]], // check msgId ->
          orderBy: [["msgId", "asc"]],
        });
      };

      getDocuments()
        .then((d) => {
          let docArray = [];
          
          for(const n of d) {
            let returnedDoc = n.toJSON()
             //console.log("Thr:\n", returnedDoc);
             returnedDoc.msgId = Identifier.from(returnedDoc.msgId, 'base64').toJSON();
             //console.log("newThr:\n", returnedDoc);
            docArray = [...docArray, returnedDoc];
          }

          if (docArray.length === 0) {
            this.setState(
              {
                Initial2: true,
              },
              () => this.checkInitialRace()
            );
          } else {
            //this.getInitialByYouThreadsNames(docArray); //Name Retrieval
            this.setState(
                      {
                        InitialByYouThreads: docArray,
                        Initial2: true,
                      },
                      () => this.checkInitialRace())
          }
        })
        .catch((e) => {
          console.error("Something went wrong InitialByYouThreads:\n", e);
          this.setState({
            InitialByYouThreadsError: true, //handle error ->
          });
        })
        .finally(() => client.disconnect());
    };


getInitialToYou = (theIdentity) => {

  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  const getDocuments = async () => {
    console.log("Called getInitialToYou");


    return client.platform.documents.get("DGMContract.dgmmsg", {
      where: [["toId", "==", theIdentity],
      ['$createdAt', '<=' , Date.now()]
    ],
    orderBy: [
    ['$createdAt', 'desc'],
  ],
  });
  };

  getDocuments()
    .then((d) => {
      if (d.length === 0) {
        //console.log("There are no ForyouByyouMsgs");

        this.setState(
          {
            Initial3: true,
            Initial4: true,
          },
          () => this.checkInitialRace()
        );
      } else {
        let docArray = [];
        //console.log("Getting getInitialToYou");

        for(const n of d) {
          let returnedDoc = n.toJSON()
           //console.log("Msg:\n", returnedDoc);
           returnedDoc.toId = Identifier.from(returnedDoc.toId, 'base64').toJSON();
           //console.log("newMsg:\n", returnedDoc);
          docArray = [...docArray, returnedDoc];
        }

        this.getInitialToYouNames(docArray);
        this.getInitialToYouThreads(docArray);
      }
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());

  
};

getInitialToYouNames = (docArray) => {
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DPNS: {
        contractId: this.state.DataContractDPNS,
      },
    },
  };
  const client = new Dash.Client(clientOpts);
  //START OF NAME RETRIEVAL

  let ownerarrayOfOwnerIds = docArray.map((doc) => {
    return doc.$ownerId;
  });

  let setOfOwnerIds = [...new Set(ownerarrayOfOwnerIds)];

  let arrayOfOwnerIds = [...setOfOwnerIds];

  //console.log("Calling getInitialToYouNames");

  const getNameDocuments = async () => {
    return client.platform.documents.get("DPNS.domain", {
      where: [["records.dashUniqueIdentityId", "in", arrayOfOwnerIds]],
      orderBy: [["records.dashUniqueIdentityId", "asc"]],
    });
  };

  getNameDocuments()
    .then((d) => {
      //WHAT IF THERE ARE NO NAMES? -> THEN THIS WON'T BE CALLED
      if (d.length === 0) {
        //console.log("No DPNS domain documents retrieved.");
      }

      let nameDocArray = [];

      for (const n of d) {
      //  console.log("INIT TOYOU NameDoc:\n", n.toJSON());

        nameDocArray = [n.toJSON(), ...nameDocArray];
      }
      //console.log(`DPNS Name Docs: ${nameDocArray}`);

      this.setState(
        {
          InitialToYouNames: nameDocArray,
          InitialToYouMsgs: docArray,
          Initial3: true,
        },
        () => this.checkInitialRace()
      );
    })
    .catch((e) => {
      console.error("Something went wrong getting InitialByYou Names:\n", e);
    }).finally(() => client.disconnect());
  //END OF NAME RETRIEVAL
}; 

getInitialToYouThreads = (docArray) => {
  //CHANGE from everyone to foryou ->
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  // This Below is to get unique set of ByYou msg doc ids
  let arrayOfMsgIds = docArray.map((doc) => {
    return doc.$id;
  });

  //console.log("Array of ByYouThreads ids", arrayOfMsgIds);

  let setOfMsgIds = [...new Set(arrayOfMsgIds)];

  arrayOfMsgIds = [...setOfMsgIds];

  //console.log("Array of order ids", arrayOfMsgIds);

  const getDocuments = async () => {
    //console.log("Called Get InitialByYou Threads");

    return client.platform.documents.get("DGMContract.dgmthr", {
      where: [["msgId", "in", arrayOfMsgIds]], // check msgId ->
      orderBy: [["msgId", "asc"]],
    });
  };

  getDocuments()
    .then((d) => {
      let docArray = [];
      //THERE ISN'T NECESSARY MESSAGE TO GRAB SO COULD BE ZERO SO STILL NEED TO END LOADING ->

      for(const n of d) {
        let returnedDoc = n.toJSON()
         //console.log("Thr:\n", returnedDoc);
         returnedDoc.msgId = Identifier.from(returnedDoc.msgId, 'base64').toJSON();
        docArray = [...docArray, returnedDoc];
      }

      if (docArray.length === 0) {
        this.setState(
          {
            Initial4: true,
          },
          () => this.checkInitialRace()
        );
      } else {
        this.setState(
          {
            InitialToYouThreads: docArray,
            Initial4: true,
          },
          () => this.checkInitialRace())

      }
    })
    .catch((e) => {
      console.error("Something went wrong InitialToYouThreads:\n", e);
      this.setState({
        InitialByYouThreadsError: true, //handle error ->
      });
    })
    .finally(() => client.disconnect());
};

//aND WILL THERE BE A WAY TO UPDATE?? OR Refresh!! -> yes

//Where is the trigger -> 
handleRefreshWallet = () => {
  this.setState({
    isLoadingWallet: true,
    isLoadingRefresh: true,
        isLoadingButtons: true,
        sendSuccess: false,
        sendFailure:false,
  });
  this.getRefreshByYou(this.state.identity);
    this.getRefreshToYou(this.state.identity);
    this.getRefreshIdentityInfo(this.state.identity);
    this.getRefreshWallet();
}

checkRefreshRace = () => {
    
  if (this.state.Refresh1 &&
        this.state.Refresh2 &&
          this.state.Refresh3 &&
            this.state.Refresh4 &&
              this.state.Refresh5 &&
                this.state.Refresh6 ) {
   
      
      this.setState({
        ByYouMsgs: this.state.RefreshByYouMsgs,
        ByYouNames: this.state.RefreshByYouNames,
        ByYouThreads: this.state.RefreshByYouThreads,
  
        ToYouMsgs: this.state.RefreshToYouMsgs,
        ToYouNames: this.state.RefreshToYouNames,
        ToYouThreads: this.state.RefreshToYouThreads,

        identityInfo: this.state.RefreshIdentityInfo,
        identityRaw: this.state.RefreshIdentityRaw,

        isLoadingWallet: false,
        isLoadingRefresh: false,
        isLoadingButtons: false,

        Refresh1: false,
        Refresh2: false,
        Refresh3: false,
        Refresh4: false,
        Refresh5: false,
        Refresh6: false,
    });
    
  }
};

getRefreshWallet = () => {
  const client = new Dash.Client({
    network: this.state.whichNetwork,
    wallet: {
      mnemonic: this.state.mnemonic,
      adapter: LocalForage.createInstance,
      unsafeOptions: {
        skipSynchronizationBeforeHeight: this.state.skipSynchronizationBeforeHeight,
      },
    },
  });

  const retrieveWallet = async () => {
    const account = await client.getWalletAccount();

      this.setState({
        accountBalance: account.getTotalBalance(),
        //accountAddress: account.getUnusedAddress().address, 
        accountHistory: account.getTransactionHistory(),
      });

      return account;
  };

  retrieveWallet()
    .then((d) => {
    //console.log("Wallet Account:\n", d);
    
        this.setState(
          {
            Refresh6: true,
          },
          () => this.checkRefreshRace());
      
    })
    .catch((e) => {
      console.error("Something went wrong getRefreshWallet:\n", e);
    })
    .finally(() => client.disconnect());

};

getRefreshIdentityInfo = (theIdentity) => {
  console.log("Called get Refresh Identity Info");

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
          RefreshIdentityInfo: idInfo,
          RefreshIdentityRaw: d,
          Refresh5: true,
        },
        () => this.checkRefreshRace());
    })
    .catch((e) => {
      console.error("Something went wrong in getRefreshIdentityInfo:\n", e);
    })
    .finally(() => client.disconnect());
}

getRefreshByYou = (theIdentity) => {
  //Add the thread call
  //console.log("Calling getRefreshByYou");

  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM, // Your contract ID
      },
    },
  };
  const client = new Dash.Client(clientOpts);


  const getDocuments = async () => {
    return client.platform.documents.get("DGMContract.dgmmsg", {
      limit: 60,
      where: [
        ["$ownerId", "==", theIdentity],
        ['$createdAt', '<=' , Date.now()]
    ],
    orderBy: [
    ['$createdAt', 'desc'],
  ],
    });
  };

  getDocuments()
    .then((d) => {
      if (d.length === 0) {
        //console.log("There are no ForyouByyouMsgs");

        this.setState(
          {
            Refresh1: true,
            Refresh2: true,
          },
          () => this.checkRefreshRace()
        );
      } else {
        let docArray = [];
        //console.log("Getting ForyouByyouMsgs");
        for(const n of d) {
          let returnedDoc = n.toJSON()
           //console.log("Msg:\n", returnedDoc);
           returnedDoc.toId = Identifier.from(returnedDoc.toId, 'base64').toJSON();
           //console.log("newMsg:\n", returnedDoc);
          docArray = [...docArray, returnedDoc];
        }
        this.getRefreshByYouNames(docArray);
        this.getRefreshByYouThreads(docArray);
      }
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());
}; 

getRefreshByYouNames = (docArray) => {
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DPNS: {
        contractId: this.state.DataContractDPNS,
      },
    },
  };
  const client = new Dash.Client(clientOpts);
  //START OF NAME RETRIEVAL - ToId not the ownerId!!!

  let ownerarrayOfToIds = docArray.map((doc) => {
    return doc.toId;
  });

  let setOfToIds = [...new Set(ownerarrayOfToIds)];

  let arrayOfToIds = [...setOfToIds];

  //console.log("Calling getRefreshByYouNames");

  const getNameDocuments = async () => {
    return client.platform.documents.get("DPNS.domain", {
      where: [["records.dashUniqueIdentityId", "in", arrayOfToIds]],
      orderBy: [["records.dashUniqueIdentityId", "asc"]],
    });
  };

  getNameDocuments()
    .then((d) => {
      //WHAT IF THERE ARE NO NAMES? -> THEN THIS WON'T BE CALLED
      if (d.length === 0) {
        //console.log("No DPNS domain documents retrieved.");
      }

      let nameDocArray = [];

      for (const n of d) {
        //console.log("NameDoc:\n", n.toJSON());

        nameDocArray = [n.toJSON(), ...nameDocArray];
      }
      //console.log(`DPNS Name Docs: ${nameDocArray}`);

      this.setState(
        {
          RefreshByYouNames: nameDocArray,
          RefreshByYouMsgs: docArray,
          Refresh1: true,
        },
        () => this.checkRefreshRace()
      );
    })
    .catch((e) => {
      console.error("Something went wrong getting RefreshByYou Names:\n", e);
    }).finally(() => client.disconnect());
  //END OF NAME RETRIEVAL
}; 

    getRefreshByYouThreads = (docArray) => {
      //CHANGE from everyone to foryou ->
      const clientOpts = {
        network: this.state.whichNetwork,
        apps: {
          DGMContract: {
            contractId: this.state.DataContractDGM,
          },
        },
      };
      const client = new Dash.Client(clientOpts);

      // This Below is to get unique set of ByYou msg doc ids
      let arrayOfMsgIds = docArray.map((doc) => {
        return doc.$id;
      });

      //console.log("Array of ByYouThreads ids", arrayOfMsgIds);

      let setOfMsgIds = [...new Set(arrayOfMsgIds)];

      arrayOfMsgIds = [...setOfMsgIds];

      //console.log("Array of order ids", arrayOfMsgIds);

      const getDocuments = async () => {
        //console.log("Called Get RefreshByYou Threads");

        return client.platform.documents.get("DGMContract.dgmthr", {
          where: [["msgId", "in", arrayOfMsgIds]], // check msgId ->
          orderBy: [["msgId", "asc"]],
        });
      };

      getDocuments()
        .then((d) => {
          let docArray = [];

          for(const n of d) {
            let returnedDoc = n.toJSON()
             //console.log("Thr:\n", returnedDoc);
             returnedDoc.msgId = Identifier.from(returnedDoc.msgId, 'base64').toJSON();
             //console.log("newThr:\n", returnedDoc);
            docArray = [...docArray, returnedDoc];
          }

          if (docArray.length === 0) {
            this.setState(
              {
                Refresh2: true,
              },
              () => this.checkRefreshRace()
            );
          } else {
            //this.getRefreshByYouThreadsNames(docArray); //Name Retrieval
            this.setState(
                      {
                        RefreshByYouThreads: docArray,
                        Refresh2: true,
                      },
                      () => this.checkRefreshRace())
          }
        })
        .catch((e) => {
          console.error("Something went wrong RefreshByYouThreads:\n", e);
          this.setState({
            RefreshByYouThreadsError: true, //handle error ->
          });
        })
        .finally(() => client.disconnect());
    };


getRefreshToYou = (theIdentity) => {

  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  const getDocuments = async () => {
    console.log("Called getRefreshToYou");


    return client.platform.documents.get("DGMContract.dgmmsg", {
      where: [["toId", "==", theIdentity],
      ['$createdAt', '<=' , Date.now()]
    ],
    orderBy: [
    ['$createdAt', 'desc'],
  ],
  });
  };

  getDocuments()
    .then((d) => {
      if (d.length === 0) {
        //console.log("There are no ForyouByyouMsgs");

        this.setState(
          {
            Refresh3: true,
            Refresh4: true,
          },
          () => this.checkRefreshRace()
        );
      } else {
        let docArray = [];
        //console.log("Getting getRefreshToYou");
        for(const n of d) {
          let returnedDoc = n.toJSON()
           //console.log("Msg:\n", returnedDoc);
           returnedDoc.toId = Identifier.from(returnedDoc.toId, 'base64').toJSON();
           //console.log("newMsg:\n", returnedDoc);
          docArray = [...docArray, returnedDoc];
        }
        this.getRefreshToYouNames(docArray);
        this.getRefreshToYouThreads(docArray);
      }
    })
    .catch((e) => console.error("Something went wrong:\n", e))
    .finally(() => client.disconnect());
};

getRefreshToYouNames = (docArray) => {
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DPNS: {
        contractId: this.state.DataContractDPNS,
      },
    },
  };
  const client = new Dash.Client(clientOpts);
  //START OF NAME RETRIEVAL

  let ownerarrayOfOwnerIds = docArray.map((doc) => {
    return doc.$ownerId;
  });

  let setOfOwnerIds = [...new Set(ownerarrayOfOwnerIds)];

  let arrayOfOwnerIds = [...setOfOwnerIds];

  //console.log("Calling getRefreshToYouNames");

  const getNameDocuments = async () => {
    return client.platform.documents.get("DPNS.domain", {
      where: [["records.dashUniqueIdentityId", "in", arrayOfOwnerIds]],
      orderBy: [["records.dashUniqueIdentityId", "asc"]],
    });
  };

  getNameDocuments()
    .then((d) => {
      //WHAT IF THERE ARE NO NAMES? -> THEN THIS WON'T BE CALLED
      if (d.length === 0) {
        //console.log("No DPNS domain documents retrieved.");
      }

      let nameDocArray = [];

      for (const n of d) {
      //  console.log("INIT TOYOU NameDoc:\n", n.toJSON());

        nameDocArray = [n.toJSON(), ...nameDocArray];
      }
      //console.log(`DPNS Name Docs: ${nameDocArray}`);

      this.setState(
        {
          RefreshToYouNames: nameDocArray,
          RefreshToYouMsgs: docArray,
          Refresh3: true,
        },
        () => this.checkRefreshRace()
      );
    })
    .catch((e) => {
      console.error("Something went wrong getting RefreshByYou Names:\n", e);
    }).finally(() => client.disconnect());
  //END OF NAME RETRIEVAL
}; 

getRefreshToYouThreads = (docArray) => {
  //CHANGE from everyone to foryou ->
  const clientOpts = {
    network: this.state.whichNetwork,
    apps: {
      DGMContract: {
        contractId: this.state.DataContractDGM,
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  // This Below is to get unique set of ByYou msg doc ids
  let arrayOfMsgIds = docArray.map((doc) => {
    return doc.$id;
  });

  //console.log("Array of ByYouThreads ids", arrayOfMsgIds);

  let setOfMsgIds = [...new Set(arrayOfMsgIds)];

  arrayOfMsgIds = [...setOfMsgIds];

  //console.log("Array of order ids", arrayOfMsgIds);

  const getDocuments = async () => {
    //console.log("Called Get RefreshByYou Threads");

    return client.platform.documents.get("DGMContract.dgmthr", {
      where: [["msgId", "in", arrayOfMsgIds]], // check msgId ->
      orderBy: [["msgId", "asc"]],
    });
  };

  getDocuments()
    .then((d) => {
      let docArray = [];
      
      for(const n of d) {
        let returnedDoc = n.toJSON()
         //console.log("Thr:\n", returnedDoc);
         returnedDoc.msgId = Identifier.from(returnedDoc.msgId, 'base64').toJSON();
         //console.log("newThr:\n", returnedDoc);
        docArray = [...docArray, returnedDoc];
      }

      if (docArray.length === 0) {
        this.setState(
          {
            Refresh4: true,
          },
          () => this.checkRefreshRace()
        );
      } else {
        this.setState(
          {
            RefreshToYouThreads: docArray,
            Refresh4: true,
          },
          () => this.checkRefreshRace())

      }
    })
    .catch((e) => {
      console.error("Something went wrong RefreshToYouThreads:\n", e);
      this.setState({
        RefreshByYouThreadsError: true, //handle error ->
      });
    })
    .finally(() => client.disconnect());
};



  //*** *** *** *** *** *** *** ***

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
            <LandingPage mode={this.state.mode}/>
            <LoginBottomNav mode={this.state.mode} showModal={this.showModal} />
            <Footer />
          </>
        ) : (
          <>
            <ConnectedWalletPage

            //CONFIRMPAYMENTMODAL
            messageToSend={this.state.messageToSend}
            sendDashtoName={this.sendDashtoName}
            isModalShowing={this.state.isModalShowing}
            presentModal={this.state.presentModal}
            hideModal={this.hideModal}
            collapseTopNav={this.collapseTopNav}
              

              sendFailure={this.state.sendFailure}
              sendSuccess={this.state.sendSuccess}
              handleFailureAlert={this.handleFailureAlert}
              handleSuccessAlert={this.handleSuccessAlert}

              amountToSend={this.state.amountToSend}
              sendToName={this.state.sendToName}
              sendToAddress={this.state.sendToAddress}
            
              mnemonic={this.state.mnemonic}
              whichNetwork={this.state.whichNetwork}
              skipSynchronizationBeforeHeight={
                this.state.skipSynchronizationBeforeHeight
              }
              dgmDocuments={this.state.dgmDocuments}

              isLoading={this.state.isLoading}

              isLoadingRefresh={this.state.isLoadingRefresh}
              isLoadingButtons={this.state.isLoadingButtons}
              isLoadingWallet={this.state.isLoadingWallet}
              isLoadingForm={this.state.isLoadingForm}

              mode={this.state.mode}

              accountBalance={this.state.accountBalance}
              accountHistory={this.state.accountHistory}
              accountAddress={this.state.accountAddress}

              identity={this.state.identity}
              identityInfo={this.state.identityInfo}
              uniqueName={this.state.uniqueName}

              showConfirmModal={this.showConfirmModal}
              showAddrConfirmModal={this.showAddrConfirmModal}
              handleThread={this.handleThread}

              ByYouMsgs={this.state.ByYouMsgs}
              ByYouNames={this.state.ByYouNames}
              ByYouThreads={this.state.ByYouThreads}

              ToYouMsgs={this.state.ToYouMsgs}
              ToYouNames={this.state.ToYouNames}
              ToYouThreads={this.state.ToYouThreads}

              isLoadingMsgs={this.state.isLoadingMsgs}

              DataContractDGM={this.state.DataContractDGM}
              DataContractDPNS={this.state.DataContractDPNS}
            />


            {!this.state.isLoading &&
            this.state.identity !== "No Identity" &&
            this.state.uniqueName !== "Er" &&
            this.state.accountBalance !== 0 ? (
              <BottomNav
                handleRefreshWallet={this.handleRefreshWallet}
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

        {/*  THIS IS MOVED TO CONNECTEDWALLETPAGE SO FORM DOES NOT FREEZE WHEN CONFIRMPAYMENTMODAL IS CLOSED/CANCELLED <- 
        
        {this.state.isModalShowing &&
        this.state.presentModal === "ConfirmPaymentModal" ? (
          <ConfirmPaymentModal
            sendToName={this.state.sendToName}
            amountToSend={this.state.amountToSend}
            messageToSend={this.state.messageToSend}
            sendDashtoName={this.sendDashtoName}
                  //handleCancelPaymentModal={this.handleCancelPaymentModal}

            isModalShowing={this.state.isModalShowing}
            hideModal={this.hideModal}
            mode={this.state.mode}
            collapseTopNav={this.collapseTopNav}
          />
        ) : (
          <></>
        )} */}

{this.state.isModalShowing &&
        this.state.presentModal === "ConfirmAddrPaymentModal" ? (
          <ConfirmAddrPaymentModal
            sendToAddress={this.state.sendToAddress}
            amountToSend={this.state.amountToSend}

            sendDashtoAddress={this.sendDashtoAddress}

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

{this.state.isModalShowing &&
        this.state.presentModal === "ThreadModal" ? (
          <ThreadModal
            whichNetwork={this.state.whichNetwork}
            uniqueName={this.state.uniqueName}

            submitDGMThread={this.submitDGMThread}

            messageToWhomName={this.state.messageToWhomName}

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
