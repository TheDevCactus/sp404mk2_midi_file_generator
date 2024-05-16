var I=Object.defineProperty;var S=(t,e,n)=>e in t?I(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var f=(t,e,n)=>(S(t,typeof e!="symbol"?e+"":e,n),n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function _(t,e){return t>Math.pow(2,e)-1}const l={unsigned_32_bit(t){if(_(t,32))throw new Error("Number would overflow");const e=new Uint8Array(4);return e[0]=t>>24,e[1]=t>>16,e[2]=t>>8,e[3]=t,e},unsigned_16_bit(t){if(_(t,16))throw new Error("Number would overflow");const e=new Uint8Array(2);return e[0]=t>>8,e[1]=t,e},variable_length(t){let e=[];do{let n=t&127;e.length>0&&(n|=128),e.unshift(n),t>>=7}while(t>0);return new Uint8Array(e)}};function U(t){let e=0;for(let n=0;n<t.length;n++)e+=t[n]<<n*8;return e}const N=6,C=8,p=480;var k=(t=>(t[t.SingleTrack=0]="SingleTrack",t[t.SimultaneousTracks=1]="SimultaneousTracks",t[t.SequentialTracks=2]="SequentialTracks",t))(k||{});function m(t,e){return{v_time:t,event:e}}const w={note_off(t,e,n){const r=new Uint8Array(3);return r[0]=128|t,r[1]=e,r[2]=n,r},note_on(t,e,n){const r=new Uint8Array(3);return r[0]=144|t,r[1]=e,r[2]=n,r},polyphonic_key_pressure(t,e,n){const r=new Uint8Array(3);return r[0]=160|t,r[1]=e,r[2]=n,r},control_change(t,e,n){const r=new Uint8Array(3);return r[0]=176|t,r[1]=e,r[2]=n,r},program_change(t,e){const n=new Uint8Array(2);return n[0]=192|t,n[1]=e,n},channel_pressure(t,e){const n=new Uint8Array(2);return n[0]=208|t,n[1]=e,n},pitch_wheel_change(t,e){const n=new Uint8Array(3);return n[0]=224|t,n[1]=e&127,n[2]=e>>7&127,n}};function L(t,e){return!(t===0&&e!==1)}function A(t,e){const n=l.unsigned_32_bit(e),r=new Uint8Array(C+e);switch(t){case 0:r[0]=77,r[1]=84,r[2]=104,r[3]=100;break;case 1:r[0]=77,r[1]=84,r[2]=114,r[3]=107;break;default:throw new Error("Attempted to create a midi chunk with a type which is unimplemented")}return r.set(n,4),r}function M(t,e,n){if(!L(t,e))throw new Error("Number of tracks not allowed for specified file format");const r=new Uint8Array(14);if(r.set(A(0,N)),r[8]=t>>8&255,r[9]=t&255,r.set(l.unsigned_16_bit(e),10),_(n,15))throw new Error("Ticks per quarter note would overflow the maximum 15 bits");return r.set(l.unsigned_16_bit(n),12),r}function D(t){return t.reduce((n,r)=>n+r.event.length+l.variable_length(r.v_time).length,0)}function O(t){const e=D(t),n=A(1,e);let r=8;return t.forEach(i=>{const s=l.variable_length(i.v_time);n.set(s,r),r+=s.length,n.set(i.event,r),r+=i.event.length}),n}let h=null;function P(t){if(!t.target)throw new Error("Failed to access event target");const e=t.target.files;if(!e)throw new Error("Files undefined on event target. make sure input is a file input type");h=e[0].stream().getReader()}function B(t,e){if(!t.target)throw new Error("Failed to access event target");const n=t.target.files;if(!n)throw new Error("Files undefined on event target. make sure input is a file input type");if(!n.length){e.disabled=!0;return}e.disabled=!1}const g=8,b=16,T=67,R=141;function x(t){return t-R+T}function j(t){return{ticks_since_last_event:t[0],pad_pressed:t[1],bank:t[2],pitch:t[3]?x(t[3]):T,velocity:t[4],hold_time:U(t.slice(-2))}}class ${constructor(){f(this,"pattern_events");this.pattern_events={}}process_value(e){const n=e.slice(0,-b);let r=0;for(let s=0;s<n.length;s+=g){const a=n.slice(s,s+g),o=j(a);r+=o.ticks_since_last_event,Object.prototype.hasOwnProperty.call(this.pattern_events,o.bank)||(this.pattern_events[o.bank]={}),Object.prototype.hasOwnProperty.call(this.pattern_events[o.bank],o.pad_pressed)||(this.pattern_events[o.bank][o.pad_pressed]=[]);const c=this.pattern_events[o.bank][o.pad_pressed][-1];let d;c?d=r-c.v_time:d=r,console.log(o.pitch),this.pattern_events[o.bank][o.pad_pressed].push(m(d,w.note_on(1,o.pitch,o.velocity))),this.pattern_events[o.bank][o.pad_pressed].push(m(d+o.hold_time,w.note_off(1,o.pitch,o.velocity)))}if(e.slice(-b)[14]*(p*4)!==r)throw new Error("Amount of ticks present in patterns does not match the incoming patterns bar length")}build(){let e=[];return Object.entries(this.pattern_events).forEach(([n,r])=>{Object.entries(r).forEach(([i,s])=>{const a=M(k.SingleTrack,1,p),o=O(s),c=new Uint8Array(a.length+o.length);c.set(a,0),c.set(o,a.length),e.push({data:c,bank:Number(n),pad:Number(i)})})}),e}}let u;async function H(t){console.log("Reading file..."),u=new $;let e=!1;for(;!e;){let{done:n,value:r}=await t.read();if(n){e=!0;continue}if(r===void 0)throw new Error("No value present while simultaneously not done with reading");u.process_value(r)}}async function q(){if(!u)throw new Error("Attempted to download midi files that are not built yet. make sure to build midi files before attempting to call this function");u.build().forEach(e=>{if(Number(e.bank)===0&&Number(e.pad)===128)return;const n=document.createElement("a"),r=btoa(String.fromCharCode(...e.data));n.href=`data:audio/midi;base64,${r}`,n.download=`${e.bank}-${e.pad}.mid`,n.click()})}function G(t,e){t.addEventListener("mousedown",()=>{const n=document.createElement("input");n.type="file",n.addEventListener("change",P),n.addEventListener("change",r=>{B(r,e)}),n.click()}),e.addEventListener("mousedown",async()=>{if(!h)throw new Error(`
        No current reader set, please make sure current_pattern_reader is set to a valid reader,
        you should really make sure that button is disabled if we somehow got here
      `);await H(h),q()})}const v="pattern_file_upload",y="build_midi_files";function E(t){const e=document.getElementById(t);if(!e)throw new Error("Element not found, make sure ID's match and that the element is in the DOM");return e}function K(){document.querySelector("#app").innerHTML=`
    <img src="bg_img.png" width="600" id="bg_img" />
    <div id="outer_container">
      <div id="inner_container">
        <h2>SP404 Midi File Generator 0.1</h2>
        <button id="${v}">Upload Pattern Bin File</button>
        <button disabled id="${y}">Save As Midi Files</button>
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
  `,G(E(v),E(y))}K();
