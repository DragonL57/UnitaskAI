// Memory agent state for sleep-time frequency and step counting

export let sleepTimeFrequency = 3; // Default: run every 5 user messages
export let stepCounter = 0;

export function setSleepTimeFrequency(freq: number) {
  sleepTimeFrequency = freq;
}

export function incrementStepCounter() {
  stepCounter++;
}

export function resetStepCounter() {
  stepCounter = 0;
}

export function shouldRunSleepTimeAgent() {
  return stepCounter % sleepTimeFrequency === 0;
}
