
import React from 'react';
import { render } from 'react-dom';

import AddressAutocomplete from '../lib/index.js';

class BasicSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search: "",
      latitude: Infinity,
      longitude: Infinity
    };
  }

  render() {
    return (
      <div>
        <AddressAutocomplete
          name="location"
          placeholder="Address: 12456 Fake Street, San Francisco, CA, 94118"
          value={this.state}
          onChange={data => this.setState(data)}
          apiKey={"mapzen-6DCM25F"} />
      </div>
    );
  }
}

if (typeof document !== 'undefined') {
  render((
    <BasicSearch />
  ), $("div#basic")[0]);
}
