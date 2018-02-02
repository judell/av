/*
examples:
  <span class="arrow" onclick="nudge('end','sec',1)">
  <span class="arrow" onclick="nudge('start','min',-1)">
*/
function nudge(boundary, unit, amount) {

  if ( boundary === 'start' && isStartLocked() ) {
    return;
  }

  if ( boundary === 'end' && isEndLocked() ) {
    return;
  }

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

  if ( isStartMode() ) {
    pauseCurrentParams();
  }
  else {
    pauseEndParams();
  }

}

function isAudio() {
  return ( mode === 'audio' );
}

function isVideo() {
  return ( mode === 'video' );
}

function getCurrentMinSec(player) {
  var currentMin = Math.floor(player.currentTime/60);
  var currentSec = Math.floor(player.currentTime) - (currentMin * 60);
  return {
    currentMin: currentMin,
    currentSec: currentSec,
  }
}

function getDuration(player) {
  return minutesAndSecondsFromSeconds(player.duration);
}

function getLockState() {
  return {
    startLocked: document.getElementById('startlocked').checked,
    endLocked: document.getElementById('endlocked').checked,
  }
}

function setLockState(id, isLocked) {
  document.getElementById(id).checked = isLocked;
  var controlsClass = ( id === 'startlocked' ) ? '.start-controls' : '.end-controls';
  document.querySelectorAll(controlsClass + ' .arrow').forEach(function(e) {
    e.style.color = isLocked ? "gray" : "black";
  })
}

function getRadioChecked() {
  return document.querySelector("input[name='radio']:checked");
}

function isStartMode() {
  var radio = getRadioChecked();
  return ( radio && radio.value === 'start' );
}

function isEndMode() {
  var radio = getRadioChecked();
  return ( radio && radio.value === 'end' );
}

function isStartLocked() {
  var { startLocked } = getLockState();
  return startLocked;
}

function isEndLocked() {
  var { endLocked } = getLockState();
  return endLocked;
}

function isBothLocked() {
  var {startLocked, endLocked } = getLockState();
  return ( startLocked === true && endLocked === true );
}

