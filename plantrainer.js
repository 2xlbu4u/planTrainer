setFlightRulesColor
var _fields = [];
var _currentStrip;

var _fsPlansCorrected;
var _fsFixedScore = null;
var _hcallsign, _flightstrip;
var _currentPlansCorrected = 0, _currentMistakesPresented = 0, _currentMistakesFixed = 0;
var _btnNextPlan, _btnAmendPlan, _btnCheckmywork, _btnShowMe = null;
var _servicename = window.location.origin + "/plans";
var _planid = undefined;

function init()
{
    _hcallsign = document.getElementById("hcallsign");
    _flightstrip = document.getElementById("flightstrip");

    _fsPlansCorrected = document.getElementById("fsPlansCorrected");
    _fsFixedScore = document.getElementById("fixedScore");

    _btnCheckmywork = document.getElementById("btnCheckMyWork");
    _btnNextPlan = document.getElementById("btnNextPlan");
    _btnAmendPlan = document.getElementById("btnAmendPlan");
    _btnShowMe = document.getElementById("btnShowMe");

    _planid = getParameterByName("planid");
    if (_planid !== null)
        localStorage.setItem("currentPlansCorrected", Number(_planid) - 1 );

    request(_servicename, "",
        function (strips)
        {
            _strips = strips;
            _fields = strips[0].header;

            loadNextFS();
        });
}

function getPlansCorrected() 
{
    _currentPlansCorrected = localStorage.getItem("currentPlansCorrected");
    if (_currentPlansCorrected === null || _currentPlansCorrected === "undefined" || _currentPlansCorrected === "")
        _currentPlansCorrected = 0;
    _fsPlansCorrected.innerText = _planid === null ? _currentPlansCorrected : 0;
    return _currentPlansCorrected;
}

function bumpSaveTotalPlansCorrected()
{
    localStorage.setItem("currentPlansCorrected", ++_currentPlansCorrected);
    _fsPlansCorrected.innerText = _currentPlansCorrected;
    updateFixedScore();
}

function getMistakesPresented()
{
    _currentMistakesPresented = localStorage.getItem("currentMistakesPresented");
    if (_currentMistakesPresented === null || _currentMistakesPresented === "undefined" || _currentMistakesPresented === "")
        _currentMistakesPresented = 0;
    return _currentMistakesPresented;
}

function bumpSaveTotalMistakesPresented()
{
    localStorage.setItem("currentMistakesPresented", ++_currentMistakesPresented);
}

function getMistakesFixed()
{
    _currentMistakesFixed = localStorage.getItem("currentMistakesFixed");
    if (_currentMistakesFixed === null || _currentMistakesFixed === "undefined" || _currentMistakesFixed === "")
        _currentMistakesFixed = 0;
    return _currentMistakesFixed;
}

function bumpSaveTotalMistakesFixed(failedToFix) 
{
    ++_currentMistakesFixed;
    _currentMistakesFixed -= failedToFix;
    localStorage.setItem("currentMistakesFixed", _currentMistakesFixed);
}

function updateFixedScore() {
    var numericVal = Number((getMistakesFixed() / getMistakesPresented() * 100));
    if (isNaN(numericVal))
        numericVal = 0;
    _fsFixedScore.innerText = Math.round(numericVal) + "%";
}

function onHamburger() {
    if (confirm("Reset Score And Progress?"))
        if (confirm("Are You Sure?")) 
        {
            localStorage.setItem("currentPlansCorrected", "");
            localStorage.setItem("currentMistakesPresented", "");
            localStorage.setItem("currentMistakesFixed", "");	
        }
}
function isUndefined(test) 
{
    return (typeof test === "undefined");
}
function loadNextFS()
{
    _btnNextPlan.disabled = true;
    _btnCheckmywork.disabled = false;
    _btnAmendPlan.disabled = false;
    _btnShowMe.disabled = false;


    getPlansCorrected();
    getMistakesPresented();
    getMistakesFixed();
    
    updateFixedScore();

    // Offset 1 because of header
    var currentStripID = Number(_currentPlansCorrected) + 1;
    _currentStrip = _strips[currentStripID];
    var stripDataRaw = _currentStrip.presented;
    var stripData = stripDataRaw.split(",");

    for (var i = 0; i < _fields.length; i++)
    {
        var elementName = _fields[i];
        var fsElement = document.getElementById("fs" + elementName);
        var dataValue = stripData[i];

        if (elementName === "callsign")
            _hcallsign.innerText = dataValue;
        
        fsElement.innerText = dataValue;
        if (elementName === "rules")
            setFlightRulesColor();

        fsElement.style.color = "black";

    }

    fixBottomBorder();
    hideAllTooltips();

    transfer("fs", "fp");
}

function setFlightRulesColor() 
{
    var rule = document.getElementById("fsrules").innerText;
    _flightstrip.className = (rule === "V") ? "flightstrip-v" : "flightstrip-i";
    fixBottomBorder();
}

