var jdi_type = "jdi-type";
var jdi_name = "jdi-name";
var jdi_parent = "jdi-parent";
var jdi_gen = "jdi-gen"

var ITextField = "ITextField";
var ITextArea = "ITextArea";
var IButton = "IButton";
var IForm = "IForm"
var IPage = "IPage"
var IElement = "IElement"

var options = {
    onlyMark : "",
    isMark : ""
};

var Utils = {
    randColor: function () {
        return "#" + ((1 << 24) * Math.random() | 0).toString(16);
    },
    mark: function (item) {
        item.style.backgroundColor = this.randColor();
        item.style.outline = "2px solid red";
        item.color = "black";
        item.opacity = 0.2;
    },
};

function saveChanges(data) {
    if (!data) {
        console.log('Error: No value specified');
        data = "texzt";
        return;
    }

    chrome.storage.sync.set({'value': JSON.stringify(data)}, function () {
        console.log('Settings saved');
    });
}

function getAll() {
    return getElementsArray(document, "[" + jdi_type + "]");
}

function getOnlyMark() {
    var res = [];
    var all = getAll();
    $.each(all, function (index, value) {
        if (value.getAttribute("jdi-selected") === "true") {
            res.push(value);
        }
    });
    return res;
}

function start() {
    var elements = (options.onlyMark === true) ? getOnlyMark() : getAll();
    var page = {
        name: location.pathname,
        url: document.URL,
        title: document.title,
        type: IPage,
        elements: getPageElements(elements)
    };

    //process(page);
    //openResultsWindow(page, filesArray);

    saveChanges(page);
}

function getPageElements(elements) {
    var allElements = elements;//getElementsArray(document, "[" + jdi_type + "]");
    var resElArr = [];
    var children = [];

    $.each(allElements, function (index, value) {
        if (options.isMark) {
            Utils.mark(value);
        }
        resElArr.push(getElementData(value))
    });

    children = removeAllChildren(resElArr);
    proc(resElArr, children);
    return resElArr;
}

function proc(prn, cld) {
    for (var i = 0; i < cld.length; i++) {
        for (var j = 0; j < prn.length; j++) {
            if (prn[j].elements !== undefined)
                if (prn[j].elements.length > 0) {
                    proc(prn[j].elements, cld);
                }
            j = (prn[j] === undefined) ? 0 : j;
            i = (cld[i] === undefined) ? 0 : i;
            if (prn[j].name === cld[i].parent) {
                prn[j].elements.push(cld.splice(i, 1)[0]);
                i = j = -1;
                break;
            }
        }
    }
}

function removeAllChildren(arr) {
    var res = [];
    for (var n = 0; n < arr.length;) {
        if (arr[n].parent !== undefined) res.push(arr.splice(n, 1)[0]);
        else n++;
    }
    return res;
}


function getElementData(tmpElem) {
    return temp = {
        type: tmpElem.getAttribute(jdi_type),
        name: tmpElem.getAttribute(jdi_name),
        parent: (tmpElem.hasAttribute(jdi_parent)) ? tmpElem.getAttribute(jdi_parent) : undefined,
        gen: (tmpElem.hasAttribute(jdi_gen)) ? tmpElem.getAttribute(jdi_gen) : undefined,
        elements: [],
        // locator : "[" + jdi_name + "='" + tmpElem.getAttribute(jdi_name) + "']",
        toJSON: function () {
            return {
                name: this.name,
                type: this.type,
                //parent: this.parent,
                gen: this.gen,
                elements: (this.elements !== undefined) ? ((this.elements.length > 0) ? this.elements : undefined) : undefined
            }
        }
    }
}

function getElementsArray(tmpContainer, findRule) {
    return Array.prototype.slice.call(tmpContainer.querySelectorAll(findRule));
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        switch (key) {
            case "run":
                if(storageChange.newValue === "yes"){
                    options.onlyMark = changes["onlyMark"].newValue;
                    options.isMark = changes["isMark"].newValue;
                    start();
                }
                break;
        }
    }
});