function seekStart() {
  var { startmin, startsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(startmin, startsec);
  player.currentTime = t;
}

function setArrowColor(controlsClass, color) {
  document.querySelectorAll(controlsClass).forEach(function(e) {
    e.style.color = color;
  });
}

function seekEnd() {
  var { endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(endmin, endsec);
  player.currentTime = t; 
}

function disableStartNudge() {
  var startCheckbox = document.getElementById('startlocked');
  startCheckbox.disabled = true;
}

function enableStartNudge() {
  var startCheckbox = document.getElementById('startlocked');
  startCheckbox.disabled = false;
  var endCheckbox = document.getElementById('endlocked');
  endCheckbox.checked = true;
  endLockChange();
}

function disableEndNudge() {
  var endCheckbox = document.getElementById('endlocked');
  endCheckbox.disabled = true;
}

function enableEndNudge() {
  var endCheckbox = document.getElementById('endlocked');
  endCheckbox.disabled = false;
  var startCheckbox = document.getElementById('startlocked');
  startCheckbox.checked = true;
  startLockChange();
}

function startLockChange() {
  var startCheckbox = document.getElementById('startlocked');
  if ( startCheckbox.checked ) {
    setArrowColor('.start-controls .arrow', 'gray');
  }
  else {
    setArrowColor('.start-controls .arrow', 'black');
  }

  if ( ! startCheckbox.checked ) {
    seekStart();
  }
}

function endLockChange() {
  var endCheckbox = document.getElementById('endlocked');
  if ( endCheckbox.checked ) {
    setArrowColor('.end-controls .arrow', 'gray');
  }
  else {
    setArrowColor('.end-controls .arrow', 'black');
  }

  if ( ! endCheckbox.checked ) {
    seekEnd();  
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

function radioChange() {
  var radioChecked = document.querySelector("input[name='radio']:checked").value;
  if ( radioChecked === 'start' ) {
    enableStartNudge();
    disableEndNudge();
    seekStart();
  }
  else {
    disableStartNudge();
    enableEndNudge();  
    seekEnd();
  }

}

function getFieldValue(id, value) {
  var retVal = document.getElementById(id).value;
  if ( isNaN(retVal) ) {
    return retVal;
  }
  else {
    return parseInt(retVal);
  }
}

function handleFieldChange() {
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

  var startlocked = document.getElementById('startlocked').checked;
  var endlocked = document.getElementById('endlocked').checked;

  return {
    url: url,
    startmin: startmin, 
    startsec: startsec,
    endmin: endmin, 
    endsec: endsec, 
    startlocked: startlocked,
    endlocked: endlocked,
  }
}

function setField(id, value) {
  document.getElementById(id).value = value;
}

function setFields(url, startmin, startsec, endmin, endsec, startlocked, endlocked) {
  document.getElementById('url').value = url;

  document.getElementById('startmin').value = startmin;
  document.getElementById('startsec').value = startsec;

  document.getElementById('endmin').value = endmin;
  document.getElementById('endsec').value = endsec;

  document.getElementById('startlocked').value = startlocked;
  document.getElementById('endlocked').value = endlocked;
}

function playCurrentParams() {
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  play(url, startmin, startsec, endmin, endsec);
  updatePermalink();
}

function pausePlayer() {
  player = document.getElementById('player');
  player.pause();
}

function pauseCurrentParams() {
  playCurrentParams();
  pausePlayer();
}

function pauseEndParams() {
  var { url, endmin, endsec } = getFieldValues();
  play(url, endmin, endsec, origEndMin, origEndSec);
  pausePlayer();  
}

function playIntro() {
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(startmin, startsec);
  t += 3;
  var end = secondsToMinutesAndSeconds(t);
  play(url, startmin, startsec, end.min, end.sec, true);
}

function playOutro() {
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(endmin, endsec);
  t -= 3;
  var start = secondsToMinutesAndSeconds(t);
  play(url, start.min, start.sec, endmin, endsec, true);
}


function updatePermalink() {
  var { url,
        startmin, 
        startsec,
        endmin, 
        endsec,
        startlocked,
        endlocked } = getFieldValues();

  var editorHref = `${mode}.html?url=${url}&startmin=${startmin}&startsec=${startsec}&endmin=${endmin}&endsec=${endsec}`;

  document.getElementById('permalinkHref').href = editorHref;

  var playbackStart = minutesAndSecondsToSeconds(startmin, startsec);
  var playbackEnd = minutesAndSecondsToSeconds(endmin, endsec);

  var playbackHref = `${url}#t=${playbackStart},${playbackEnd}`;

  document.getElementById('playbackHref').href = playbackHref;

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

function maybePause(player, endmin, endsec) {
  player.ontimeupdate = function() {
    if ( player.currentTime > minutesAndSecondsToSeconds(endmin, endsec) ) {
      player.pause();
    }
  }
}

function play(url, startmin, startsec, endmin, endsec, isIntro) {

  var player = document.getElementById('player');
  player.style["width"] = "100%";

  var source = document.getElementById('source');
  source.remove();

  source = document.createElement('source');
  source.id = 'source';
  source.src = url;
  player.appendChild(source);

  var t = minutesAndSecondsToSeconds(startmin, startsec);
  player.currentTime = t;

  player.volume = playerVolume;  

  player.onseeked = function () {
    adjustFields();
    maybePause(player, endmin, endsec);
    player.play();
  }

  player.play();
}

function adjustFields() {

  var { currentMin, currentSec } = getCurrentMinSec(player);

  var current = minutesAndSecondsToSeconds(currentMin, currentSec);

  var { startmin, startsec, endmin, endsec } = getFieldValues();
  
  var start = minutesAndSecondsToSeconds(startmin, startsec);

  var end = minutesAndSecondsToSeconds(endmin, endsec);

  if ( isStartMode() ) {
    if ( isStartLocked() ) {
      return;
    }
    if ( current <= end ) {
      document.getElementById('startmin').value = currentMin;
      document.getElementById('startsec').value = currentSec;
      updatePermalink();
    } 
  }

  if ( isEndMode() ) {
    if ( isEndLocked() ) {
      return;
    }
    if ( current >= start ) {
      document.getElementById('endmin').value = currentMin;
      document.getElementById('endsec').value = currentSec;
      updatePermalink();
    } 
  }

}

function captureStart() {
  var { currentMin, currentSec } = getCurrentMinSec(player);
  setField('startmin', currentMin);
  setField('startsec', currentSec);
}

function captureEnd() {
  var { currentMin, currentSec } = getCurrentMinSec(player);
  setField('endmin', currentMin);
  setField('endsec', currentSec);
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
    if (results === null)
        return "";
    else
        return results[1];
}

/// -------------

var urlLabel = `
<p class="url-label">
<span class="label">url&nbsp;</span> <input size="60" onchange="urlChange();" id="url">
</p>`;

var params = `
<table>

<tr>
  <td class="label"><input name="radio" value="start" type="radio" onchange="radioChange()">start</input>
  </td>
  <td class="start-controls">
    <table class="min-sec-controls">
      <tr>
        <td>
          <span class="unit">min</span>
        </td>
        <td>
           <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="startmin">
        </td>
        <td>
          <span class="arrow left-arrow" onclick="nudge('start','min',-1)">&#9664;</span>
        </td>
        <td>
          <span class="arrow right-arrow" onclick="nudge('start','min',1)">&#9654;</span>
        </td>
      </tr>
      <tr>
        <td>
          <span class="unit">sec</span>
        </td>
        <td>
          <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="startsec">
        </td>
        <td>
          <span class="arrow left-arrow" onclick="nudge('start','sec',-1)">&#9664;</span>
        </td>
        <td>
          <span class="arrow right-arrow" onclick="nudge('start','sec',1)">&#9654;</span>
        </td>
      </tr>
      <tr>
        <td class="capture" colspan="2"><a href="javascript:captureStart()">capture</a></td>
      </tr>
    </table>
  </td>
  <td class="locked">locked</div><div><input id="startlocked" disabled onchange="startLockChange()" type="checkbox"></div></td>
  <td><button onclick="playIntro()" id="play-clip-intro">play intro</button></td>
</tr>

<tr><td colspan="4"><hr></td></tr>

<tr>
  <td class="label"><input name="radio" value="end" type="radio" onchange="radioChange()">end</input></td>
  <td class="end-controls">
    <table class="min-sec-controls">
      <tr>
        <td>
          <span class="unit">min</span>
        </td>
        <td>
           <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="endmin">
        </td>
        <td>
          <span class="arrow left-arrow" onclick="nudge('end','min',-1)">&#9664;</span>
        </td>
        <td>
          <span class="arrow right-arrow" onclick="nudge('end','min',1)">&#9654;</span>
        </td>
      </tr>
      <tr>
      <td></td>
      </tr>
      <tr>
        <td>
          <span class="unit">sec</span>
        </td>
        <td>
          <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="endsec">
        </td>
        <td>
          <span class="arrow left-arrow" onclick="nudge('end','sec',-1)">&#9664;</span>
        </td>
        <td>
          <span class="arrow right-arrow" onclick="nudge('end','sec',1)">&#9654;</span>
        </td>
      </tr>
      <tr>
        <td class="capture" colspan="2"><a href="javascript:captureEnd()">capture</a></td>
      </tr>
    </table>
  </td>
  <td class="locked">locked</div><div><input id="endlocked" disabled onchange="endLockChange()" type="checkbox"></div></td>
  <td><button onclick="playOutro()" id="play-clip-outro">play outro</button></td>
</tr>


</table>`;

var permalink = `
<div class="permalink">
<p>
<a id="permalinkHref" href="">link</a> to av editor with these settings
</p>
<p>
<a id="playbackHref" href="">link</a> to player with these settings
</p>
</div>
`;

document.getElementById('url-label').innerHTML = urlLabel;

//document.getElementById('controls').innerHTML = controls;

document.getElementById('params').innerHTML = params;

document.getElementById('permalink').innerHTML = permalink;

var player = document.getElementById('player');

var url = gup('url');

var startmin = gup('startmin');
startmin = parseNumber(startmin);

var startsec = gup('startsec');
startsec = parseNumber(startsec);

var endmin = gup('endmin');
endmin = parseNumber(endmin);

var endsec = gup('endsec');
endsec = parseNumber(endsec);

setFields(url, startmin, startsec, endmin, endsec);

setLockState('startlocked', true);

setLockState('endlocked', true);

var origEndMin = 0;
var origEndSec = 0;

/*
 * wait for player to be ready to report duration, also wait for
 * doctitle to be adjusted, defer option to separate these concerns
 */
setTimeout( function() {

  // duration

  var { min, sec } = secondsToMinutesAndSeconds(player.duration);

  origEndMin = min;
  origEndSec = sec;
  
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
  
}, 500);

// adjust fields as playhead moves
setInterval( function() {

  if ( isBothLocked() ) {
    return;
  }

  adjustFields();

}, 250);

updatePermalink();

setTimeout(playCurrentParams, 200);



