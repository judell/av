var introOutroSecs = 2;

var label;
if (mode === 'youtube') {
  label = 'id';
}
else {
  label = 'url';
}

var urlOrIdLabel = `
<p>
<span class="ui-text ui-label">${label}</span> <input size="60" onchange="urlChange();" id="url-or-id">
</p>`;

var backMin = 'title ="nudge back 1 minute"';
var backSec = 'title="nudge back 1 second"';

var forwardMin = 'title="nudge forward 1 minute"';
var forwardSec = 'title="nudge forward 1 second"';

var params = `
<div class="controls">

  <div class="av-control" id="start-controls">

    <div class="ui-label control-cluster-label">clip start</div>

    <span class="min-sec-controls">

    <span ${backMin} class="arrow left-arrow" onclick="nudge('start','min',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('startmin')" id="startmin">
    <span ${forwardMin} class="arrow right-arrow" onclick="nudge('start','min',1)">&#9654;</span>

    <span ${backSec} class="arrow left-arrow" onclick="nudge('start','sec',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('startsec')" id="startsec">
    <span ${forwardSec} class="arrow right-arrow" onclick="nudge('start','sec',1)">&#9654;</span>
    </span>

    <div class="button controls-button">
      <button onclick="captureStart()">capture</button>
      <button onclick="playIntro()">play intro</button>
    </div>

  </div>

  <div class="clip-controls-spacer"></div>
  
  <div class="av-control" id="end-controls">

    <div class="ui-label control-cluster-label">clip end</div>

    <span ${backMin} class="arrow left-arrow" onclick="nudge('end','min',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('endmin')" id="endmin">
    <span ${forwardMin} class="arrow right-arrow" onclick="nudge('end','min',1)">&#9654;</span>

    <span ${backSec} class="arrow left-arrow" onclick="nudge('end','sec',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('endsec')" id="endsec">
    <span ${forwardSec} class="arrow right-arrow" onclick="nudge('end','sec',1)">&#9654;</span>

    <div class="button controls-button">
       <button onclick="captureEnd()">capture</button>
       <button onclick="playOutro()">play outro</button>
    </div>

  </div>

</div>

<div class="end-clip">
  <span id="end-clip-min"></span>:<span id="end-clip-sec"></span>
</div>
`;

var permalinks = `
<span class="ui-link-label">
<a title="link to clip editor with these settings" id="permalinkHref" href="">editor</a>
<a target="_player" title="link to html5 player for this clip" id="playbackHref" href="">player</a>
</span> 
`;

/*
examples:
  <span class="arrow" onclick="nudge('end','sec',1)">
  <span class="arrow" onclick="nudge('start','min',-1)">
*/
function nudge(boundary, unit, amount) {
  var targetId = boundary + unit;
  var boundaryValue = getFieldValue(targetId) + amount;
  setField(targetId, boundaryValue);

  if (amount === -1) {
    if (boundaryValue < 0 && unit === "min") {
      setField(targetId, 0);
    }
    if (boundaryValue < 0 && unit === "sec") {
      setField(targetId, 59);
      var otherTargetId = boundary + "min";
      var minutes = getFieldValue(otherTargetId);
      minutes -= 1;
      setField(otherTargetId, minutes < 0 ? 0 : minutes);
    }
  }

  if (boundary === "start") {
    var { startmin, startsec } = getFieldValues();
    var start = minsAndSecsToSecs(startmin, startsec);
    slider.noUiSlider.set([start, null]);
    playIntro();
  }

  if (boundary === "end") {
    var { endmin, endsec } = getFieldValues();
    var end = minsAndSecsToSecs(endmin, endsec);
    slider.noUiSlider.set([null, end]);
    setClipEnd(endmin, endsec);
    playOutro();
  }

  updatePermalinks();
}
function isAudio() {
  return mode === "audio";
}

function isVideo() {
  return mode === "video";
}

function getById(id) {
  return document.getElementById(id);
}

function getByClass(klass) {
  return document.querySelector(klass);
}

function getUrlOrId() {
  return getById('url-or-id').value;
}

function getFieldValue(id) {
  var retVal = getById(id).value;
  if (isNaN(retVal)) {
    return retVal;
  } else {
    return parseInt(retVal);
  }
}

function handleFieldChange(field) {
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var start = minsAndSecsToSecs(startmin, startsec);
  var end = minsAndSecsToSecs(endmin, endsec);
  slider.noUiSlider.set([start, end]);
  updatePermalinks();
}

