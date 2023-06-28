import React from "react";
//import Container from 'react-bootstrap/Container';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import DGMDocumentButton from "./DGMDocumentButton"
import RefreshButton from "./RefreshButton";
import TopUpButton from "./TopUpButton";

import "./BottomNav.css";

class BottomNav extends React.Component {

  render() {

    return (
      <>
        <Navbar
        
        className="bottomNav"  bg={this.props.mode}
        variant={this.props.mode} fixed="bottom">
          
          <Nav  className="one-level-nav">
          
            <DGMDocumentButton
              dgmDocuments={this.props.dgmDocuments}
              isLoadingButtons={this.props.isLoadingButtons}
              mode={this.props.mode}
              showModal={this.props.showModal}
            />

            <RefreshButton 
              isLoadingButtons={this.props.isLoadingButtons}
              handleLoginforRefreshWallet={this.props.handleLoginforRefreshWallet}
              mode={this.props.mode}
              showModal={this.props.showModal}
            />


            <TopUpButton
            isLoadingButtons={this.props.isLoadingButtons}
             identityInfo = {this.props.identityInfo}
              mode={this.props.mode}
              showModal={this.props.showModal}
            />

          </Nav>
          
         </Navbar>
      </>
    );
  }
}
export default BottomNav;
