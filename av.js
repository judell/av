/*
examples:
  <span class="arrow" onclick="nudge('end','sec',1)">
  <span class="arrow" onclick="nudge('start','min',-1)">
*/
function nudge(boundary, unit, amount) {

  var targetId = boundary + unit;
  var boundaryValue = getFieldValue(targetId) + amount;
  setField(targetId, boundaryValue);

  if ( amount === -1 ) {
    if ( boundaryValue < 0  && unit === 'min') {
      setField(targetId, 0);
    }
    if ( boundaryValue < 0  && unit === 'sec') {
        setField(targetId, 59);
        var otherTargetId = boundary + 'min';
        var minutes = getFieldValue(otherTargetId);
        minutes -= 1;
        setField(otherTargetId, (minutes<0) ? 0 : minutes);
    }
  }

  if ( boundary === 'start' ) {
    var { startmin, startsec } = getFieldValues();
    var start = minutesAndSecondsToSeconds(startmin, startsec);
    slider.noUiSlider.set([start,null]);
  }

  if ( boundary === 'end' ) {
    var { endmin, endsec } = getFieldValues();
    var end = minutesAndSecondsToSeconds(endmin, endsec);
    slider.noUiSlider.set([null,end]);
    setClipEnd(endmin, endsec);
  }

  updatePermalink();

}

function getCurrentMinSec(player) {
  var currentMin = Math.floor(player.currentTime/60);
  var currentSec = Math.floor(player.currentTime) - (currentMin * 60);
  return {
    currentMin: currentMin,
    currentSec: currentSec,
  }
}

function urlChange() {
  var url = getFieldValue('url');
  if ( isAudio() ) {
    location.href=`./audio.html?url=${url}`;
  }
  if ( isVideo() ) {
    location.href=`./video.html?url=${url}`;
  }
}

function getById(id) {
  return document.getElementById(id);
}

function getFieldValue(id) {
  var retVal = getById(id).value;
  if ( isNaN(retVal) ) {
    return retVal;
  }
  else {
    return parseInt(retVal);
  }
}

function updatePermalink() {
  var { url,
        startmin,
        startsec,
        endmin,
        endsec
        } = getFieldValues();

  var editorHref = `${mode}.html?url=${url}&startmin=${startmin}&startsec=${startsec}&endmin=${endmin}&endsec=${endsec}`;

  getById('permalinkHref').href = editorHref;

  var playbackStart = minutesAndSecondsToSeconds(startmin, startsec);
  var playbackEnd = minutesAndSecondsToSeconds(endmin, endsec);

  var playbackHref = `${url}#t=${playbackStart},${playbackEnd}`;

  getById('playbackHref').href = playbackHref;

}

function handleFieldChange(field) {
  console.log('fieldChange', field);
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var start = minutesAndSecondsToSeconds(startmin, startsec);
  var end = minutesAndSecondsToSeconds(endmin, endsec);
  slider.noUiSlider.set([start,end]);
  updatePermalink();
}

function getFieldValues() {
  var url = getFieldValue('url');

  var startmin = getFieldValue('startmin');
  startmin = parseNumber(startmin);

  var startsec = getFieldValue('startsec');
  startsec = parseNumber(startsec);

  var endmin = getFieldValue('endmin');
  endmin = parseNumber(endmin);

  var endsec = getFieldValue('endsec');
  endsec = parseNumber(endsec);

  return {
    url: url,
    startmin: startmin, 
    startsec: startsec,
    endmin: endmin, 
    endsec: endsec, 
  }
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
  getById('url').value = url;

  getById('startmin').value = startmin;
  getById('startsec').value = startsec;

  getById('endmin').value = endmin;

  getById('endsec').value = endsec;
}

function captureStart() {
  var { currentMin, currentSec } = getCurrentMinSec(player);
  getById('startmin').value = currentMin;
  getById('startsec').value = currentSec;
  updatePermalink();
}

function captureEnd() {
  var { currentMin, currentSec } = getCurrentMinSec(player);
  getById('endmin').value = currentMin;
  getById('endsec').value = currentSec;
  updatePermalink();
}

