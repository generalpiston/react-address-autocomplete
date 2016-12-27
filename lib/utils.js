
import _ from 'underscore';
import __parseAddress from 'addressit';


// @TODO(Abe): Add proper city and apartment number parsing.
export function parseAddress(address) {
  let parts = __parseAddress(address);
  if (!parts.city) parts.city = "san francisco";
  if (!parts.state) parts.state = "CA";
  return parts;
}

export function formatAddress(options) {
  if (!options) return null;

  if (options.street) {
    return ["number", "prefix", "street", "type", "city", "state", "zip"]
    .filter((key) => {
      return !!options && !_.isUndefined(options[key]) && !_.isNull(options[key]);
    })
    .map((key) => {
      return options[key];
    }).join(" ");
  } else {
    return ["text"/*, "city", "state", "zip"*/]
    .filter((key) => {
      return !!options && !_.isUndefined(options[key]) && !_.isNull(options[key]);
    })
    .map((key) => {
      return options[key];
    }).join(" ");
  }
}
