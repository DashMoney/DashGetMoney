import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";

import "./ConfirmPaymentModal.css";

class ConfirmPaymentModal extends React.Component {
  

  handleCloseClick = () => {
    this.props.hideModal();
  };

  handleSubmitClick = (event) => {
    event.preventDefault();
    this.props.sendDashtoName()
    this.handleCloseClick()
  };

  render() {
    let modalBkg = "";
    let closeButtonColor;

    if (this.props.mode === "primary") {
      modalBkg = "modal-backcolor-primary";
      closeButtonColor = <CloseButton onClick={this.handleCloseClick} />;
    } else {
      modalBkg = "modal-backcolor-dark";
      closeButtonColor = (
        <CloseButton onClick={this.handleCloseClick} variant="white" />
      );
    }

    return (
      <>
        <Modal contentClassName={modalBkg} show={this.props.isModalShowing}>
          <Modal.Header>
            <Modal.Title>Confirm Payment</Modal.Title>
            {closeButtonColor}
          </Modal.Header>
          <Modal.Body>

            <p>Send <b>{this.props.amountToSend} Dash</b> to <b>{this.props.sendToName}</b>?</p>

            <p>Fun Fact: Dash Names are not case sensitive, so as long as the spelling is correct, it will work.</p>
            
          </Modal.Body>
          <Modal.Footer>
              <>
                <Button variant="primary" onClick={this.handleSubmitClick}>
                  Confirm Payment
                </Button>
              </>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default ConfirmPaymentModal;