function playIntro() {
  pauseClip();
  var { startmin, startsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(startmin, startsec);
  player.currentTime = t;
  t += 3;
  var clipEnd = secondsToMinutesAndSeconds(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.play();
}

function playOutro() {
  var { endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(endmin, endsec);
  player.currentTime = t-3;
  var clipEnd = secondsToMinutesAndSeconds(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.play();
}

function playClip() {

  var control = getById('play-pause');
  control.setAttribute('onclick','pauseClip()');
  control.setAttribute('title','pause clip');
  control.innerHTML = '&#10074;&#10074;';

  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(startmin, startsec);
  setClipEnd(endmin, endsec);
  player.currentTime = t;
  player.play();
}

function pauseClip() {

  var control = getById('play-pause');
  control.setAttribute('onclick','playClip()');
  control.setAttribute('title','play clip');
  control.innerHTML = '&#9654;';

  player.pause();
}


function setPlayer() {

  var fields = getFieldValues();

  var player = getById('player');

  var source = getById('source');
  source.remove();
  source = document.createElement('source');
  source.id = 'source';
  source.src = getFieldValue('url');
  player.appendChild(source);

  var t = minutesAndSecondsToSeconds(fields.startmin, fields.startsec);
  player.currentTime = t;
}


function secondsToMinutesAndSeconds(seconds) {
  var min = parseInt(seconds / 60, 10);
  var sec = parseInt(seconds % 60);
  return { min, sec };
}

function minutesAndSecondsToSeconds(min, sec) {
  var seconds = (60 * min) + sec;
  return seconds;
}

function parseNumber (value) {
  return (! value) ? 0 : parseInt(value);
} 

function getStartAndEndSecs() {
  var { currentMin, currentSec } = getCurrentMinSec(player);

  var current = minutesAndSecondsToSeconds(currentMin, currentSec);
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  
  var start = minutesAndSecondsToSeconds(startmin, startsec);

  var end = minutesAndSecondsToSeconds(endmin, endsec);

  return {
    start:start,
    end:end,
  }

}

function adjustFields() {

  var start = getStartAndEndSecs().start;

  var end = getStartAndEndSecs().end;

  var { currentMin, currentSec } = getCurrentMinSec(player);

  if ( current <= end ) {
    getById('startmin').value = currentMin;
    getById('startsec').value = currentSec;
  }

  if ( current >= start ) {
    getById('endmin').value = currentMin;
    getById('endsec').value = currentSec;
  }

}

function gup(name, str) {
    if (! str) 
        str = window.location.href;
    else
        str = '?' + str;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(str);
;    if (results === null)
        return "";
    else
        return results[1];
}

/// -------------

var urlLabel = `
<p class="url-label">
<span class="label">url&nbsp;</span> <input size="80" onchange="urlChange();" id="url">
</p>`;

var backMin = 'title ="nudge back 1 minute"';
var backSec = 'title="nudge back 1 second"';

var forwardMin = 'title="nudge forward 1 minute"';
var forwardSec = 'title="nudge forward 1 second"';

var params = `
<div id="controls">

  <div id="start-controls">

    <div class="label">clip start</div>

    <span class="min-sec-controls">

    <span ${backMin} class="arrow left-arrow" onclick="nudge('start','min',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('startmin')" id="startmin">
    <span ${forwardMin} class="arrow right-arrow" onclick="nudge('start','min',1)">&#9654;</span>

    <span ${backSec} class="arrow left-arrow" onclick="nudge('start','sec',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('startsec')" id="startsec">
    <span ${forwardSec} class="arrow right-arrow" onclick="nudge('start','sec',1)">&#9654;</span>
    </span>

    <div class="capture"><a href="javascript:captureStart()">capture</a></div>

    <div class="play-intro-outro">
      <button onclick="playIntro()">play intro</button>
    </div>

  </div>

  <div>&nbsp;&nbsp;&nbsp;&nbsp;</div>

  <div id="end-controls">

    <div class="label">clip end</div>

    <span ${backMin} class="arrow left-arrow" onclick="nudge('end','min',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('endmin')" id="endmin">
    <span ${forwardMin} class="arrow right-arrow" onclick="nudge('end','min',1)">&#9654;</span>

    <span ${backSec} class="arrow left-arrow" onclick="nudge('end','sec',-1)">&#9664;</span>
    <input class="min-or-sec" onchange="handleFieldChange('endsec')" id="endsec">
    <span ${forwardSec} class="arrow right-arrow" onclick="nudge('end','sec',1)">&#9654;</span>

    <div class="capture"><a href="javascript:captureEnd()">capture</a></div>

    <div class="play-intro-outro">
      <button onclick="playOutro()">play outro</button>
    </div>

  </div>

</div>

<div id="end-clip">
  <span id="end-clip-min"></span>:<span id="end-clip-sec"></span>
</div>
`;

var permalink = `
permalinks: <a id="permalinkHref" href="">editor</a>, <a id="playbackHref" href="">playback</a> 
`;

getById('url-label').innerHTML = urlLabel;

getById('params').innerHTML = params;

getById('permalink').innerHTML = permalink;

var player = getById('player');

var url = gup('url');
getById('source').src = url;
getById('url').value = url;

var startmin = gup('startmin');
startmin = parseNumber(startmin);

var startsec = gup('startsec');
startsec = parseNumber(startsec);

var endmin = gup('endmin');
endmin = parseNumber(endmin);

var endsec = gup('endsec');
endsec = parseNumber(endsec);

setFields(url, startmin, startsec, endmin, endsec);

setClipEnd(endmin, endsec);

setPlayer();

var eStopPlayback = new Event('stop-playback');

document.body.addEventListener('stop-playback', function(e) {
  pauseClip();
  });

var init = function() {

  console.log('trying init');
  if ( player.readyState === 4 ) {
    console.log('proceeding init');
    clearInterval(waitForPlayer);
  }
  else {
    return;
  }

  var slider = getById('slider');

  var start = getStartAndEndSecs().start;

  var end = getStartAndEndSecs().end;
  if ( end === 0 ) {
    end = player.duration;
  }

  noUiSlider.create(slider, {
    start: [start, end],
    range: {
      'min': [ 0 ],
      'max': [ player.duration ]
    }
  });

  slider.noUiSlider.on('update', function(){
    var { url, endmin, endsec } = getFieldValues();

    var startSec = Math.floor(slider.noUiSlider.get()[0]);
    var start = secondsToMinutesAndSeconds(startSec);

    var endSec = Math.floor(slider.noUiSlider.get()[1]);
    var end = secondsToMinutesAndSeconds(endSec);

    setFields(url, start.min, start.sec, end.min, end.sec);

    updatePermalink();

    setPlayer();

    pauseClip();

    setTimeout(playClip, 500);

  });

  // duration

  var { min, sec } = secondsToMinutesAndSeconds(player.duration);

  var endmin = getFieldValue('endmin');
  var endsec = getFieldValue('endsec');

  if ( endmin === 0 && endsec === 0 ) {
    setField('endmin', min);
    setField('endsec', sec);
  }

  // doctitle

  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  var newtitle = `${url} from ${startmin}:${startsec} to ${endmin}:${endsec}`;
  var doctitle = document.querySelector('head title');
  doctitle.innerText = newtitle;

}

var waitForPlayer = setInterval(init, 500);

setInterval( function() {

  var { currentMin, currentSec } = getCurrentMinSec(player);

  getById('slider-start-min').innerText = currentMin;
  getById('slider-start-sec').innerText = currentSec.toString().padStart(2,'0');

  var current = minutesAndSecondsToSeconds(currentMin, currentSec);

  var { min, sec } = getClipEnd();
  var end = minutesAndSecondsToSeconds(min, sec);

  if ( current >= end ) {
    document.body.dispatchEvent(eStopPlayback);
  }

}, 500);




