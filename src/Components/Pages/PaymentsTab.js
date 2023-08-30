import React from "react";
//import Badge from "react-bootstrap/Badge";
//import Button from "react-bootstrap/Button";

import PaymentsMsgs from "./PaymentsMsgs";
import WalletTXModal from "../WalletTXModal";

class PaymentsTab extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {

  //     isModalShowing: false,
  //     presentModal: "",
  //   };
  // }


  render() {

// *** *** *** *** *** ***

/**
 *  <PaymentsTab
          
          mode={this.props.mode}
          
          identity={this.props.identity}
          uniqueName={this.props.uniqueName}
          showModal={this.props.showModal}
          handleThread={this.props.handleThread}

          ByYouMsgs={this.props.ByYouMsgs}
          ByYouNames={this.props.ByYouNames}
          ByYouThreads={this.props.ByYouThreads}

          ToYouMsgs={this.props.ByYouMsgs}
          ToYouNames={this.props.ByYouNames}
          ToYouThreads={this.props.ByYouThreads}

          isLoadingMsgs={this.props.isLoadingMsgs}

        />
 */

      //  console.log('This is the TOYOU', this.props.ToYouMsgs);
        
      let tupleByYouArray = [];

        tupleByYouArray = this.props.ByYouMsgs.map((msg) => {
          let tuple = "";

          for (let nameDoc of this.props.ByYouNames) {

            if (nameDoc.$ownerId === msg.toId) {
              tuple = [nameDoc.label, msg];
              break;
            }
          }
          if (tuple !== "") {
            return tuple;
          }
          //add a 

          return ["No Name Avail..", msg];
        });
// *** *** *** *** *** ***
        
       let tupleToYouArray = [];

        tupleToYouArray = this.props.ToYouMsgs.map((msg) => {
          let tuple = "";

          for (let nameDoc of this.props.ToYouNames) {
            if (nameDoc.$ownerId === msg.$ownerId) {
              tuple = [nameDoc.label, msg];
              break;
            }
          }
          if (tuple !== "") {
            return tuple;
          }

          return ["No Name Avail..", msg];
        });
// *** *** *** *** *** ***

// ### ### ### ### ### ###

  let tupleThreads = [...this.props.ByYouThreads, ...this.props.ToYouThreads];

  //let ForYouThreadsNames = [...this.props.ByYouThreadsNames, ...this.props.FromTagsThreadsNames];

// ### ### ### ### ### ###

      let tupleArray = [
      ...tupleByYouArray,
      ...tupleToYouArray
    ];


  // Ensure Unique msgs*** START
    let arrayOfMsgIds = tupleArray.map((tuple) => {
      return tuple[1].$id;
    });

    // console.log('Combine arrayMsgId!!', arrayOfMsgIds);

    let setOfMsgIds = [...new Set(arrayOfMsgIds)];

    arrayOfMsgIds = [...setOfMsgIds];

    //       ***

    tupleArray = arrayOfMsgIds.map((msgId) => {
      let tuple = [];

      for (let tupleDoc of tupleArray) {
        if (tupleDoc[1].$id === msgId) {
          tuple = tupleDoc;
          break;
        }
      }
      return tuple;
    });
// Ensure Unique msgs*** END

    // console.log('CombineandUnique Tuples!!', tupleArray);

    let sortedTuples = tupleArray.sort(function (a, b) {
      return a[1].timeStamp - b[1].timeStamp;
    });

    // console.log('Final Tuples!!', sortedTuples);


    let d = Date.now();

    let tuples = sortedTuples.map((tuple, index) => {
      return (
        <PaymentsMsgs
          key={index}
          mode={this.props.mode}
          index={index}
          tuple={tuple}
          date={d}
          
          identity={this.props.identity}
          uniqueName={this.props.uniqueName}

          showModal={this.props.showModal}
          handleThread={this.props.handleThread}

          // ForYouThreads={ForYouThreads}
          // ForYouThreadsNames={ForYouThreadsNames}
          tupleThreads={tupleThreads}

        />
       
      );
    });

    return (
      <>        
          

        {sortedTuples.length < 1 ? (
          <p className="paddingBadge">
            Payment messages, you send or ones sent to you, will appear here.
          </p>
        ) : (
          <></>
        )}

         

        <div id="cardtext" className="footer">
          {tuples}
        </div>

        {this.props.isModalShowing &&
        this.props.presentModal === "WalletTXModal" ? (
          <WalletTXModal
            isModalShowing={this.props.isModalShowing}
            hideModal={this.props.hideModal}
            mode={this.props.mode}

            accountHistory={this.props.accountHistory}
            accountBalance={this.props.accountBalance}

            // LoadingOrders={this.state.LoadingOrders}
            // DGPOrders={this.state.DGPOrders}
            // DGPOrdersNames={this.state.DGPOrdersNames}

            isLoadingMsgs ={this.props.isLoadingMsgs}
            sortedTuples = {sortedTuples}

            // So this should only be gotten too after wallet and msgs are loaded.. -> 


          />
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default PaymentsTab;
