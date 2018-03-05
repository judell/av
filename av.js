var player;

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

function urlChange() {
  var url = getUrlOrId();
  if (isAudio()) {
    location.href = `./audio.html?url=${url}`;
  }
  if (isVideo()) {
    location.href = `./video.html?url=${url}`;
  }
}

function playIntro() {
  var { startmin, startsec } = getFieldValues();
  var t = minsAndSecsToSecs(startmin, startsec);
  player.currentTime = t;
  t += introOutroSecs;
  var clipEnd = secsToMinsAndSecs(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.play();
}

function playOutro() {
  var { endmin, endsec } = getFieldValues();
  var t = minsAndSecsToSecs(endmin, endsec);
  player.currentTime = t - introOutroSecs;
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
  source.src = getFieldValue("url-or-id");
  player.appendChild(source);

  var t = minsAndSecsToSecs(fields.startmin, fields.startsec);
  player.currentTime = t;
}

getById("url-or-id-label").innerHTML = urlOrIdLabel;

getById("params").innerHTML = params;

var startmin = parseNumber(gup("startmin"));
var startsec = parseNumber(gup("startsec"));
var endmin = parseNumber(gup("endmin"));
var endsec = parseNumber(gup("endsec"));

setFields(startmin, startsec, endmin, endsec);

getById("permalinks").innerHTML = permalinks;

player = getById("player");

var url = gup("url");
getById("source").src = url;

setField('url-or-id', url);

setClipEnd(endmin, endsec);

setPlayer();

var playerReady = function() {
  document.body.style.visibility = 'visible';
  if (player.readyState === 4) {
    clearInterval(waitForPlayer);
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
    handleSliderUpdate();
  });

  var { min, sec } = secsToMinsAndSecs(player.duration);

  var endmin = getFieldValue("endmin");
  var endsec = getFieldValue("endsec");

  if (endmin === 0 && endsec === 0) {
    setField("endmin", min);
    setField("endsec", sec);
  }

  handleResize();

};

var waitForPlayer = setInterval(playerReady, 300);

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