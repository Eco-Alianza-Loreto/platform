import React, { Component } from "react";
import PropTypes from "prop-types";

import TextField from "../form-fields/text-field";
import { customUrlField as messages } from "../messages";
import "./custom-url-toolbar.scss";

const Util = require("../../js/utils.js");

class CustomUrlToolbar extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      url: ""
    };
    this.urlPrefix = 
      window.location.protocol +
      "//" +
      window.location.hostname +
      "/";
    this.onUrlChange = this.onUrlChange.bind(this);
  }

  onUrlChange(evt) {
    evt.target.value = Util.prepareCustomUrl(evt.target.value);
    this.setState({
      url: evt.target.value
    });
    this.props.onChange(evt);
  }

  render() {
    const { name, placeholder, required, value } = this.props;

    return (
      <div className="custom-url-field">
        <div className="custom-url-field__url-readout-container">
          <p className="custom-url-field__url-readout-prefix-msg">
            {messages.urlReadoutPrefix}
          </p>
          <span className="custom-url-field__url-readout-prefix">
            {this.urlPrefix}
          </span>
          <span className="custom-url-field__url-readout-url">
            {this.state.url}
          </span>
        </div>
        <TextField 
          placeholder={placeholder} 
          value={value}
          name={name}
          required={required}
          onChange={this.onUrlChange} 
        />
      </div>
    );
  }

};

export default CustomUrlToolbar;