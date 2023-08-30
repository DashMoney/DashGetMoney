import React from "react";
import LocalForage from "localforage";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import CloseButton from "react-bootstrap/CloseButton";

const Dash = require("dash");

class TopUpIdentityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  handleCloseClick = () => {
    this.props.hideModal();
  };

  handleTopUp = () => {
    this.doTopUpIdentity(1000000); //this is where I set the top up amount***
    this.props.triggerTopUpLoading();
  };

  doTopUpIdentity = (numOfCredits) => {
    this.setState({
      isLoading: true,
    });
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
    };
    const client = new Dash.Client(clientOpts);

    const topupIdentity = async () => {
      const identityId = this.props.identity; // Your identity ID
      const topUpAmount = numOfCredits; // Number of duffs ie 1000

      await client.platform.identities.topUp(identityId, topUpAmount);
      return client.platform.identities.get(identityId);
    };

    topupIdentity()
      .then((d) => {
        console.log("Identity credit balance: ", d.balance);
        this.props.updateCreditsAfterTopUp(d.toJSON());
        this.props.hideModal();
        
      })
      .catch((e) => {
        console.error("Something went wrong:\n", e);
        this.props.triggerTopUpEndLoadingsAfterFail();
        this.setState({
          isLoading: false,
        });
      })
      .finally(() => client.disconnect());
  };

  render() {
    let modalBkg = "";
    let closeButtonColor;
    let modalBackdrop;
    
    if(this.props.mode === "primary"){
      modalBackdrop = "modal-backdrop-nochange";
      modalBkg = "modal-backcolor-primary";
      closeButtonColor = <CloseButton onClick={this.handleCloseClick}/>
    }else{
      modalBackdrop = "modal-backdrop-dark";
      modalBkg = "modal-backcolor-dark";
      closeButtonColor = <CloseButton onClick={this.handleCloseClick} variant="white"/>
    }

    return (
      <Modal show={this.props.isModalShowing} backdropClassName={modalBackdrop} contentClassName={modalBkg}>
        <Modal.Header>
          <Modal.Title>Top Up Identity</Modal.Title>
          {closeButtonColor}
        </Modal.Header>
        <Modal.Body>
        Purchase 0.01 Dash worth of Dash Platform Credits. (This is enough for many actions on Dash Platform.)
          {this.state.isLoading ? (
          <>
            <div id="spinner">
            <p> </p>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              
            </div>
          </>
        ) : (
          <></>
        )}
        </Modal.Body>

        

        {this.props.identity === "Error" ? (
          <Alert variant="warning">
            Testnet Platform maybe having difficulties... Or you need to add more funds to your wallet.
          </Alert>
        ) : (
          <></>
        )}

        <Modal.Footer>
          {this.state.isLoading ?
          <Button variant="primary" disabled>
          Top Up Identity
        </Button>
        :
        <Button variant="primary" onClick={()=>this.handleTopUp()}>
            Top Up Identity
          </Button>
        }
        </Modal.Footer>
      </Modal>
    );
  }
}

export default TopUpIdentityModal;
