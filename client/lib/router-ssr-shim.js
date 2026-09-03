const React = require("react");
const passthrough = ({ children }) => React.createElement(React.Fragment, null, children);
module.exports = {
  BrowserRouter: passthrough,
  Router: passthrough,
  Routes: passthrough,
  Route: passthrough,
  Navigate: () => null,
  Link: ({ children, to, ...props }) => React.createElement("a", { href: typeof to === "string" ? to : "#", ...props }, children),
  useLocation: () => ({ pathname: "/", search: "" }),
  useNavigate: () => () => {},
  useParams: () => ({}),
  useOutletContext: () => ({}),
};
