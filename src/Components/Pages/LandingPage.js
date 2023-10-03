import React from "react";
//import Badge from "react-bootstrap/Badge";

import Carousel from "react-bootstrap/Carousel";

import DGMDark1 from "../../Images/IMG_1581.jpg";
import DGMDark2 from "../../Images/IMG_1583.jpg";
import DGMDark3 from "../../Images/IMG_1585.jpg";

import DGMLight1 from "../../Images/IMG_1582.jpg";
import DGMLight2 from "../../Images/IMG_1584.jpg";
import DGMLight3 from "../../Images/IMG_1586.jpg";

import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Figure from "react-bootstrap/Figure";
import "./LandingPage.css";

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: true,
    };
  }

  handleAlert = () => {
    if (this.state.showAlert) {
      this.setState({
        showAlert: false,
      });
    }
  };

  render() {
    return (
      <>
        {/* {this.state.showAlert ? <Alert variant="warning" onClose={() => this.handleAlert()} dismissible>
      <Alert.Heading>Welcome to DashGetNames - Beta Testers!</Alert.Heading>
      <p>
        Aww yeah, thank you for reading this important message. To use DashGetNames, first two things must be working.
      </p>
      <ul>
        <li>First of all, you must <b>Allow</b> "Insecure content". In Chrome Browser, do this by clicking the "Lock Icon" by the URL -{'>'} Site Settings -{'>'} Insecure Content -{'>'} Allow. The reason for this is <a target="blank" href="https://dashplatform.readme.io/docs/reference-frequently-asked-questions">
            Frequently Asked Questions - Why can't I connect to DAPI from a page served over HTTPS?
            </a></li> Dash Platform v0.24 should fix this, and that is the next version so fingers crossed!
        <li>The Dash testnet must also be working, which should be the case is the very near future.</li>
      </ul>
    </Alert>
    :
    <></>
    } */}

        <div id="bodytext">
          <h5 id="title-bar">
            <b>Send and receive Dash with just a name and more!</b>
          </h5>
        </div>

        {this.props.mode === "dark" ? 
        <Carousel>

          <Carousel.Item>
            <Container>
              <Row>
                <Col xs={2} md={4}></Col>
                <Col xs={8} md={4} className="positionCaption">
                  <div className="positionCaption">
                    <Image
                      fluid
                      rounded
                      id="dash-landing-page"
                      src={DGMDark1}
                      alt="Dash Wallet with Name"
                    />
                    <p></p>
                    <Figure.Caption className="figureCaption">
                      <b>Preview - Wallet</b>
                    </Figure.Caption>
                  </div>
                </Col>
                <Col xs={2} md={4}></Col>
              </Row>
            </Container>
          </Carousel.Item>

          <Carousel.Item>
            <Container>
              <Row>
                <Col xs={2} md={4}></Col>
                <Col xs={8} md={4} className="positionCaption">
                  <div className="positionCaption">
                    <Image
                      fluid
                      rounded
                      id="dash-landing-page"
                      src={DGMDark2}
                      alt="Dash Payment Success"
                    />
                    <p></p>
                    <Figure.Caption className="figureCaption">
                      <b>Preview - Payment</b>
                    </Figure.Caption>
                  </div>
                </Col>
                <Col xs={2} md={4}></Col>
              </Row>
            </Container>
          </Carousel.Item>
        

<Carousel.Item>
<Container>
  <Row>
    <Col xs={2} md={4}></Col>
    <Col xs={8} md={4} className="positionCaption">
      <div className="positionCaption">
        <Image
          fluid
          rounded
          id="dash-landing-page"
          src={DGMDark3}
          alt="Dash Payment Messages"
        />
        <p></p>
        <Figure.Caption className="figureCaption">
          <b>Preview - Messages</b>
        </Figure.Caption>
      </div>
    </Col>
    <Col xs={2} md={4}></Col>
  </Row>
</Container>
</Carousel.Item>
</Carousel>
:
<Carousel>
          <Carousel.Item>
            <Container>
              <Row>
                <Col xs={2} md={4}></Col>
                <Col xs={8} md={4} className="positionCaption">
                  <div className="positionCaption">
                    <Image
                      fluid
                      rounded
                      id="dash-landing-page"
                      src={DGMLight1}
                      alt="Dash Wallet with Name"
                    />
                    <p></p>
                    <Figure.Caption className="figureCaption">
                      <b>Preview - Wallet</b>
                    </Figure.Caption>
                  </div>
                </Col>
                <Col xs={2} md={4}></Col>
              </Row>
            </Container>
          </Carousel.Item>

          <Carousel.Item>
            <Container>
              <Row>
                <Col xs={2} md={4}></Col>
                <Col xs={8} md={4} className="positionCaption">
                  <div className="positionCaption">
                    <Image
                      fluid
                      rounded
                      id="dash-landing-page"
                      src={DGMLight2}
                      alt="Dash Payment Success"
                    />
                    <p></p>
                    <Figure.Caption className="figureCaption">
                      <b>Preview - Payment</b>
                    </Figure.Caption>
                  </div>
                </Col>
                <Col xs={2} md={4}></Col>
              </Row>
            </Container>
          </Carousel.Item>
        

<Carousel.Item>
<Container>
  <Row>
    <Col xs={2} md={4}></Col>
    <Col xs={8} md={4} className="positionCaption">
      <div className="positionCaption">
        <Image
          fluid
          rounded
          id="dash-landing-page"
          src={DGMLight3}
          alt="Dash Payment Messages"
        />
        <p></p>
        <Figure.Caption className="figureCaption">
          <b>Preview - Messages</b>
        </Figure.Caption>
      </div>
    </Col>
    <Col xs={2} md={4}></Col>
  </Row>
</Container>
</Carousel.Item>
</Carousel>
}

        <div id="bodytext">
          <h3>How to Use</h3>
          <div className="paragraph-shift">
            <ol>
              <li>
                <p>
                  Log in with your wallet and <b>Enable Pay to Name</b> (Button
                  will be at the bottom of your screen) to receive Dash payments
                  directly to your name.
                </p>
              </li>
              <li>
                <p>
                  To send Dash, just enter a name and amount. (Person can only
                  receive if they have enabled pay to name with DashGetMoney.)
                </p>
              </li>
              <li>Send them Dash! (tDash if you are on Testnet)</li>
            </ol>
            <p>
              If you are new to Dash, go to{" "}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.dashgetnames.com"
              >
                <b>DashGetNames.com</b>
              </a>
              <span> </span>for everything you'll need.{" "}
            </p>
            {/* <p> </p>
            <p>
              And go to{" "}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.dashshoutout.com"
              >
                <b>DashShoutOut.com </b>
              </a>{" "}
              to find someone to send or receive with!
            </p> */}
          </div>
        </div>
      </>
    );
  }
}

export default LandingPage;
