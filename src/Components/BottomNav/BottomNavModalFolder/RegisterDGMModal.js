import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";


class RegisterDGMModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  handleCloseClick = () => {
    this.props.hideModal();
  };

  handleRegisterDGM = () => {
    this.props.RegisterDGMAddress();
    this.props.collapseTopNav();
    this.props.hideModal();
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
      <Modal show={this.props.isModalShowing} contentClassName={modalBkg}>
        <Modal.Header>
          <Modal.Title>Register for Pay to Name!</Modal.Title>
          {closeButtonColor}
        </Modal.Header>
        <Modal.Body>
        Registering with DashGetMoney will allow others to send you Dash by using just your name.
          
        </Modal.Body>


        <Modal.Footer>
          
        <Button variant="primary" onClick={()=>this.handleRegisterDGM()}>
            Register Name
          </Button>
        
        </Modal.Footer>
      </Modal>
    );
  }
}

export default RegisterDGMModal;
