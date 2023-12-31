import React from "react";
import LocalForage from "localforage";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

import Nav from "react-bootstrap/Nav";

import PaymentsTab from "./PaymentsTab";
import PaymentAddrComponent from "../PaymentAddrComponent";

import ConfirmPaymentModal from "./ConfirmPaymentModal";


import "./ConnectedWalletPage.css";

const Dash = require("dash");

class ConnectedWalletPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      whichTab: "Your Wallet",

      isModalShowing: false,
      presentModal: "",

      nameFormat: false,
      numberQuantity: false,
      amountToSend: "", //changed from 0 for placeholder to appear
      sendToName: "",

      sendToAddr: "",
      addrFormat: false,

      messageToAdd: "",
      validMessage: true,
      tooLongMessageError: false,

      displayAddress: false,
      copiedAddress: false,

      identityIdReceipient: "",
      dgmDocumentsForReceipient: [],
      formEventTarget: "",
      isLoadingVerify: false,
      isError: false,
    };
  }

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

  handleTab = (eventKey) => {
    if (eventKey === "Payments")
      this.setState({
        whichTab: "Payments",
      });
    else {
      this.setState({
        whichTab: "Your Wallet",
      });
    }
  };

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

  handleClearModalPostPmtConfirm = () => {
    this.setState({
      nameFormat: false,
      numberQuantity: false,
      amountToSend: "", //changed from 0 for placeholder to appear
      sendToName: "",

      sendToAddr: "",
      addrFormat: false,

      messageToAdd: "",
      validMessage: true,
    })
  }

  onChange = (event) => {
    // console.log(event.target.value);

    event.preventDefault();
    event.stopPropagation();

    this.setState({
      nameAvail: false,
      isLoadingVerify: false,
      identityIdReceipient: "", //Test if this clears the error msg after failed send ->
      dgmDocumentsForReceipient: [],
      isError: false,
    });

    //console.log(`id = ${event.target.id}`);

    if (event.target.id === "validationCustomName") {
      this.nameAndAddrValidate(event.target.value);
    }

    if (event.target.id === "validationCustomNumber") {
      this.numberValidate(event.target.value);
    }

    if (event.target.id === "validationCustomMessage") {
      this.messageValidate(event.target.value);
    }
  };

  nameAndAddrValidate = (nameInput) => {
    let regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;
    let valid = regex.test(nameInput);

    //Separate name and address
    //starts with X (mainnet) or Y (Testnet) and is 34 characters in length

    let addrRegex = /^[Xy][\S]{33}$/;
    let validAddr = addrRegex.test(nameInput);

    if (valid) {
      if (validAddr) {
        this.setState({
          sendToAddr: nameInput,
          addrFormat: true,
          nameFormat: false,
        });
      } else {
        this.setState({
          sendToName: nameInput,
          nameFormat: true,
          addrFormat: false,
        });
      }
    } else {
      this.setState({
        sendToName: nameInput,
        nameFormat: false,
      });
    }
  };

  numberValidate = (numberInput) => {
    //console.log(this.props.accountBalance);

    //let regex = /(^[0-9]+[.,]{0,1}[0-9]*$)|(^[.,][0-9]+$)/;

    let regex = /(^[0-9]+[.,]{0,1}[0-9]{0,5}$)|(^[.,][0-9]{1,5}$)/;
    //CHANGED TO LIMIT TO minimum mDash possible

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

  messageValidate = (messageInput) => {
    let regex = /^.[\S\s]{0,250}$/;

    let valid = regex.test(messageInput);

    if (valid) {
      this.setState({
        messageToAdd: messageInput,
        validMessage: true,
        tooLongMessageError: false,
      });
    } else {
      if (messageInput.length > 250) {
        this.setState({
          messageToAdd: messageInput,
          validMessage: false,
          tooLongMessageError: true,
        });
      } else {
        this.setState({
          messageToAdd: messageInput,
          validMessage: false,
        });
      }
    }
  };

  //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
  
  //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&777

  searchName = (nameToRetrieve) => {
    const client = new Dash.Client(this.props.whichNetwork);

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
          contractId: this.props.DataContractDGM,
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

          this.props.showConfirmModal(
            this.state.sendToName,
            this.state.amountToSend,
            docArray[0],
            this.state.messageToAdd
          )

          this.setState(
            {
              dgmDocumentsForReceipient: docArray,
              isLoadingVerify: false,

               //Setting state to original so that form clears post pmt

               //Issue is if they cancel the payment modal it freezes the form <-
                //SO WHAT TO DO -> WHAT IF THAT MODAL WAS HERE -< AND NOT IN APPJS SO THEN CAN HANDLE HERE AND FUNCTIONS STILL OPERATE IN APP.JS AS NEEDED?i CAN PASS FROM aPP.JS TO CWP.JS TO MODAL? <- YES

            // nameFormat: false,
            // numberQuantity: false,
            // amountToSend: "", //changed from 0 for placeholder to appear
            // sendToName: "",

            // sendToAddr: "",
            // addrFormat: false,

            // messageToAdd: "",
            // validMessage: true,
            }
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

    if (this.state.nameFormat) {
      this.searchName(this.state.sendToName);
    } else if (this.state.addrFormat) {
      this.props.showAddrConfirmModal(
        //Create this function and modal ->
        this.state.sendToAddr,
        this.state.amountToSend
        // this.state.sendToName,
        // this.state.amountToSend,
        // this.state.dgmDocumentsForReceipient[0].address,
        // this.state.messageToAdd
      );
      this.setState({
        //No loading of name or DGM doc with Addr Payment
        isLoadingVerify: false,
      });
    }
  };

  handleDenomDisplay = (duffs) => {
    if (duffs >= 1000000) {
      return (
        <span style={{ color: "#008de4" }}>
          {(duffs / 100000000).toFixed(3)} Dash
        </span>
      );
    } else {
      return (
        <span style={{ color: "#008de4" }}>
          {(duffs / 100000).toFixed(2)} mDash
        </span>
      );
    }
  };

  handleDenomDisplayNoStyle = (duffs) => {
    if (duffs >= 1000000) {
      return <span>{(duffs / 100000000).toFixed(3)} Dash</span>;
    } else {
      return <span>{(duffs / 100000).toFixed(2)} mDash</span>;
    }
  };

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  render() {
    return (
      <>
        <Nav
          fill
          variant="pills"
          defaultActiveKey={this.state.whichTab}
          onSelect={(eventKey) => this.handleTab(eventKey)}
        >
          <Nav.Item>
            <Nav.Link eventKey="Your Wallet">
              <b>Your Wallet</b>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Payments">
              <b>Payments</b>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div id="sidetext">
          {/* <h3>
            <Badge bg="primary">Your Connected Wallet</Badge>
          </h3> */}

          {/* ********** LOADING SPINNERS ********** */}

          {/* SO I NEED TO HAVE DIFFERENT WALLET STUFF FOR YOUR WALLET VS PAYMENTS -> SO WILL HAVE TO MOVE AND DUPLICATE/SEPARATE THE BELOW WALLET STUFF */}

          {this.props.isLoadingWallet ? (
            <>
              {/* <p> </p>
              <div id="spinner">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
              <p> </p> */}
              <div className="paddingBadge">
                <b>Wallet Balance</b>

                <h4>Loading..</h4>
              </div>
            </>
          ) : (
            <>
              <div className="paddingBadge">
                <div className="cardTitle">
                  <div>
                    <b>Wallet Balance</b>
                    <h4>
                      <b>
                        {this.handleDenomDisplay(this.props.accountBalance)}
                      </b>
                    </h4>
                  </div>

                  {this.state.whichTab === "Payments" ? (
                    <Button
                      style={{ marginRight: "1rem" }}
                      variant="primary"
                      onClick={() => this.showModal("WalletTXModal")}
                    >
                      Wallet TXs
                    </Button>
                  ) : (
                    <></>
                  )}
                  
                </div>
              </div>

              {/* <div className="indentStuff">
                <b>Wallet Balance</b>
                <h4>
                  <b>{this.handleDenomDisplay(this.props.accountBalance)}</b>
                </h4>
              </div>
              <p></p> */}
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

          {/* **** ^^^^ LOADING SPINNERS ^^^^ **** */}

          {/* ********** FORMS AND INFO ********** */}

          {!this.props.isLoading &&
          this.props.identity !== "No Identity" &&
          this.props.uniqueName !== "Er" &&
          this.props.dgmDocuments !== "Document Error" &&
          this.props.identityInfo !== "Load Failure" &&
          this.props.accountBalance !== 0 ? (
            <>
              {this.props.identityInfo === "" ? (
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
              ) : (
                <></>
              )}

              {this.props.identityInfo !== "" &&
              this.props.identityInfo.balance > 450000000 ? (
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
                <></>
              )}

              {this.props.identityInfo !== "" &&
              this.props.identityInfo.balance <= 450000000 ? (
                <div
                  className="id-line"
                  onClick={() => this.props.showModal("TopUpIdentityModal")}
                >
                  <>
                    <h5>
                      <Badge className="paddingBadge" bg="danger">
                        Platform Credits : Low!
                      </Badge>
                    </h5>
                  </>
                  <>
                    <p></p>
                    <h5>
                      <Badge className="paddingBadge" bg="danger" pill>
                        {this.props.identityInfo.balance}
                      </Badge>
                    </h5>
                  </>
                </div>
              ) : (
                <></>
              )}

              {this.props.isLoadingRefresh ? (
                <div id="spinner">
                  <p></p>
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p></p>
                </div>
              ) : (
                <></>
              )}

              {this.props.dgmDocuments.length === 0 ? (
                <Alert variant="primary" dismissible>
                  <Alert.Heading>Pay to Name NOT Enabled!</Alert.Heading>
                  Please <b>Enable Pay to Name</b> below to receive payments to
                  your name.
                </Alert>
              ) : (
                <></>
              )}

              {this.state.whichTab === "Payments" ? (
                <>
                  {this.props.sendSuccess ? (
                    <>
                      <p></p>
                      <Alert variant="success" onClose={()=> this.props.handleSuccessAlert()} dismissible>
                        <Alert.Heading>Payment Successful!</Alert.Heading>
                        You have successfully sent{" "}
                        <b>
                          {this.handleDenomDisplayNoStyle(
                            this.props.amountToSend
                          )}
                        </b>{" "}
                        to{" "}
                        <b>
                          {this.props.sendToName !== ""
                            ? this.props.sendToName
                            : this.props.sendToAddress}
                          !
                        </b>
                      </Alert>
                    </>
                  ) : (
                    <></>
                  )}

                  {this.props.sendFailure ? (
                    <>
                      <p></p>
                      <Alert variant="danger" onClose={()=> this.props.handleFailureAlert()} dismissible>
                        <Alert.Heading>Payment Failed</Alert.Heading>
                        <p>
                          You have run into a platform error or a repeated
                          transaction error. If everything seems correct, please
                          retry <b>Verify Payment</b> to try again.
                        </p>
                      </Alert>
                    </>
                  ) : (
                    <></>
                  )}

                  {this.props.isLoadingMsgs ? (
                    <div id="spinner">
                      <p></p>
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <>
                      <PaymentsTab
                        mode={this.props.mode}
                        identity={this.props.identity}
                        uniqueName={this.props.uniqueName}
                        hideModal={this.hideModal}
                        isModalShowing={this.state.isModalShowing}
                        presentModal={this.state.presentModal}
                        accountHistory={this.props.accountHistory}
                        accountBalance={this.props.accountBalance}

                        handleThread={this.props.handleThread}

                        ByYouMsgs={this.props.ByYouMsgs}
                        ByYouNames={this.props.ByYouNames}
                        ByYouThreads={this.props.ByYouThreads}
                        ToYouMsgs={this.props.ToYouMsgs}
                        ToYouNames={this.props.ToYouNames}
                        ToYouThreads={this.props.ToYouThreads}

                        //isLoadingMsgs={this.props.isLoadingMsgs}
                      />
                    </>
                  )}
                </>
              ) : (
                <></>
              )}

              {this.state.whichTab === "Your Wallet" ? (
                <>
                  {/* Below is the Pay to a Name Stuff */}
                  {/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/}

                  <Form
                    id="Pay-to-Name-form"
                    noValidate
                    onSubmit={this.handleVerifyClick}
                    onChange={this.onChange}
                  >
                    <Form.Group
                      className="mb-3"
                      controlId="validationCustomName"
                    >
                      {!this.state.addrFormat && !this.state.nameFormat ? (
                        <Form.Label>Send Dash to:</Form.Label>
                      ) : (
                        <></>
                      )}
                      {!this.state.addrFormat && this.state.nameFormat ? (
                        <Form.Label>Send Dash to Name:</Form.Label>
                      ) : (
                        <></>
                      )}
                      {this.state.addrFormat && !this.state.nameFormat ? (
                        <Form.Label>Send Dash to Address:</Form.Label>
                      ) : (
                        <></>
                      )}

                      {/* <Form.Label>Send Dash to:</Form.Label> */}

                      {this.state.isLoadingVerify ||
                      this.props.isLoadingForm ? (
                        <Form.Control
                          type="text"
                          placeholder={this.state.sendToName}
                          readOnly
                        />
                      ) : (
                        <Form.Control
                          type="text"
                          placeholder="Enter name or address here..."
                          defaultValue={this.state.sendToName}
                          required
                          isValid={
                            this.state.nameFormat || this.state.addrFormat
                          }
                        />
                      )}
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="validationCustomNumber"
                    >
                      <Form.Label>Amount to Send (in Dash)</Form.Label>

                      {this.state.isLoadingVerify ||
                      this.props.isLoadingForm ? (
                        <Form.Control
                          type="number"
                          placeholder={this.state.amountToSend}
                          readOnly
                        />
                      ) : (
                        <Form.Control
                          type="number"
                          placeholder="0.01 for example.."
                          defaultValue={this.state.amountToSend}
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
                        {(this.state.nameFormat || this.state.addrFormat) &&
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

                    {/* Add the message form input here */}
                    {!this.state.addrFormat &&
                    this.state.numberQuantity &&
                    this.state.nameFormat ? (
                      <>
                        <p></p>
                        <Form.Group
                          className="mb-3"
                          controlId="validationCustomMessage"
                        >
                          <Form.Label>
                            <b>Payment Message</b>
                          </Form.Label>

                          {this.state.isLoadingVerify ||
                          this.props.isLoadingForm ? (
                            <Form.Control
                              onChange={this.onChange}
                              as="textarea"
                              rows={2}
                              placeholder={this.state.messageToAdd}
                              readOnly
                            />
                          ) : (
                            <Form.Control
                              onChange={this.onChange}
                              as="textarea"
                              rows={2}
                              placeholder="(Optional) Enter message here..."
                              defaultValue={this.state.messageToAdd}
                              required
                              isInvalid={this.state.tooLongMessageError}
                              //isValid={this.state.validMessage}
                            />
                          )}

                          {/* <Form.Control
                                    onChange={this.onChange}
                                    as="textarea"
                                    rows={2}
                                    placeholder="(Optional) Enter message here..."
                                    defaultValue={this.state.messageToAdd}
                                    required
                                    isInvalid={this.state.tooLongMessageError}
                                    //isValid={this.state.validMessage}
                                  /> */}

                          {this.state.tooLongError ? (
                            <Form.Control.Feedback
                              className="floatLeft"
                              type="invalid"
                            >
                              Sorry, this is too long! Please use less than 250
                              characters.
                            </Form.Control.Feedback>
                          ) : (
                            <></>
                          )}
                        </Form.Group>
                      </>
                    ) : (
                      <></>
                    )}
                  </Form>

                  {/* **** ^^^^ FORMS AND INFO ^^^^ **** */}

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
                          The name {this.state.sendToName} is not owned by
                          anyone.
                        </p>
                        <p>
                          Or you may have run into a platform issue, please
                          retry <b>Verify Payment</b> to try again.
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
                          You have run into a platform error. If everything
                          seems correct, please retry <b>Verify Payment</b> to
                          try again.
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
                          <b>{this.state.sendToName}</b> has not yet enabled{" "}
                          <b>Pay to Name</b> at <b>DashGetMoney</b>. Let them
                          know on <b>DashShoutOut</b>.
                        </p>
                        <p>
                          Or you may have run into a platform issue, please
                          retry <b>Send Dash</b> to try again.
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
                          You have run into a platform error. If everything
                          seems correct, please retry <b>Verify Payment</b> to
                          try again.
                        </p>
                      </Alert>
                      <p></p>
                    </>
                  ) : (
                    <></>
                  )}

                  {this.props.sendSuccess ? (
                    <>
                      <p></p>
                      <Alert variant="success" onClose={()=> this.props.handleSuccessAlert()} dismissible>
                        <Alert.Heading>Payment Successful!</Alert.Heading>
                        You have successfully sent{" "}
                        <b>
                          {this.handleDenomDisplayNoStyle(
                            this.props.amountToSend
                          )}
                        </b>{" "}
                        to{" "}
                        <b>
                          {this.props.sendToName !== ""
                            ? this.props.sendToName
                            : this.props.sendToAddress}
                          !
                        </b>
                      </Alert>
                    </>
                  ) : (
                    <></>
                  )}

                  {this.props.sendFailure ? (
                    <>
                      <p></p>
                      <Alert variant="danger" onClose={()=> this.props.handleFailureAlert()} dismissible>
                        <Alert.Heading>Payment Failed</Alert.Heading>
                        <p>
                          You have run into a platform error or a repeated
                          transaction error. If everything seems correct, please
                          retry <b>Verify Payment</b> to try again.
                        </p>
                      </Alert>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </div>

        {!this.props.isLoading && this.state.whichTab === "Your Wallet" ? (
          <>
            {/* <TxHistoryComponent
                  mode={this.state.mode}
                  accountHistory={this.state.accountHistory}
                  accountBalance={this.state.accountBalance}
                /> */}
            <div style={{ marginLeft: "1rem" }}>
              <PaymentAddrComponent
                mode={this.props.mode}
                accountAddress={this.props.accountAddress}
              />
            </div>
          </>
        ) : (
          <></>
        )}

        {/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/}

        <div>
          {/*  Remove this bc no longer implementing the handleSkipSync LookBackFurther bc it only causes issues with the wallet adapter
          
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
          )} */}

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


{this.props.isModalShowing &&
        this.props.presentModal === "ConfirmPaymentModal" ? (
          <ConfirmPaymentModal
            sendToName={this.props.sendToName}
            amountToSend={this.props.amountToSend}
            messageToSend={this.props.messageToSend}
            sendDashtoName={this.props.sendDashtoName}
            handleClearModalPostPmtConfirm={this.handleClearModalPostPmtConfirm}

            isModalShowing={this.props.isModalShowing}
            hideModal={this.props.hideModal}
            mode={this.props.mode}
            collapseTopNav={this.props.collapseTopNav}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default ConnectedWalletPage;