function hideAllTooltips() {

    var tips = document.getElementsByClassName("tooltiptext");
    for (var i = 0; i < tips.length; i++) 
    {
        var tip = tips[i];
        if (!tip.id.startsWith("fs"))
            continue;
        tip.style.visibility = "hidden";
    }

}

// The tooltip for some reason puts a dotted border under the text 
// it is attached to. This bit of code fixes it
function fixBottomBorder()
{
    for (var i = 0; i < _fields.length; i++) 
    {
        var fsElement = document.getElementById("fs" + _fields[i]);
        var fsParent = fsElement.parentElement;
        if (fsParent.localName !== "div")
            continue;
        fsElement.style.borderBottom = (_flightstrip.className === "flightstrip-v") ? "1px solid rgb(202, 223, 213)" : "1px solid rgb(175, 175, 207)";
    }
}



function transfer(from, to)
{
    for (var i = 0; i < _fields.length; i++)
    {
        var element = _fields[i];
        var fromElement = document.getElementById(from + element);
        var toElement = document.getElementById(to + element);
        if (from === "fs")
        {
            // from strip to plan
            toElement.value = fromElement.innerText;
        }
        else
        {
            // from plan to strip
            var modified = false;

            if (toElement.innerText !== fromElement.value)
                modified = true;

            toElement.innerText = fromElement.value;

            if (modified)
            {
                toElement.style.color = "blue";
            }

            // hack for fsinitalt
            if (element === "cruisealt") 
            {
                var fsinitalt = document.getElementById("fsinitalt");
                fsinitalt.innerText = fromElement.value;
                if (modified) {
                    fsinitalt.style.color = "blue";
                }
            }
            if (element === "rules") 
            {
                setFlightRulesColor();
            }

        }
    }
}

function onAmendPlan()
{
    transfer("fp", "fs");
    hideAllTooltips();
}

function onShowMe() 
{
    onCheckMyWork(true);
}
function onCheckMyWork(showMe) 
{
    var failedToFix = 0;
    // Get the record that contains the corrections
    var currentCorrected = _currentStrip["corrected"];

    if (currentCorrected === "")
        currentCorrected = [];


    var elementsToCorrect = {};
    var correctedItem = {};
    var element = "";
    var numberToBeCorrected = currentCorrected.length;
    // Find ones to be corrected
    for (var j = 0; j < currentCorrected.length; j++) 
    {
        correctedItem = currentCorrected[j];

        for (var i = 0; i < _fields.length; i++)
        {
            element = _fields[i];
            if (typeof correctedItem[element] != "undefined") 
            {
                elementsToCorrect[element] = correctedItem[element];
                break;
            }
        }
    }

    var haveBeenFixed = 0;

    for (var i = 0; i < _fields.length; i++) 
    {
        element = _fields[i];
        var fsElement = document.getElementById("fs" + element);
        var correctedItemElement = elementsToCorrect[element];
        if (typeof correctedItemElement != "undefined") 
        {
            // Check fixes
            bumpSaveTotalMistakesPresented();

            var correctedText = correctedItemElement[0];
            var correctedReason = correctedItemElement[1];
            var elementtooltip = document.getElementById(fsElement.id + "tip");

            if (showMe) 
            {
                failedToFix++;
                fsElement.style.color = "blue";
                fsElement.innerText = correctedText;
                if (element === "rules")
                    setFlightRulesColor(document.getElementById("fsrules").innerText);
                elementtooltip.innerText = correctedReason;
                elementtooltip.style.visibility = "";

            }
            else if (fsElement.innerText !== correctedText) 
            {
                // Failed to fix
                failedToFix++;
                fsElement.style.color = "red";
                elementtooltip.innerText = correctedReason;
                elementtooltip.style.visibility = "";
            }
            else 
            {
                haveBeenFixed++;
                bumpSaveTotalMistakesFixed(failedToFix);
                fsElement.style.color = "black";
            }
        }
        else
        {
            // Make sure they didn't change one that was correct
            var fpElement = document.getElementById("fp" + element);
            if (fpElement.value !== fsElement.innerText) 
            {
                // Changed element that was correct
                failedToFix++;
                fsElement.style.color = "red";
            }
        }
    }

    // If nothing was to be fixed and nothing changed
    // then count it as a fix
    if (haveBeenFixed === numberToBeCorrected) 
    {
        if (numberToBeCorrected === 0) 
        {
            bumpSaveTotalMistakesPresented();
            bumpSaveTotalMistakesFixed(failedToFix);
        }
        bumpSaveTotalPlansCorrected();
        setupButtonsNextPlan();
    }
}
function setupButtonsNextPlan() 
{
    _btnNextPlan.disabled = false;
    _btnCheckmywork.disabled = true;
    _btnAmendPlan.disabled = true;
    _btnShowMe.disabled = true;
}
function getParameterByName(name, url)
{
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function request(uri, jsonIn, resp)
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', uri);
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert('Something went wrong.' + xhr.responseText);
            return;
        }
        let data = JSON.parse(xhr.responseText);
        resp(data);
    };
    xhr.send(JSON.stringify(jsonIn));
}