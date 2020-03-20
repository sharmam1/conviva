import React, { Component } from "react";
import Headerstyles from './index.styl';
import axios from "axios";
export default class empDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      empDetails: "",
      empAddress: ""
    };
  }
  componentDidMount() {
    axios.get("/call_jira",
    	 ).then(data => {
      this.setState({
        empDetails: data
      });
    });
  }

  render() {
    let pagedata = this.state.empDetails;
    console.log(pagedata, " jira data")
    return (
      <section >
        <div>
        
        </div>
      </section>
    );
  }
}
