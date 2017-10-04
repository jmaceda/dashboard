"use strict";
exports.namespaceSeparator = ':';
exports.nodeTypeNames = [
    undefined,
    "Element",
    "Attribute",
    "Text",
    "CDATA Section",
    "Entity Reference",
    "Entity",
    "Processing Instruction",
    "Comment",
    "Document",
    "Document Type",
    "Document Fragment",
    "Notation"
];
(function (nodeTypes) {
    nodeTypes[nodeTypes["UNDEFINED"] = 0] = "UNDEFINED";
    nodeTypes[nodeTypes["ELEMENT"] = 1] = "ELEMENT";
    nodeTypes[nodeTypes["ATTRIBUTE"] = 2] = "ATTRIBUTE";
    nodeTypes[nodeTypes["TEXT"] = 3] = "TEXT";
    nodeTypes[nodeTypes["CDATA_SECTION"] = 4] = "CDATA_SECTION";
    nodeTypes[nodeTypes["ENTITY_REFERENCE"] = 5] = "ENTITY_REFERENCE";
    nodeTypes[nodeTypes["ENTITY"] = 6] = "ENTITY";
    nodeTypes[nodeTypes["PROCESSING_INSTRUCTION"] = 7] = "PROCESSING_INSTRUCTION";
    nodeTypes[nodeTypes["COMMENT"] = 8] = "COMMENT";
    nodeTypes[nodeTypes["DOCUMENT"] = 9] = "DOCUMENT";
    nodeTypes[nodeTypes["DOCUMENT_TYPE"] = 10] = "DOCUMENT_TYPE";
    nodeTypes[nodeTypes["DOCUMENT_FRAGMENT"] = 11] = "DOCUMENT_FRAGMENT";
    nodeTypes[nodeTypes["NOTATION"] = 12] = "NOTATION";
})(exports.nodeTypes || (exports.nodeTypes = {}));
var nodeTypes = exports.nodeTypes;
exports.nodeTypeKeys = Object.keys(nodeTypes);
var XDom = (function () {
    function XDom() {
    }
    XDom.isNodeType = function (nodeType) {
        return null === nodeType || undefined === nodeType ? false : undefined !== exports.nodeTypeKeys[nodeType];
    };
    XDom.isNodeTypeKey = function (nodeTypeKey) {
        return null === nodeTypeKey || undefined === nodeTypeKey ? false : undefined !== nodeTypes[nodeTypeKey];
    };
    XDom.nodeType = function (nodeTypeKey) {
        return null === nodeTypeKey || undefined === nodeTypeKey ? undefined : nodeTypes[nodeTypeKey];
    };
    XDom.nodeTypeKey = function (nodeType) {
        return null === nodeType || undefined === nodeType ? undefined : exports.nodeTypeKeys[nodeType];
    };
    XDom.nodeTypeName = function (nodeType) {
        return null === nodeType || undefined === nodeType ? undefined : exports.nodeTypeNames[nodeType];
    };
    return XDom;
}());
exports.XDom = XDom;
