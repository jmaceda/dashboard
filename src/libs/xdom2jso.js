var nodeTypes = xdom.nodeTypes;
var xdom2jso;
(function (xdom2jso) {
    function convert(xmlRoot, localName) {
        if (undefined !== localName)
            this.localName = localName;
        var jsoRoot = {};
        convertNodes(jsoRoot, xmlRoot);
        return jsoRoot;
    }
    xdom2jso.convert = convert;
    var localName = false;
    function convertNodes(jso, node) {
        var nodeType = node.nodeType;
        var nodeName = this.localName ? node.localName : node.nodeName;
        if (nodeTypes.ELEMENT === nodeType) {
            var jsoNode = {};
            var attributeNodes = node.attributes;
            var attributeIndex = attributeNodes.length;
            if (0 < attributeIndex) {
                var attributes = {};
                for (var attributeIndex = 0; attributeNodes.length > attributeIndex; ++attributeIndex) {
                    var attribute = attributeNodes.item(attributeIndex);
                    attributes[this.localName ? attribute.localName : attribute.nodeName] = attribute.value;
                }
                jsoNode['_'] = attributes;
            }
            var childNodes = node.childNodes;
            for (var childIndex = 0; childNodes.length > childIndex; ++childIndex) {
                convertNodes(jsoNode, childNodes[childIndex]);
            }
            if (undefined === jso[nodeName]) {
                jso[nodeName] = jsoNode;
            }
            else {
                if (Array !== jso[nodeName].constructor) {
                    var jsoFirstNode = jso[nodeName];
                    jso[nodeName] = [];
                    jso[nodeName].push(jsoFirstNode);
                }
                jso[nodeName].push(jsoNode);
            }
        }
        else if (nodeTypes.TEXT === nodeType) {
            var nodeValue = node.nodeValue;
            if (/\S/.test(nodeValue)) {
                jso['$'] = nodeValue.trim();
            }
        }
    }
})(xdom2jso || (xdom2jso = {}));

//# sourceMappingURL=../map/xdom2jso.js.map
