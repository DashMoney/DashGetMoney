import React from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";


class CreateMessageButton extends React.Component {

  render(){
    let buttonColor;
    if(this.props.mode==='dark'){
      buttonColor='primary';
    }else{
      buttonColor='secondary'
    }

    return(
      <Nav.Item>
        <Nav.Link>

          {this.props.dgmDocuments.length !== 0 && !this.props.isLoadingButtons  ?
          <Button
          variant={buttonColor}
          disabled
          >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Name</div>
            <Badge bg="light" text="dark" pill>
            Registered
            </Badge>
            </div>
          </Button>
            :
            <></>}

            {this.props.dgmDocuments.length === 0 && !this.props.isLoadingButtons  ?
          <Button
            variant={buttonColor}
            onClick={() => {
              this.props.showModal('RegisterDGMModal');
            }}
            >
            <div className="ms-2 me-auto">
              <div className="fw-bold">Register</div>
              <Badge bg="light" text="dark" pill>
               Pay to Name
              </Badge>
            </div>
          </Button>
          :<></>
          }

          {this.props.dgmDocuments.length === 0 && this.props.isLoadingButtons ?
          <Button
          variant={buttonColor}
          disabled
          >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Register</div>
            <Badge bg="light" text="dark" pill>
            Loading..
            </Badge>
            </div>
          </Button>
          :
          <></>}

{this.props.dgmDocuments.length !== 0 && this.props.isLoadingButtons ?
          <Button
          variant={buttonColor}
          disabled
          >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Name</div>
            <Badge bg="light" text="dark" pill>
            Registered
            </Badge>
            </div>
          </Button>
          :
          <></>}
        </Nav.Link>
        </Nav.Item>
        
    );
  }
}

export default CreateMessageButton;
