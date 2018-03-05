var player;

var id = gup("id");

function getCurrentMinSec(player) {
  if (! player.getCurrentTime ) {
    return {
      currentMin: 0,
      currentSec: 0
    }
  }

  var currentMin = Math.floor(player.getCurrentTime() / 60);
  var currentSec = Math.floor(player.getCurrentTime()) - currentMin * 60;
  return {
    currentMin: currentMin,
    currentSec: currentSec
  };
}

function getCurrentTime(player) {
  return Math.floor(player.getCurrentTime());
}

function urlChange() {
  updatePermalinks();
  location.href = getById('permalinkHref').getAttribute('href');
}

function playIntro() {
  var { startmin, startsec } = getFieldValues();
  var t = minsAndSecsToSecs(startmin, startsec);
  player.seekTo(t);
  t += introOutroSecs;
  var clipEnd = secsToMinsAndSecs(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.playVideo();
}

function playOutro() {
  var { endmin, endsec } = getFieldValues();
  var t = minsAndSecsToSecs(endmin, endsec);
  player.seekTo(t - introOutroSecs);
  var clipEnd = secsToMinsAndSecs(t);
  setClipEnd(clipEnd.min, clipEnd.sec);
  player.playVideo();
}

function playClip() {
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minsAndSecsToSecs(startmin, startsec);
  setClipEnd(endmin, endsec);

  var startSeconds = minsAndSecsToSecs(startmin, startsec);
  var endSeconds = minsAndSecsToSecs(endmin, endsec);
  console.log('playing', startmin, startsec, endmin, endsec);
  player.seekTo(startSeconds);
  player.playVideo();
}

function pauseClip() {
  if ( ! player.pauseVideo ) {
    return;
  }

  player.pauseVideo();
  var { endmin, endsec } = getFieldValues();
  setClipEnd(endmin, endsec);
}

function YTinit() {

  getById("url-or-id-label").innerHTML = urlOrIdLabel;

  getById("params").innerHTML = params;

  var startmin = parseNumber(gup("startmin"));
  var startsec = parseNumber(gup("startsec"));
  var endmin = parseNumber(gup("endmin"));
  var endsec = parseNumber(gup("endsec"));

  var id = gup('id');

  setField('url-or-id', id);

  setFields(startmin, startsec, endmin, endsec);

  getById("permalinks").innerHTML = permalinks;

  document.body.style.visibility = 'visible';

  var slider = getById("slider");

  var { startmin, startsec, endmin, endsec } = getFieldValues();

  var end = minsAndSecsToSecs(endmin, endsec);
  if (end === 0) {
    end = player.getDuration();
    var endMinsAndSecs = secsToMinsAndSecs(end);
    endmin = endMinsAndSecs.min;
    endsec = endMinsAndSecs.sec;
    setFields(startmin, startsec, endmin, endsec);
  }

  var clipEnd = secsToMinsAndSecs(player.getDuration());
  setClipEnd(clipEnd.min, clipEnd.sec);

  var start = getStartAndEndSecs().start;
  var end = getStartAndEndSecs().end;

  noUiSlider.create(slider, {
    start: [start, end],
    range: {
      min: [0],
      max: [player.getDuration()]
    }
  });

  slider.noUiSlider.on("update", function() {
    handleSliderUpdate();
  });

  setInterval(function() {

    var { currentMin, currentSec } = getCurrentMinSec(player);

    var current = minsAndSecsToSecs(currentMin, currentSec);

    var { min, sec } = getClipEnd();
    var end = minsAndSecsToSecs(min, sec);

    if (current >= end) {
      pauseClip();
    }

  }, 500);

  handleResize();
}

window.addEventListener('resize', handleResize);
