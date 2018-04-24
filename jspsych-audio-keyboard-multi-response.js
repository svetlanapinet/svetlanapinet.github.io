/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["audio-keyboard-multi-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-keyboard-multi-response', 'stimulus', 'audio');

  plugin.info = {
    name: 'audio-keyboard-multi-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
//      target: {
//        type: jsPsych.plugins.parameterType.STRING,
//        pretty_name: 'Target',
//        default: undefined,
//        description: 'The target to be typed.'
//      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
      timing_response: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Time allowed for the response',
        default: 2000,
        description: 'The time between the beep and the boop that marks the deadline.'
      },      
      timing_after_response: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Time after boop deadline',
        default: 500,
        description: 'The amount of time in milliseconds between the boop that marks the deadline and the end of the trial.'
      },      
      visual_feedback: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name:'Whether to display something on the screen',
        options: ['no', 'word', 'aster','detec'],
        default: 'no',
        description: 'Determines the type of feedback displayed on the screen during typing'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

        var setTimeoutHandlers = [];
//    display_element.append('');
    /**
     * Function to make a beep. Adapted from {@link http://stackoverflow.com/a/29641185}.
     * @function makeBeep
     * @param {number} [duration=500] - The duration of the beep in milliseconds.
     * @param {number} [frequency=440] - The frequency of the beep in hertz. See [OscillatorNode.frequency]{@link https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/frequency}.
     * @param {number} [volume=1] - The volume of the beep. The value must be between 0 (muted) and 1 (full volume). See [GainNode.gain]{@link https://developer.mozilla.org/en-US/docs/Web/API/GainNode/gain}.
     * @param {string} [type=sine] - The shape of the waveform used to generate the beep. See [OscillatorNode.type]{@link https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/type}.
     * @param {Function} [callback] - A callback function to execute when the beep finishes.
     * @see [OscillatorNode]{@link https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode}
     * @see [GainNode]{@link https://developer.mozilla.org/en-US/docs/Web/API/GainNode}
     */
    var makeBeep = function(duration, frequency, volume, type, callback) {
      
      var oscillator = context.createOscillator();
      var gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      if (volume) { gainNode.gain.value = volume; }
      if (frequency) { oscillator.frequency.value = frequency; }
      if (type) { oscillator.type = type; }
      if (callback) { oscillator.onended = callback; }
      
      oscillator.start();
      
      // do not add this to setTimeoutHandlers
      // if this is cleared prematurely, the beep will go on forever
      setTimeout(function() { oscillator.stop(); }, (duration ? duration : 500));
      
    }
    
    // beep to start
    var beep = function() {
      makeBeep(100, 1000, 0.1, 'sine');
    }
    
    // boop to end
    var boop = function() {
      makeBeep(100, 500, 0.1, 'sine');
      setTimeoutHandlers.push(setTimeout(function() { endTrial(); }, trial.timing_after_response));
    }
    


    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

    // set up end event if trial needs it

    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
         end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

    // show prompt if there is one
//    if (trial.prompt !== null && trial.visual_feedback === 'no') {
//      display_element.innerHTML = trial.prompt;
//    }

    // show feedback on screen if option was selected
//    if (trial.visual_feedback !== 'no') {
        display_element.innerHTML = '';
        var detec_element = document.createElement('p');
        detec_element.style.fontSize = '26px';
        detec_element.id = 'detec-elem';
        detec_element.style.fontFamily = 'Courier';
//       detec_element.style.color = 'white';
//        detec_element.style.border = '5px'; //none
        detec_element.align = 'left';
        textinit = document.createTextNode("#");
        spaninit = document.createElement('span');
        spaninit.style.color = 'white';
        spaninit.appendChild(textinit);
        detec_element.append(spaninit);
        display_element.append(detec_element);
// find a way to align to text_element

        var text_element = document.createElement('input');
        display_element.append(text_element);

        text_element.id = 'jspsych-audio-keyboard-multi-response-feedback';
        text_element.name = 'response-feedback';
        if (trial.visual_feedback === 'no') {
          text_element.type = 'text';
          text_element.style.color = 'white';
      };
        if (trial.visual_feedback === 'word') {text_element.type = 'text'};
        if (trial.visual_feedback === 'aster') {text_element.type = 'password'};
        if (trial.visual_feedback === 'detec') {text_element.type = 'password'};
        text_element.autofocus = true;
        text_element.autocapitalize = false;
        text_element.spellcheck = false;
        text_element.style.border = 'none';
        text_element.style.fontSize = '26px';
        text_element.style.fontFamily = 'Courier';
        text_element.disabled = true;

//        text_element.focus();
//        text_element.addEventListener('input');
//    }

    // store response