function updatePermalinks() {

  var { startmin, startsec, endmin, endsec } = getFieldValues();

  var playbackStart = minsAndSecsToSecs(startmin, startsec);
  var playbackEnd = minsAndSecsToSecs(endmin, endsec);

  var urlOrId = getUrlOrId();

  var param;

  var playbackHref;

  if ( mode === 'youtube')  {
    param = 'id'
    playbackHref = `https://youtube.com/embed/${urlOrId}?start=${playbackStart}&end=${playbackEnd}&autoplay=0`;    
  } 
  else {
    param = 'url';
    playbackHref = `${urlOrId}#t=${playbackStart},${playbackEnd}`;
  }

  getById("playbackHref").href = playbackHref;

  var editorHref = `${mode}.html?${param}=${urlOrId}&startmin=${startmin}&startsec=${startsec}&endmin=${endmin}&endsec=${endsec}`;

  getById("permalinkHref").href = editorHref;
}

function setClipEnd(min, sec) {
  getById('end-clip-min').innerText = min;
  getById('end-clip-sec').innerText = sec;
}

function getClipEnd() {
  return {
    min: parseNumber(getById('end-clip-min').innerText),
    sec: parseNumber(getById('end-clip-sec').innerText),
  }
}

function setField(id, value) {
  getById(id).value = value;
}

function captureStart() {
  var { currentMin, currentSec } = getCurrentMinSec(player);
  getById("startmin").value = currentMin;
  getById("startsec").value = currentSec;
  var start = minsAndSecsToSecs(currentMin, currentSec);
  slider.noUiSlider.set([start, null]);
  updatePermalinks();
  playClip();
}

function captureEnd() {
  var { currentMin, currentSec } = getCurrentMinSec(player);
  getById("endmin").value = currentMin;
  getById("endsec").value = currentSec;
  var end = minsAndSecsToSecs(currentMin, currentSec);
  slider.noUiSlider.set([null, end]);
  updatePermalinks();
  playOutro();
}

function secsToMinsAndSecs(seconds) {
  var min = parseInt(seconds / 60, 10);
  var sec = parseInt(seconds % 60);
  return { min, sec };
}

function minsAndSecsToSecs(min, sec) {
  var seconds = 60 * min + sec;
  return seconds;
}

function parseNumber(value) {
  return !value ? 0 : parseInt(value);
}

function getStartAndEndSecs() {
  var { currentMin, currentSec } = getCurrentMinSec(player);

  var current = minsAndSecsToSecs(currentMin, currentSec);
  var { startmin, startsec, endmin, endsec } = getFieldValues();

  var start = minsAndSecsToSecs(startmin, startsec);

  var end = minsAndSecsToSecs(endmin, endsec);

  return {
    start: start,
    end: end
  };
}

function getFieldValues() {
  return {
    startmin: parseNumber(getById('startmin').value),
    startsec: parseNumber(getById('startsec').value),
    endmin: parseNumber(getById('endmin').value),
    endsec: parseNumber(getById('endsec').value),
  };
}

function setFields(startmin, startsec, endmin, endsec) {
  getById("startmin").value = startmin;
  getById("startsec").value = startsec;
  getById("endmin").value = endmin;
  getById("endsec").value = endsec;
}

function adjustFields() {
  var start = getStartAndEndSecs().start;

  var end = getStartAndEndSecs().end;

  var { currentMin, currentSec } = getCurrentMinSec(player);

  if (current <= end) {
    getById("startmin").value = currentMin;
    getById("startsec").value = currentSec;
  }

  if (current >= start) {
    getById("endmin").value = currentMin;
    getById("endsec").value = currentSec;
  }
}

function handleSliderUpdate() {
    var { startmin, startsec, endmin, endsec } = getFieldValues();

    var sliderStartSec = Math.floor(slider.noUiSlider.get()[0]);
    var sliderStart = secsToMinsAndSecs(sliderStartSec);

    var sliderEndSec = Math.floor(slider.noUiSlider.get()[1]);
    var sliderEnd = secsToMinsAndSecs(sliderEndSec);

    setFields(
      sliderStart.min,
      sliderStart.sec,
      sliderEnd.min,
      sliderEnd.sec
    );

    setDocTitle();

    updatePermalinks();
}

function handleResize() {
  var appContainer = getByClass('.app-container');
  var playClipButtonWidth = getById('play-clip-button').offsetWidth;

  if ( mode === 'youtube' || mode === 'video' ) {
    var playerWidth = getById('player').offsetWidth;
    var slider = getById('slider');
    slider.style.width = playerWidth - playClipButtonWidth;
    appContainer.style.width = playerWidth;
  }

}

function setDocTitle() {
  var label = '';
  var paramName;
  if ( mode === 'youtube') {
    label = 'YouTube ';
    paramName = 'id';
  }
  else {
    paramName = 'url';
  }
  var paramVal = getUrlOrId();
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var newtitle = `${label}${paramVal} from ${startmin}:${startsec} to ${endmin}:${endsec}`;
  var doctitle = document.querySelector("head title");
  doctitle.innerText = newtitle;  
}

function gup(name, str) {
  if (!str) {
    str = window.location.href;
  }
  else {
    str = "?" + str;
  }
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(str);
  if (results === null) {
    return "";
  }
  else {
    return results[1];
  }
}
