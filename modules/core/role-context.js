"use strict";
exports.__esModule = true;
var React = require("react");
var react_1 = require("react");
var app_chrome_1 = require("ui/routes/app-chrome");
var definition_1 = require("ui/routes/definition");
exports.RoleContext = react_1.createContext(null);
exports.useRole = function () { return react_1.useContext(exports.RoleContext); };
exports.RoleContextProvider = function (props) {
    var role = definition_1.useRouteParams(app_chrome_1.AppChromeRoute).role;
    return (<exports.RoleContext.Provider value={role}>
      {props.children}
    </exports.RoleContext.Provider>);
};
