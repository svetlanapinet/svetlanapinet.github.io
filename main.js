// https://github.com/jspsych/2015-jspsych-cogsci-tutorial

var timeline = [];

var hello_trial = {
    type: 'html-keyboard-response',
    stimulus: 'Welcome to the experiment !',
    prompt: 'Press a key to continue.',
    post_trial_gap: 500,
};

timeline.push(hello_trial);

var end_trial = {
    type: 'html-keyboard-response',
    stimulus: 'This is the end of the experiment!',
    prompt: 'Thank you :)',
    trial_duration: 2000,
    choices: jsPsych.NO_KEYS,
};

var instruct1 = {
    type: 'html-keyboard-response',
    stimulus: 'Fist task - no feedback',
    prompt: 'Press a key to continue.',
    post_trial_gap: 500,
};



var trial1 = {
    type: 'audio-keyboard-multi-response',
    stimulus: 'fighter.wav',
    prompt: '+',
    response_ends_trial: false,
    trial_duration: 3000,
    visual_feedback: 'no',
};



var instruct2 = {
    type: 'html-keyboard-response',
    stimulus: 'Second task - visual feedback',
    prompt: 'Press a key to continue.',
    post_trial_gap: 500,
};


var trial2 = {
    type: 'audio-keyboard-multi-response',
    stimulus: 'fighter.wav',
    prompt: '+',
    response_ends_trial: false,
    trial_duration: 3000,
    visual_feedback: 'word',
};


var instruct3 = {
    type: 'html-keyboard-response',
    stimulus: 'Third task - hidden feedback',
    prompt: 'Press a key to continue.',
    post_trial_gap: 500,
};

var trial3 = {
    type: 'audio-keyboard-multi-response',
    stimulus: 'fighter.wav',
    prompt: '+',
    response_ends_trial: false,
    trial_duration: 3000,
    visual_feedback: 'aster',
};


var instruct4 = {
    type: 'html-keyboard-response',
    stimulus: 'Fourth task - hidden feedback with detection',
    prompt: 'Press a key to continue.',
    post_trial_gap: 500,
};

var trial4 = {
    type: 'audio-keyboard-multi-response',
    stimulus: 'fighter.wav',
    prompt: '+',
    response_ends_trial: false,
    trial_duration: 3000,
    visual_feedback: 'detec',
//    data: {stim: 'fighter'}
};





var cat_trial = {
	type: 'categorize-html',
	stimulus: 'Did you make a mistake?',
	choices: [89, 78],
	key_answer: 89, 
	show_stim_with_feedback: false,
	correct_text: function() {
    var last_trial = jsPsych.data.get().last(1).select('final');
	console.log(last_trial);
    return last_trial.values[0];},
	incorrect_text: function() {
    var last_trial = jsPsych.data.get().last(1).select('final');
	console.log(last_trial);
    return last_trial.values[0];},
};


timeline.push(instruct1, trial1, cat_trial, instruct2, trial2, cat_trial, instruct3, trial3, cat_trial, instruct4, trial4, cat_trial)

timeline.push(end_trial);

jsPsych.init({
	timeline: timeline,
on_finish: function() {
    jsPsych.data.displayData('json');}
});

