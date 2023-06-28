"use Strict";
import React from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";

class TopUpButton extends React.Component {
  render() {
    let buttonColor;

    if (this.props.mode === "dark") {
      buttonColor = "primary";
    } else {
      buttonColor = "secondary";
    }

    return (
      <Nav.Item>
        <Nav.Link>
        {this.props.isLoadingButtons ?
          <Button
            variant={buttonColor}
            disabled
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold">Top Up </div>
              <Badge bg="light" text="dark" pill>
               Identity 
              </Badge>
            </div>
          </Button>
          :
          <Button
            variant={buttonColor}
            onClick={() => {
              this.props.showModal("TopUpIdentityModal");
            }}
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold">Top Up </div>
              <Badge bg="light" text="dark" pill>
               Identity 
              </Badge>
            </div>
          </Button>
  }
        </Nav.Link>
        
      </Nav.Item>
    );
  }
}

export default TopUpButton;