//    var response = {
//      rt: null,
//      key: null
//    };
      var responseTimes = [];
      var responseTypingTimes = [];
      // array for response keys 
      var responseKeys = [];
      var finalKeys = "";
      var finalResp = "";

    // function to end trial when it is time
    function end_trial() {

      text = document.getElementById('jspsych-audio-keyboard-multi-response-feedback');
      finalResp = text.value;

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source.stop();
        source.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
      }

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
//      if(context !== null && response.rt !== null){
//       response.rt = Math.round(response.rt * 1000);
//      }
    var trial_data = {
        "rt": JSON.stringify(responseTimes),
        "stimulus": trial.stimulus,
        "key_press": JSON.stringify(responseKeys),
//        "tt": JSON.stringify(responseTypingTimes),
        "total_response": finalKeys,
        "final": finalResp,
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var target = trial.stimulus.substring(0,trial.stimulus.length-4);
    var bksp = 0;
    var lettercount = 0;

    // function to handle responses by the subject
    var after_response = function(info) {

      // only record the first response
//      if (response.key == null) {
//        response = info;
//      }
// construct arrays of RT, IKI and keys
        if (info.key !== null) {
          responseTimes.push(info.rt);
          finalKeys += jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key);
          responseKeys.push(info.key);

          if (trial.visual_feedback === 'detec'){
//          console.log(info.rt.length);
// creates something on top of the input but comparison doesn't work
          var counter = responseTimes.length;
//          var lettercount = 0;
//          console.log(counter);
//          console.log(info.key);
//          console.log(trial.target[counter-1]);
//          console.log(jsPsych.pluginAPI.compareKeys(info.key,trial.target[counter-1]));

// works for changing the 1 to a red #          
//          if (!jsPsych.pluginAPI.compareKeys(info.key,target[counter-1])){
//            document.getElementById('detec-elem').innerHTML = '#';
// eventually use textContent instead, more stable or whatever
//            detec_element.style.color = 'red';
//}

//          detec_element.append('#');

//            var new_element = document.createElement('div');
//            console.log(3);
//            detec_element.replace('1','#');
          var elem = document.getElementById('detec-elem');
          inhtml = document.getElementById('detec-elem').innerHTML;
          intext = document.getElementById('detec-elem').textContent;

          text = document.createTextNode("#");
          span = document.createElement('span');
          span.id = 'span'+lettercount;
          console.log(inhtml);
          console.log(intext);
          console.log(counter)
//          lettercount += 1;
          console.log(lettercount);
//          var lettercount = counter - 2*bksp;
//          console.log(lettercount);

          if (counter === 1) {document.getElementById('detec-elem').textContent = '';
          span.appendChild(text)
          elem.appendChild(span);
        };
          if (info.key == 8) {
//            document.getElementById('detec-elem').innerHTML = inhtml.substring(0,(inhtml.length - 1));
            prevspan = document.getElementById('span'+(lettercount-1));
            console.log('span'+(lettercount-1));
            prevspan.remove();
//            document.removeChild(prevspan);
//            text.textContent = '';
            bksp += 1;
            lettercount -= 1;
            console.log(lettercount);

//            var lettercount = counter - 2*bksp;
            } else {
              lettercount += 1;
              if (!jsPsych.pluginAPI.compareKeys(info.key,target[lettercount-1])){
            span.style.color = 'red';
            span.appendChild(text);
            elem.appendChild(span);
          } else {
            span.style.color = 'white'};
            span.appendChild(text);
            elem.appendChild(span);};

            console.log(lettercount);

//          text.style.color = '#ff0000';
// have more # with more errors? 
// find a way to have it aligned to the text below
//          } else {detec_element.append('\t')
        
        }


// computing IKI, maybe not necessary
//          var nt = responseTimes.length;        
//          if (nt === 1){
//            responseTypingTimes.push(0);
//          }else{
//            responseTypingTimes.push(info.rt - responseTimes[nt-2])
//          };


        };

// use a confirmation key?
      if (trial.response_ends_trial) {
        end_trial();
      }

// something to clear the display if using

    };

    // start audio
    if(context !== null){
      startTime = context.currentTime;
      source.start(startTime);
          source.onended = function() {
        audioEndTime = context.currentTime;
        // beep();
        getResponse();
      };
    } else {
      audio.play();
      source.onended = function() {
//      audioEndTime = context.currentTime;
        // beep();
      getResponse();
      };
    }

var getResponse = function() {
    // start the response listener
    if(context !== null) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'audio',
        persist: true,
        allow_held_key: false,
        audio_context: context,
        audio_context_start_time: startTime
      });
    } else {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: true,
        allow_held_key: false
      });
    }


      // start the beep
      beep();
      
//      var text_elem = document.getElementById('jspsych-audio-keyboard-multi-response-feedback');
      text_element.disabled = false;
      text_element.focus();

      // if trial is timed, start input timer
      if (trial.timing_response > 0) {
        setTimeoutHandlers.push(setTimeout(function() { boop(); }, trial.timing_response));
      }
    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };
  };

  return plugin;
})();
