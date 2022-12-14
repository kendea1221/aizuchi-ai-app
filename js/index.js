//音声を検出する頻度を設定
const DETECTION_INTERVAL = 5;

//AIが相槌を打つ頻度を設定
const AIZUCHI_INTERVAL = 5000;

//AIの相槌の音声データ
const aizuchies = [
    { file: new Audio("./se/se_01.mp3"), word:"はい!"},
    { file: new Audio("./se/se_02.mp3"), word:"おおー"},
    { file: new Audio("./se/se_03.mp3"), word:"へー"},
    { file: new Audio("./se/se_04.mp3"), word:"ん？"},
    { file: new Audio("./se/se_05.mp3"), word:"あはは"},
    { file: new Audio("./se/se_06.mp3"), word:"ギャ---"}
];

//DOMと結合する
const state = new Proxy(
    { 
      gain: 0,
      detectionGain: 0,
      prevGain: 0,
      talking: false,
      aizuhing: false,
      message: null
    },
    {
      get: (obj, prop) => {
        if (prop === 'detectionGain') {
          obj.detectionGain = document.querySelector("#select").value;
          document.querySelector("#progress").max = obj[prop];
        }
        return obj[prop];
      },
      set: (obj, prop, value) => {
        if (prop === 'gain') {
          obj.prevGain = obj.gain;
          document.querySelector("#progress").value = value;
        }
        if (prop === 'detectionGain') {
          document.querySelector("#progress").max = value;
        }
        if (prop === 'message') {
          document.querySelector("#message").innerText = value;
        }
        if (prop === 'talking') {
          const text = value ? "会話検出中" : "会話未検出";
          document.querySelector("#talking").innerText = text;
        }
        obj[prop] = value;
        return true;
      }
    }
  );
  
  const enterFrame = (mic) => {
    state.gain = Utils.sum(mic.getByteFrequencyData());
    state.talking = state.gain > state.detectionGain;
    if (state.aizuhing) return;
// 直前に検出して今回検出していなければ相槌を打つ
    if ((state.gain < state.detectionGain)
      && (state.prevGain > state.detectionGain)) {
// ランダムで効果音を選んで再生
      aizuchi = aizuchies[Math.floor(Math.random()*aizuchies.length)]
      aizuchi.file.play();
      state.message = aizuchi.word;
      state.aizuhing = true;
      setTimeout(() => {
        state.aizuhing = false;
        state.message = null;
      }, AIZUCHI_INTERVAL);
    }
  }
  
  window.onload = () => {
    const audioManager = new AudioManager({
      fps: DETECTION_INTERVAL,
      useMicrophone: true,
      onEnterFrame: function() {
        enterFrame(this.analysers.mic);
      }
    }).init();
  };