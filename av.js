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

function getCurrentMinSec(player) {
  var currentMin = Math.floor(player.currentTime / 60);
  var currentSec = Math.floor(player.currentTime) - currentMin * 60;
  return {
    currentMin: currentMin,
    currentSec: currentSec
  };
}

function getCurrentTime(player) {
  return Math.floor(player.currentTime);
}

function isAudio() {
  return mode === "audio";
}

function isVideo() {
  return mode === "video";
}

function urlChange() {
  var url = getFieldValue("url");
  if (isAudio()) {
    location.href = `./audio.html?url=${url}`;
  }
  if (isVideo()) {
    location.href = `./video.html?url=${url}`;
  }
}

function getById(id) {
  return document.getElementById(id);
}

function getByClass(klass) {
  return document.querySelector(klass);
}

function getFieldValue(id) {
  var retVal = getById(id).value;
  if (isNaN(retVal)) {
    return retVal;
  } else {
    return parseInt(retVal);
  }
}

function updatePermalinks() {
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();

  var editorHref = `${mode}.html?url=${url}&startmin=${startmin}&startsec=${startsec}&endmin=${endmin}&endsec=${endsec}`;

  getById("permalinkHref").href = editorHref;

  var playbackStart = minsAndSecsToSecs(startmin, startsec);
  var playbackEnd = minsAndSecsToSecs(endmin, endsec);

  var playbackHref = `${url}#t=${playbackStart},${playbackEnd}`;

  getById("playbackHref").href = playbackHref;
}

function handleFieldChange(field) {
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var start = minsAndSecsToSecs(startmin, startsec);
  var end = minsAndSecsToSecs(endmin, endsec);
  slider.noUiSlider.set([start, end]);
  updatePermalinks();
}

function getFieldValues() {
  var url = getFieldValue("url");

  var startmin = getFieldValue("startmin");
  startmin = parseNumber(startmin);

  var startsec = getFieldValue("startsec");
  startsec = parseNumber(startsec);

  var endmin = getFieldValue("endmin");
  endmin = parseNumber(endmin);

  var endsec = getFieldValue("endsec");
  endsec = parseNumber(endsec);

  return {
    url: url,
    startmin: startmin,
    startsec: startsec,
    endmin: endmin,
    endsec: endsec
  };
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

function setFields(url, startmin, startsec, endmin, endsec) {
  getById("url").value = url;

  getById("startmin").value = startmin;
  getById("startsec").value = startsec;

  getById("endmin").value = endmin;
  getById("endsec").value = endsec;
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

function playIntro() {
  var { startmin, startsec } = getFieldValues();
  var t = minsAndSecsToSecs(startmin, startsec);
  player.currentTime = t;
  t += 3;
  var clipEnd = secsToMinsAndSecs(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.play();
}

function playOutro() {
  var { endmin, endsec } = getFieldValues();
  var t = minsAndSecsToSecs(endmin, endsec);
  player.currentTime = t - 3;
  var clipEnd = secsToMinsAndSecs(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.play();
}

function playClip() {
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minsAndSecsToSecs(startmin, startsec);
  setClipEnd(endmin, endsec);
  player.currentTime = t;
  player.play();
}

function pauseClip() {
  player.pause();
  var { endmin, endsec } = getFieldValues();
  setClipEnd(endmin, endsec);
}

function setPlayer() {
  var fields = getFieldValues();

  var player = getById("player");

  var source = getById("source");
  source.remove();
  source = document.createElement("source");
  source.id = "source";
  source.src = getFieldValue("url");
  player.appendChild(source);

  var t = minsAndSecsToSecs(fields.startmin, fields.startsec);
  player.currentTime = t;
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

function handleResize() {
  var appContainer = getByClass('.app-container');
  var playClipButtonWidth = getById('play-clip-button').offsetWidth;

  if ( mode === 'video' ) {
    var playerWidth = getById('player').offsetWidth;
    var slider = getById('slider');
    slider.style.width = playerWidth - playClipButtonWidth;
    appContainer.style.width = playerWidth;
  }

}

/* inactive
function colorizeUpperHandle() {
  var upperHandle = getByClass('.noUi-handle-upper');
  upperHandle.style['background-color'] = 'red';
}

function uncolorizeUpperHandle() {
  var upperHandle = getByClass('.noUi-handle-upper');
  upperHandle.style['background-color'] = 'white';
}
*/

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

/// -------------

var urlLabel = `
<p>
<span class="ui-text ui-label">url</span> <input size="60" onchange="urlChange();" id="url">
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
<a title="link to html5 player for this clip" id="playbackHref" href="">player</a>
</span> 
`;

getById("url-label").innerHTML = urlLabel;

getById("params").innerHTML = params;

getById("permalinks").innerHTML = permalinks;

var player = getById("player");

var url = gup("url");
getById("source").src = url;
getById("url").value = url;

var startmin = gup("startmin");
startmin = parseNumber(startmin);

var startsec = gup("startsec");
startsec = parseNumber(startsec);

var endmin = gup("endmin");
endmin = parseNumber(endmin);

var endsec = gup("endsec");
endsec = parseNumber(endsec);

setFields(url, startmin, startsec, endmin, endsec);

setClipEnd(endmin, endsec);

setPlayer();

/* inactive
var eStopPlayback = new Event("stop-playback");

document.body.addEventListener("stop-playback", function(e) {
  pauseClip();
});
*/

var awaitPlayerReady = function() {
  if (player.readyState === 4) {
    clearInterval(waitForPlayer);
    document.body.style.visibility = 'visible';
  } else {
    return;
  }

  var slider = getById("slider");

  var start = getStartAndEndSecs().start;

  var end = getStartAndEndSecs().end;
  if (end === 0) {
    end = player.duration;
  }

  var clipEnd = secsToMinsAndSecs(player.duration);
  setClipEnd(clipEnd.min, clipEnd.sec);

  noUiSlider.create(slider, {
    start: [start, end],
    range: {
      min: [0],
      max: [player.duration]
    }
  });

  slider.noUiSlider.on("update", function() {

    var { url, startmin, startsec, endmin, endsec } = getFieldValues();

    var sliderStartSec = Math.floor(slider.noUiSlider.get()[0]);
    var sliderStart = secsToMinsAndSecs(sliderStartSec);

    var sliderEndSec = Math.floor(slider.noUiSlider.get()[1]);
    var sliderEnd = secsToMinsAndSecs(sliderEndSec);

    setFields(
      url,
      sliderStart.min,
      sliderStart.sec,
      sliderEnd.min,
      sliderEnd.sec
    );

    updatePermalinks();
  });

  // duration

  var { min, sec } = secsToMinsAndSecs(player.duration);

  var endmin = getFieldValue("endmin");
  var endsec = getFieldValue("endsec");

  if (endmin === 0 && endsec === 0) {
    setField("endmin", min);
    setField("endsec", sec);
  }

  // doctitle

  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  var newtitle = `${url} from ${startmin}:${startsec} to ${endmin}:${endsec}`;
  var doctitle = document.querySelector("head title");
  doctitle.innerText = newtitle;

  handleResize();

};

var waitForPlayer = setInterval(awaitPlayerReady, 300);

setInterval(function() {
  var { currentMin, currentSec } = getCurrentMinSec(player);

  var current = minsAndSecsToSecs(currentMin, currentSec);

  var { min, sec } = getClipEnd();
  var end = minsAndSecsToSecs(min, sec);

  if (current >= end) {
    pauseClip();
  }

}, 500);

window.addEventListener('resize', handleResize);
