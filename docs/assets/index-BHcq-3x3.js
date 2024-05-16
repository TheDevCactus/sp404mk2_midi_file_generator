var I=Object.defineProperty;var U=(e,t,n)=>t in e?I(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var f=(e,t,n)=>(U(e,typeof t!="symbol"?t+"":t,n),n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function _(e,t){return e>Math.pow(2,t)-1}const c={unsigned_32_bit(e){if(_(e,32))throw new Error("Number would overflow");const t=new Uint8Array(4);return t[0]=e>>24,t[1]=e>>16,t[2]=e>>8,t[3]=e,t},unsigned_16_bit(e){if(_(e,16))throw new Error("Number would overflow");const t=new Uint8Array(2);return t[0]=e>>8,t[1]=e,t},variable_length(e){let t=[];do{let n=e&127;t.length>0&&(n|=128),t.unshift(n),e>>=7}while(e>0);return new Uint8Array(t)}};function N(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n]<<n*8;return t}var v=(e=>(e[e.SingleTrack=0]="SingleTrack",e[e.SimultaneousTracks=1]="SimultaneousTracks",e[e.SequentialTracks=2]="SequentialTracks",e))(v||{});function p(e,t){return{v_time:e,event:t}}const m=480,w={note_off(e,t,n){const r=new Uint8Array(3);return r[0]=128|e,r[1]=t,r[2]=n,r},note_on(e,t,n){const r=new Uint8Array(3);return r[0]=144|e,r[1]=t,r[2]=n,r},polyphonic_key_pressure(e,t,n){const r=new Uint8Array(3);return r[0]=160|e,r[1]=t,r[2]=n,r},control_change(e,t,n){const r=new Uint8Array(3);return r[0]=176|e,r[1]=t,r[2]=n,r},program_change(e,t){const n=new Uint8Array(2);return n[0]=192|e,n[1]=t,n},channel_pressure(e,t){const n=new Uint8Array(2);return n[0]=208|e,n[1]=t,n},pitch_wheel_change(e,t){const n=new Uint8Array(3);return n[0]=224|e,n[1]=t&127,n[2]=t>>7&127,n}};function C(e,t){return!(e===0&&t!==1)}const L=8;function y(e,t){const n=c.unsigned_32_bit(t),r=new Uint8Array(L+t);switch(e){case 0:r[0]=77,r[1]=84,r[2]=104,r[3]=100;break;case 1:r[0]=77,r[1]=84,r[2]=114,r[3]=107;break;default:throw new Error("Attempted to create a midi chunk with a type which is unimplemented")}return r.set(n,4),r}const M=6;function D(e,t,n){if(!C(e,t))throw new Error("Number of tracks not allowed for specified file format");const r=new Uint8Array(14);if(r.set(y(0,M)),r[8]=e>>8&255,r[9]=e&255,r.set(c.unsigned_16_bit(t),10),_(n,15))throw new Error("Ticks per quarter note would overflow the maximum 15 bits");return r.set(c.unsigned_16_bit(n),12),r}function O(e){return e.reduce((n,r)=>n+r.event.length+c.variable_length(r.v_time).length,0)}function P(e){const t=O(e),n=y(1,t);let r=8;return e.forEach(i=>{const s=c.variable_length(i.v_time);n.set(s,r),r+=s.length,n.set(i.event,r),r+=i.event.length}),n}let h=null;function R(e){if(!e.target)throw new Error("Failed to access event target");const t=e.target.files;if(!t)throw new Error("Files undefined on event target. make sure input is a file input type");h=t[0].stream().getReader()}function B(e,t){if(!e.target)throw new Error("Failed to access event target");const n=e.target.files;if(!n)throw new Error("Files undefined on event target. make sure input is a file input type");if(!n.length){t.disabled=!0;return}t.disabled=!1}const b=8,g=16,E=67,x=141;function j(e){return e-x+E}function $(e){return{ticks_since_last_event:e[0],pad_pressed:e[1],bank:e[2],pitch:e[3]?j(e[3]):E,velocity:e[4],hold_time:N(e.slice(-2))}}class q{constructor(){f(this,"pattern_events");this.pattern_events={}}process_value(t){const n=t.slice(0,-g);let r=0;for(let s=0;s<n.length;s+=b){const a=n.slice(s,s+b),o=$(a);r+=o.ticks_since_last_event,Object.prototype.hasOwnProperty.call(this.pattern_events,o.bank)||(this.pattern_events[o.bank]={}),Object.prototype.hasOwnProperty.call(this.pattern_events[o.bank],o.pad_pressed)||(this.pattern_events[o.bank][o.pad_pressed]=[]);const l=this.pattern_events[o.bank][o.pad_pressed][-1];let d;l?d=r-l.v_time:d=r,console.log(o.pitch),this.pattern_events[o.bank][o.pad_pressed].push(p(d,w.note_on(1,o.pitch,o.velocity))),this.pattern_events[o.bank][o.pad_pressed].push(p(d+o.hold_time,w.note_off(1,o.pitch,o.velocity)))}if(t.slice(-g)[14]*(m*4)!==r)throw new Error("Amount of ticks present in patterns does not match the incoming patterns bar length")}build(){let t=[];return Object.entries(this.pattern_events).forEach(([n,r])=>{Object.entries(r).forEach(([i,s])=>{const a=D(v.SingleTrack,1,m),o=P(s),l=new Uint8Array(a.length+o.length);l.set(a,0),l.set(o,a.length),t.push({data:l,bank:Number(n),pad:Number(i)})})}),t}}let u;async function F(e){console.log("Reading file..."),u=new q;let t=!1;for(;!t;){let{done:n,value:r}=await e.read();if(n){t=!0;continue}if(r===void 0)throw new Error("No value present while simultaneously not done with reading");u.process_value(r)}}async function H(){if(!u)throw new Error("Attempted to download midi files that are not built yet. make sure to build midi files before attempting to call this function");u.build().forEach(t=>{if(Number(t.bank)===0&&Number(t.pad)===128)return;const n=document.createElement("a"),r=btoa(String.fromCharCode(...t.data));n.href=`data:audio/midi;base64,${r}`,n.download=`${t.bank}-${t.pad}.mid`,n.click()})}function G(e,t){e.addEventListener("mousedown",()=>{const n=document.createElement("input");n.type="file",n.addEventListener("change",R),n.addEventListener("change",r=>{B(r,t)}),n.click()}),t.addEventListener("mousedown",async()=>{if(!h)throw new Error(`
        No current reader set, please make sure current_pattern_reader is set to a valid reader,
        you should really make sure that button is disabled if we somehow got here
      `);await F(h),H()})}const k="pattern_file_upload",A="build_midi_files";document.querySelector("#app").innerHTML=`
 <img src="bg_img.png" width="600" id="bg_img" />
 <div id="outer_container">
  <div id="inner_container">
    <h2>SP404 Midi File Generator</h2>
    <button id="${k}">Upload Pattern Bin File</button>
    <button disabled id="${A}">Save As Midi Files</button>
    <div class="text_container" id="instructions_container">
      <h4>Usage</h4>
      <p>
        1: Click the "Upload Pattern Bin File" and select your pattern bin you wish to generate midi files for.
        <br/>
        <br/>
        2: Click the "Build Midi Files" button.
        <br/>
        <br/>
        3: Midi files names will be in the following format
        <br/>
        <br/>
        "{BANK_ID}_{PAD_ID}.mid"
        <br/>
        <br/>
        I know this is whack, Coming soon i'll allow for also uploading the .SMP files for your exported project which will allow for better naming of the exports.
      </p>
    </div>
    <hr />
    <div class="text_container" id="blurb">
      <p>
        Rolands application does export to midi but it exports all pads to one midi file which annoyed me while trying to get projects into a daw.
        So this project exports each pad as an individual midi pattern.
      </p>
    </div>
  </div>
 </div>
 <footer>
  <a href="https://buymeacoffee.com/morgan_brown">Throw me a dollar</a>
  <a href="https://thedevcactus.github.io/SamplerBlog/">$250 Sampler project</a>
  <a href="https://github.com/TheDevCactus/sp404mk2_midi_file_generator">My Github (sourcecode for this site)</a>
 </footer>
`;const T=document.querySelector(`#${k}`);if(!T)throw new Error("Failed to find the pattern file upload input. make sure ids match");const S=document.querySelector(`#${A}`);if(!S)throw new Error("Failed to find the pattern builders submit button. make sure ids match");G(T,S);
