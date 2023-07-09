import React from "react";
import LocalForage from "localforage";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

import "./ConnectedWalletPage.css";

const Dash = require("dash");

class ConnectedWalletPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nameFormat: false,
      numberQuantity: false,
      amountToSend: 0,
      sendToName: "",

      displayAddress: false,
      copiedAddress: false,

      identityIdReceipient: "",
      dgmDocumentsForReceipient: [],
      formEventTarget: "",
      isLoadingVerify: false,
      isError: false,
    };
  }

  handleDisplayAddress = () => {
    if (this.state.displayAddress === false)
      this.setState({
        displayAddress: true,
      });
    else {
      this.setState({
        displayAddress: false,
      });
    }
  };

  onChange = (event) => {
    // console.log(event.target.value);

    event.preventDefault();
    event.stopPropagation();

    this.setState({
      nameAvail: false,
      isLoadingVerify: false, 
      isError: false,
    });

    //console.log(`id = ${event.target.id}`);

    if (event.target.id === "validationCustomName") {
      this.nameValidate(event.target.value);
    }

    if (event.target.id === "validationCustomNumber") {
      this.numberValidate(event.target.value);
    }
  };

  nameValidate = (nameInput) => {
    let regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;
    let valid = regex.test(nameInput);

    if (valid) {
      this.setState({
        sendToName: nameInput,
        nameFormat: true,
      });
    } else {
      this.setState({
        sendToName: nameInput,
        nameFormat: false,
      });
    }
  };

  numberValidate = (numberInput) => {
    //console.log(this.props.accountBalance);

    let regex = /(^[0-9]+[.,]{0,1}[0-9]*$)|(^[.,][0-9]+$)/;
    let valid = regex.test(numberInput);

    let result = this.props.accountBalance - numberInput * 100000000;
    //console.log(result);

    if (result >= 0 && valid && numberInput > 0) {
      this.setState({
        amountToSend: numberInput,
        numberQuantity: true,
      });
    } else {
      this.setState({
        amountToSend: numberInput,
        numberQuantity: false,
      });
    }
  };
  //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
  //ADD THE FORM DISABLE FROM DGN <- Do it -> ..
  //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&777

  searchName = (nameToRetrieve) => {
    const client = new Dash.Client("testnet");

    const retrieveName = async () => {
      // Retrieve by full name (e.g., myname.dash)

      return client.platform.names.resolve(`${nameToRetrieve}.dash`);
    };

    retrieveName()
      .then((d) => {
        if (d === null) {
          console.log("No DPNS Document for this Name.");
          this.setState({
            identityIdReceipient: "No Name",
            isLoadingVerify: false,
          });
        } else {
          let nameDoc = d.toJSON();
          console.log("Name retrieved:\n", nameDoc.$ownerId);
          this.setState(
            {
              identityIdReceipient: nameDoc.$ownerId,
            },
            () => this.queryDGMDocument()
          );
        }
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          identityIdReceipient: "Error",
          isLoadingVerify: false,
        });
      })
      .finally(() => client.disconnect());
  };
  
  queryDGMDocument = () => {
    const clientOpts = {
      network: this.props.whichNetwork,
      wallet: {
        mnemonic: this.props.mnemonic,
        adapter: LocalForage.createInstance,
        unsafeOptions: {
          skipSynchronizationBeforeHeight:
            this.props.skipSynchronizationBeforeHeight,
        },
      },
      apps: {
        DGMContract: {
          contractId: 'DvFwMMxLRfPLp5bGK8D4CqaHME21iF7R9HnBnvf7Mk8g',
        },
      },
    };
    const client = new Dash.Client(clientOpts);

    const getDocuments = async () => {
      console.log("Querying Receipient's DGM Documents.");
      console.log(this.state.identityIdReceipient);

      return client.platform.documents.get("DGMContract.dgmaddress", {
        where: [["$ownerId", "==", this.state.identityIdReceipient]],
      });
    };

    getDocuments()
      .then((d) => {
        let docArray = [];
        for (const n of d) {
          console.log("Document:\n", n.toJSON());
          docArray = [...docArray, n.toJSON()];
        }

        if (docArray.length === 0) {
          this.setState({
            dgmDocumentsForReceipient: "No DGM Doc for Receipient.",
            isLoadingVerify: false,
          });
        } else {
          this.setState(
            {
              dgmDocumentsForReceipient: docArray,
              isLoadingVerify: false,
            },
            () =>
              this.props.showConfirmModal(
                this.state.sendToName,
                this.state.amountToSend,
                this.state.dgmDocumentsForReceipient[0].address
              )
          );
        }
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.setState({
          dgmDocuments: "Document Error",
          isLoadingVerify: false,
        });
      })
      .finally(() => client.disconnect());
  };


  handleVerifyClick = (event) => {
    event.preventDefault();
    this.setState({
      dgmDocumentsForReceipient: [],
      identityIdReceipient: "Verifying Name..", 
      isLoadingVerify: true,
      formEventTarget: event.target,
    });
    this.searchName(this.state.sendToName);
  };

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  render() {
    let dashAmt = this.props.accountBalance / 100000000;
    let dashAmt2Display = dashAmt.toFixed(3);


    return (
      <>
        <div id="bodytext">
          <h3>
            <Badge bg="primary">Your Connected Wallet</Badge>
          </h3>

{this.props.isLoadingConfirmation ? (
                <>
                  <p> </p>
                  <div id="spinner">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                  <p> </p>
                </>
              ) : (
                this.props.accountBalance === '' || this.props.accountBalance === 0 ?                
                <></>:<>
                  <div className="indentStuff">
                    <b>Dash Balance</b>
                    <h4>
                      <b>{dashAmt2Display}</b>
                    </h4>
                  </div>
                  <p></p>
                </>
              )}

{this.props.isLoading ? (
            <div id="spinner">
              <p></p>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <></>
          )}

          {!this.props.isLoading &&
          this.props.identity !== "No Identity" &&
          this.props.uniqueName !== "Er" &&
          this.props.dgmDocuments !== "Document Error" &&
          this.props.identityInfo !== "Load Failure" &&
          this.props.accountBalance !== 0 ? (
            <>
              <p> </p>

              {this.props.identityInfo !== "" ? (
                <div className="ms-2 me-auto">
                  <div className="id-line ">
                    <h5>
                      <Badge bg="primary">{this.props.uniqueName}</Badge>
                    </h5>
                    <p>
                      <Badge className="paddingBadge" bg="primary" pill>
                        {this.props.identityInfo.balance} Credits
                      </Badge>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="ms-2 me-auto">
                  <div className="id-line ">
                    <h5>
                      <Badge bg="primary">Identity</Badge>
                    </h5>
                    <p>
                      <Badge className="paddingBadge" bg="primary" pill>
                        Loading..
                      </Badge>
                    </p>
                  </div>
                </div>
              )}


              {this.props.dgmDocuments.length === 0 ? (
                <Alert variant="primary" dismissible>
                  <Alert.Heading>Not yet Enabled!</Alert.Heading>
                  Please <b>Enable Pay to Name</b> below to receive payments
                  to your name.
                </Alert>
              ) : (
                <></>
              )}

              {/* Below is the Pay to a Name Stuff */}
              {/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/}

              <Form
                id="Pay-to-Name-form"
                noValidate
                onSubmit={this.handleVerifyClick}
                onChange={this.onChange}
              >
                <Form.Group className="mb-3" controlId="validationCustomName">
                  <Form.Label>Send Dash to:</Form.Label>

                  {this.state.isLoadingVerify || this.props.isLoadingForm ? (
                    <Form.Control
                      type="text"
                      placeholder={this.state.sendToName}
                      readOnly
                    />
                  ) : (
                    <Form.Control
                      type="text"
                      placeholder="Enter name here..."
                      required
                      isInvalid={!this.state.nameFormat}
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="validationCustomNumber">
                  <Form.Label>Amount to Send (in Dash)</Form.Label>

                  {this.state.isLoadingVerify || this.props.isLoadingForm ? (
                    <Form.Control
                      type="number"
                      placeholder={this.state.amountToSend}
                      readOnly
                    />
                  ) : (
                    <Form.Control
                      type="number"
                      placeholder="0.01 For example.."
                      required
                    />
                  )}
                </Form.Group>

                {this.state.isLoadingVerify ? (
                  <>
                    <p> </p>
                    <div id="spinner">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                    <p> </p>
                  </>
                ) : (
                  <>
                    {this.state.nameFormat &&
                    this.state.numberQuantity &&
                    !this.props.isLoadingForm ? (
                      <>
                        <p> </p>
                        <Button variant="primary" type="submit">
                          Send Dash
                        </Button>
                      </>
                    ) : (
                      <Button disabled variant="primary" type="submit">
                        Send Dash
                      </Button>
                    )}
                  </>
                )}
              </Form>

              {/* MY SERIES OF ALERTS FOR ERRORS AND NO NAME AND NOT DGM DOC */}

              {this.state.isError ? (
                <Alert variant="warning" dismissible>
                  Testnet Platform is having difficulties...
                </Alert>
              ) : (
                <></>
              )}

              {this.state.identityIdReceipient === "No Name" ? (
                <>
                  <p></p>
                  <Alert variant="danger" dismissible>
                    <Alert.Heading>Alert!</Alert.Heading>
                    <p>
                      The name {this.state.sendToName} is not owned by anyone.
                    </p>
                    <p>
                      Or you may have run into a platform issue, please retry{" "}
                      <b>Verify Payment</b> to try again.
                    </p>
                  </Alert>
                </>
              ) : (
                <></>
              )}

              {this.state.identityIdReceipient === "Error" ? (
                <>
                  <p></p>
                  <Alert variant="danger" dismissible>
                    <Alert.Heading>Alert!</Alert.Heading>
                    <p>
                      You have run into a platform error. If everything seems
                      correct, please retry <b>Verify Payment</b> to try again.
                    </p>
                  </Alert>
                </>
              ) : (
                <></>
              )}

              {this.state.dgmDocumentsForReceipient ===
              "No DGM Doc for Receipient." ? (
                <>
                  <p></p>
                  <Alert variant="danger" dismissible>
                    <Alert.Heading>Alert!</Alert.Heading>
                    <p>
                      <b>{this.state.sendToName}</b> has not yet enabled {" "}
                      <b>Pay to Name</b> at <b>DashGetMoney</b>. Let them know
                      on <b>DashShoutOut</b>.
                    </p>
                    <p>
                      Or you may have run into a platform issue, please retry{" "}
                      <b>Send Dash</b> to try again.
                    </p>
                  </Alert>
                  <p></p>
                </>
              ) : (
                <></>
              )}

              {this.state.dgmDocumentsForReceipient === "Document Error" ? (
                <>
                  <p></p>
                  <Alert variant="danger" dismissible>
                    <Alert.Heading>Alert!</Alert.Heading>
                    <p>
                      You have run into a platform error. If everything seems
                      correct, please retry <b>Verify Payment</b> to try again.
                    </p>
                  </Alert>
                  <p></p>
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}

          
        </div>

        {/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/}


        <div>
          {!this.props.isLoading &&
          this.props.identity !== "No Identity" &&
          this.props.uniqueName !== "Er" &&
          this.props.dgmDocuments !== "Document Error" &&
          this.props.identityInfo !== "Load Failure" &&
          this.props.accountBalance === 0 ? (
            <div id="bodytext">
              <span>
                There appears to be insufficient funds in your wallet.
                <span> </span>
                <Button
                  variant="primary"
                  onClick={() => {
                    this.props.handleSkipSyncLookBackFurther();
                  }}
                >
                  <b>Check Again..</b>

                  <Badge bg="light" text="dark" pill>
                    Wallet
                  </Badge>
                </Button>
              </span>
              <p></p>
              <p>
                {" "}
                This happens on occassion, when you are sure there should be
                funds in your wallet, you just need to look farther back on the
                blockchain. It will just take a little extra time.
              </p>
              <p>
                {" "}
                Press Check Again to search farther back on the blockchain for
                your transactions.
              </p>
              <p></p>
            </div>
          ) : (
            <></>
          )}

          {!this.props.isLoading &&
          this.props.identity === "No Identity" &&
          this.props.accountBalance === 0 ? (
            <div id="bodytext">
              <p>
                There are insufficient funds in your wallet. Please use visit{" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://dashgetnames.com/"
                >
                  <b>DashGetNames.com</b>
                </a>{" "}
                to get funds for your wallet or send funds to the address below,
                and then try <b>Connect Wallet</b> again.
                <span> </span>
              </p>
              <p>
                Or you may have run into a platform issue, just reload page and
                try again.
              </p>
              <p></p>
            </div>
          ) : (
            <></>
          )}

          {!this.props.isLoading &&
          this.props.identity === "No Identity" &&
          this.props.accountBalance !== 0 ? (
            <div id="bodytext">
              <p>
                No Identity was found for this wallet. Please visit{" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://dashgetnames.com/"
                >
                  <b>DashGetNames.com</b>
                </a>{" "}
                and register an Identity and Name for your wallet, and then
                connect wallet again.
              </p>
              <p>If this action doesn't work, Testnet Platform may be down.</p>
            </div>
          ) : (
            <></>
          )}

          {!this.props.isLoading &&
          // this.props.identityInfo === "" &&
          this.props.uniqueName === "Er" ? (
            <div id="bodytext">
              <p>
                There is no Name for this Identity, please go to{" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://dashgetnames.com/"
                >
                  <b>DashGetNames.com</b>
                </a>{" "}
                and register an Name for your Identity.
              </p>
              <p>
                Or you may have run into a platform issue, just reload page and
                try again.
              </p>
            </div>
          ) : (
            <></>
          )}

          {!this.props.isLoading &&
          this.props.identityInfo === "Load Failure" ? (
            <div id="bodytext">
              <p>
                There was an error in loading the identity, you may have run
                into a platform issue, please reload the page and try again.
              </p>
            </div>
          ) : (
            <></>
          )}

          {!this.props.isLoading &&
          this.props.dgmDocuments === "Document Error" ? (
            <div id="bodytext">
              <p>
                There was an error in loading your DGM Data Contract Document,
                you may have run into a platform issue, please reload the page
                and try again.
              </p>
            </div>
          ) : (
            <></>
          )}
        </div>

      </>
    );
  }
}

export default ConnectedWalletPage;
