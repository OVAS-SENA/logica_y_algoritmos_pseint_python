/**
 * SCORM 1.2 Wrapper API & Offline LocalStorage Fallback
 * Servicio Nacional de Aprendizaje - SENA · Centro Minero
 */
(function (global) {
  "use strict";

  var api = null;
  var isInitialized = false;
  var isStandalone = false;
  var startTime = new Date();
  var PREFIX = "ga3_ova_";

  function findAPI(win) {
    var attempts = 0;
    while (win && !win.API && win.parent && win.parent !== win && attempts < 10) {
      attempts++;
      win = win.parent;
    }
    return win && win.API ? win.API : null;
  }

  function getAPI() {
    try {
      api = findAPI(window);
      if (!api && window.opener) {
        api = findAPI(window.opener);
      }
    } catch (e) {
      api = null;
    }
    return api;
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(PREFIX + key, String(val));
    } catch (e) { /* sin almacenamiento disponible */ }
  }

  function safeGet(key) {
    try {
      return localStorage.getItem(PREFIX + key);
    } catch (e) {
      return null;
    }
  }

  function init() {
    if (isInitialized) return true;
    var lmsApi = getAPI();
    if (lmsApi) {
      try {
        var res = lmsApi.LMSInitialize("");
        if (res === "true" || res === true) {
          isInitialized = true;
          isStandalone = false;
          var currentStatus = lmsApi.LMSGetValue("cmi.core.lesson_status");
          if (!currentStatus || currentStatus === "not attempted") {
            lmsApi.LMSSetValue("cmi.core.lesson_status", "incomplete");
            lmsApi.LMSCommit("");
          }
          return true;
        }
      } catch (err) { /* caer a modo autónomo */ }
    }
    isStandalone = true;
    isInitialized = true;
    return true;
  }

  function formatTime(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = Math.floor(totalSeconds % 60);
    function pad(n) { return String(n).padStart(2, "0"); }
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  }

  function setScore(score, passed) {
    if (!isInitialized) init();
    var cleanScore = Math.max(0, Math.min(100, Math.round(score)));
    var status = passed ? "passed" : "failed";

    if (api && !isStandalone) {
      try {
        api.LMSSetValue("cmi.core.score.raw", String(cleanScore));
        api.LMSSetValue("cmi.core.score.min", "0");
        api.LMSSetValue("cmi.core.score.max", "100");
        api.LMSSetValue("cmi.core.lesson_status", status);
        api.LMSCommit("");
      } catch (e) { /* ignorar error de LMS */ }
    }
    safeSet("scorm_score", cleanScore);
    safeSet("scorm_status", status);
  }

  function setLessonStatus(status) {
    if (!isInitialized) init();
    if (api && !isStandalone) {
      try {
        api.LMSSetValue("cmi.core.lesson_status", status);
        api.LMSCommit("");
      } catch (e) { /* ignorar */ }
    }
    safeSet("scorm_status", status);
  }

  function finish() {
    if (!isInitialized) return;
    var elapsedSeconds = Math.round((new Date() - startTime) / 1000);
    var formatted = formatTime(elapsedSeconds);
    if (api && !isStandalone) {
      try {
        api.LMSSetValue("cmi.core.session_time", formatted);
        api.LMSCommit("");
        api.LMSFinish("");
      } catch (e) { /* ignorar */ }
    }
    isInitialized = false;
  }

  window.addEventListener("beforeunload", finish);

  global.ScormConnector = {
    init: init,
    setScore: setScore,
    setLessonStatus: setLessonStatus,
    finish: finish,
    isStandalone: function () { return isStandalone; },
    getSavedScore: function () { return safeGet("scorm_score"); }
  };
})(window);
