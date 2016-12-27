
import _ from 'underscore';
import React from 'react';
import cx from 'classnames';
import {parseAddress, formatAddress} from './utils.js';


const STATUSES = {
  "UNFOCUSED": 0x0,
  "FOCUSED": 0x1,
  "AUTOCOMPLETE": 0x2
};


export default class AddressAutocomplete extends React.Component {
  static propTypes = {
    apiKey: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    value: React.PropTypes.shape({
      search: React.PropTypes.string.isRequired,
      latitude: React.PropTypes.number.isRequired,
      longitude: React.PropTypes.number.isRequired
    }).isRequired,
    onChange: React.PropTypes.func.isRequired,

    listClassName: React.PropTypes.string
  };

  static defaultProps = {
    url: "https://search.mapzen.com/v1",
    value: {
      search: "",
      latitude: Infinity,
      longitude: Infinity
    },
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      autocomplete: [],
      status: STATUSES.UNFOCUSED,
      focus: -1
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value.search !== nextProps.value.search) {
      this.update(nextProps);
    }
  }

  fill(focus) {
    if (focus < 0) {
      var data = _.find(this.state.autocomplete, (geojson) => {
        return !!~geojson.properties.label.indexOf(this.props.value.search);
      });
    } else if (focus < this.state.autocomplete.length) {
      var data = this.state.autocomplete[focus];
    }

    if (data) {
      this.props.onChange({
        search: data.properties.label,
        latitude: data.geometry.coordinates[1],
        longitude: data.geometry.coordinates[0]
      });

      this.setState({
        status: STATUSES.UNFOCUSED,
        autocomplete: []
      });
    }
  }

  move(key) {
    switch(key) {
      case "ArrowUp":
      if (this.state.focus >= 0) {
        this.setState({ focus: this.state.focus - 1 });
      }
      break;

      case "ArrowDown":
      if (this.state.focus + 1 < this.state.autocomplete.length) {
        this.setState({ focus: this.state.focus + 1 });
      }
      break;
    }
  }

  update = _.debounce((props) => {
    if (this.state.status == STATUSES.UNFOCUSED) return;

    let url = this.props.url + "/autocomplete",
        addressParts = parseAddress(props.value.search);
    return $.ajax({
      type: 'GET',
      url: url,
      data: {
        api_key: props.apiKey,
        sources: "openaddresses",
        text: formatAddress(addressParts) || props.value.search
      }
    })
    .then((data) => {
      this.setState({
        status: STATUSES.AUTOCOMPLETE,
        autocomplete: _.uniq(data.features, (feature) => {
          return feature.properties.label;
        })
      });
    });
  }, 100);

  renderStart() {
    return (this.props.start) ? this.props.start : null;
  }

  renderEnd() {
    return (this.props.end) ? this.props.end : null;
  }

  render() {
    return (
      <div className={cx({ "address-autocomplete-container": true })}
          onFocusCapture={(e) => {
            if (this.state.status == STATUSES.UNFOCUSED) {
              this.setState({ status: STATUSES.FOCUSED });
              e.stopPropagation();
            }
          }}
          onBlurCapture={(e) => {
            setTimeout(() => {
              this.setState({ status: STATUSES.UNFOCUSED });
            }, 150);

            e.stopPropagation()
          }}>
        {this.renderStart()}
        <div className={cx({ "address-autocomplete-input-container": true })}>
          <input
              {..._.omit(this.props, "start", "end", "search", "latitude", "longitude", "apiKey", "url", "type", "value", "ref", "onFocus", "onBlur", "onChange", "children")}
              type="search"
              value={this.props.value.search}
              onChange={(e) => {
                this.props.onChange({
                  search: e.target.value,
                  latitude: Infinity,
                  longitude: Infinity
                });
              }}
              onKeyDown={(e) => {
                switch(e.key) {
                  case "ArrowUp":
                  case "ArrowDown":
                  this.move(e.key);
                  e.preventDefault();
                  break;
                  case "Enter":
                  this.fill(this.state.focus);
                  break;
                }
              }}
              autoComplete="off" />
          <input type="hidden"
              value={this.props.value.latitude}
              name="latitude"
              className="hide"
              readOnly />
          <input type="hidden"
              value={this.props.value.longitude}
              name="longitude"
              className="hide"
              readOnly />
          <AddressAutocompleteList className={this.props.listClassName}
              show={this.state.status == STATUSES.AUTOCOMPLETE}
              autocomplete={this.state.autocomplete}
              selected={this.state.focus}
              onSelect={(index) => this.fill(index)} />
        </div>
        {this.renderEnd()}
      </div>
    );
  }
}

export class AddressAutocompleteList extends React.Component {
  static propTypes = {
    autocomplete: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    
    selected: React.PropTypes.number,
    show: React.PropTypes.bool, 
  };

  static defaultProps = {
    autocomplete: [],
    onSelect: () => {},

    selected: -1,
    show: false
  };

  constructor(props) {
    super(props);

    this.references = [];

    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    if (!!~nextProps.selected) {
      let field = this.references[nextProps.selected];
      if (field) {
        field.focus();
      }
    }
  }

  render() {
    if (!this.props.show) return null;

    let classNames = {
      collection: true,
      autocomplete: true
    };

    if (this.props.className) classNames[this.props.className] = true;

    return (
      <div className={cx(classNames)}>
        {this.props.autocomplete.map((geojson, index) => {
          return (
            <a key={geojson.properties.label}
                href="javascript:void(0)"
                className={cx({
                  "collection-item": true,
                  "autocomplete": true,
                  "active": this.props.selected == index
                })}
                onClick={() => this.props.onSelect(index)}
                ref={(c) => this.references[index] = c}>
              <span className="title">{geojson.properties.label}</span>
            </a>
          );
        })}
      </div>
    );
  }
}
