import React from "react";
//import Button from 'react-bootstrap/Button';
import Card from "react-bootstrap/Card";

class Threads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copiedName: false,
    };
  }

  handleThreadNameClick = (nameLabel) => {
    navigator.clipboard.writeText(nameLabel);
    this.setState({
      copiedName: true,
    });
  };

  handleName = (msgDoc) =>{
    if(msgDoc.$ownerId === this.props.identity){
    return <span style={{ color: "#008de4" }}>{this.props.uniqueName}</span>
    }else{

      return <span style={{ color: "#008de4" }} onClick={() => this.handleThreadNameClick(this.props.tuple[0])}>
        {this.props.tuple[0]}
        </span>
    }
    
  }


  getRelativeTimeAgo(messageTime, timeNow){

    let timeDifference = timeNow - messageTime;
  
    if(timeDifference >= 84600000){
      let longFormDate = new Date();
       longFormDate.setTime(messageTime);
      return longFormDate.toLocaleDateString();
    }
    
    /*
    Calculate milliseconds in a year
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const year = day * 365;
    */
  
    if(timeDifference < 15000){
      return "Just now"
    }else if(timeDifference <44000){
      return "Few moments ago"
    }else if(timeDifference <90000){
      return "1 min ago"
    }else if(timeDifference <150000){
      return "2 min ago"
    }else if(timeDifference <210000){
      return "3 min ago"
    }else if(timeDifference <270000){
      return "4 min ago"
    }else if(timeDifference <330000){
      return "5 min ago"
    }else if(timeDifference <390000){
      return "6 min ago"
    }else if(timeDifference <450000){
      return "7 min ago"
    }else if(timeDifference <510000){
      return "8 min ago"  
    }else if(timeDifference <570000){
      return "9 min ago"  
    }else if(timeDifference <660000){
      return "10 min ago"
    }else if(timeDifference <840000){
      return "12 min ago"
    }else if(timeDifference <1020000){
      return "15 min ago"
    }else if(timeDifference <1140000){
      return "18 min ago"
    }else if(timeDifference <1380000){
      return "20 min ago"
    }else if(timeDifference <1650000){
      return "25 min ago"
    }else if(timeDifference <1950000){
      return "30 min ago"
    }else if(timeDifference <2250000){
      return "35 min ago"
    }else if(timeDifference <2550000){
      return "40 min ago"
    }else if(timeDifference <3000000){
      return "45 min ago"
    }else if(timeDifference <5400000){
      return "1 hr ago"
    }else if(timeDifference <9000000){
      return "2 hrs ago"
    }else if(timeDifference <12600000){
      return "3 hrs ago"
    }else if(timeDifference <18000000){
      return "5 hrs ago"
    }else if(timeDifference <43200000){
      return "Many hrs ago"
    }else if(timeDifference <84600000){
      return "About a day ago"
    }
  }


  render() {
    let cardBkg;
    let cardText;

    if (this.props.mode === "primary") {
      cardBkg = "white";
      cardText = "dark";

    } else {
      cardBkg = "dark";
      cardText = "white";

    }

    return (

      <Card id="thread" key={this.props.index} bg={cardBkg} text={cardText}>
          <Card.Body>
            <Card.Title className="cardTitle">
            {this.handleName(this.props.thr)}

            {/* <span onClick={() => this.handleNameClick()}>
                {this.props.tuple[0]}
              </span> */}
              <span>
                {this.state.copiedName?<span>✅</span>:<></>}
                </span>
            
            <span 
               className="textsmaller text-muted"
              >
                {this.getRelativeTimeAgo(this.props.thr.$createdAt, this.props.date)}
              </span>
              </Card.Title>
              <Card.Text 
              onClick={()=>this.props.handleThread(this.props.tuple[1].$id, this.props.tuple[0])}>
              {this.props.thr.msg}
            </Card.Text>
          </Card.Body>
        </Card>

            
          
          
    );
  }
}

export default Threads;
