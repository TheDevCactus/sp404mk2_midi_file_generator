var A=Object.defineProperty;var I=(t,e,n)=>e in t?A(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var h=(t,e,n)=>(I(t,typeof e!="symbol"?e+"":e,n),n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();function u(t,e){return t>Math.pow(2,e)-1}const d={unsigned_32_bit(t){if(u(t,32))throw new Error("Number would overflow");const e=new Uint8Array(4);return e[0]=t>>24,e[1]=t>>16,e[2]=t>>8,e[3]=t,e},unsigned_16_bit(t){if(u(t,16))throw new Error("Number would overflow");const e=new Uint8Array(2);return e[0]=t>>8,e[1]=t,e},variable_length(t){let e=[];do{let n=t&127;e.length>0&&(n|=128),e.unshift(n),t>>=7}while(t>0);return new Uint8Array(e)}};function M(t){let e=0;for(let n=0;n<t.length;n++)e+=t[n]<<n*8;return e}const U=6,N=8,y=480,f=8,p=16,E=67,C=141,m={note_off(t,e,n){const r=new Uint8Array(3);return r[0]=128|t,r[1]=e,r[2]=n,r},note_on(t,e,n){const r=new Uint8Array(3);return r[0]=144|t,r[1]=e,r[2]=n,r},polyphonic_key_pressure(t,e,n){const r=new Uint8Array(3);return r[0]=160|t,r[1]=e,r[2]=n,r},control_change(t,e,n){const r=new Uint8Array(3);return r[0]=176|t,r[1]=e,r[2]=n,r},program_change(t,e){const n=new Uint8Array(2);return n[0]=192|t,n[1]=e,n},channel_pressure(t,e){const n=new Uint8Array(2);return n[0]=208|t,n[1]=e,n},pitch_wheel_change(t,e){const n=new Uint8Array(3);return n[0]=224|t,n[1]=e&127,n[2]=e>>7&127,n}};function T(t){return t-C+E}function L(t){return{ticks_since_last_event:t[0],pad_pressed:t[1],bank:t[2],pitch:t[3]?T(t[3]):E,velocity:t[4],hold_time:M(t.slice(-2))}}function D(t){let e=[];return Object.entries(t.pattern_events).forEach(([n,r])=>{Object.entries(r).forEach(([i,a])=>{const s=F(0,1,y),o=B(a),l=new Uint8Array(s.length+o.length);l.set(s,0),l.set(o,s.length),e.push({data:l,bank:Number(n),pad:Number(i)})})}),e}class S{constructor(){h(this,"pattern_events");this.pattern_events={}}process_value(e){const n=e.slice(0,-p);let r=0;for(let a=0;a<n.length;a+=f){const s=n.slice(a,a+f),o=L(s);r+=o.ticks_since_last_event,Object.prototype.hasOwnProperty.call(this.pattern_events,o.bank)||(this.pattern_events[o.bank]={}),Object.prototype.hasOwnProperty.call(this.pattern_events[o.bank],o.pad_pressed)||(this.pattern_events[o.bank][o.pad_pressed]=[]);const l=this.pattern_events[o.bank][o.pad_pressed][-1];let _;l?_=r-l.v_time:_=r,console.log(o.pitch),this.pattern_events[o.bank][o.pad_pressed].push(b(_,m.note_on(1,o.pitch,o.velocity))),this.pattern_events[o.bank][o.pad_pressed].push(b(_+o.hold_time,m.note_off(1,o.pitch,o.velocity)))}if(e.slice(-p)[14]*(y*4)!==r)throw new Error("Amount of ticks present in patterns does not match the incoming patterns bar length")}}function b(t,e){return{v_time:t,event:e}}function O(t){return t.reduce((n,r)=>n+r.event.length+d.variable_length(r.v_time).length,0)}function P(t,e){return!0}function k(t,e){const n=d.unsigned_32_bit(e),r=new Uint8Array(N+e);switch(t){case 0:r[0]=77,r[1]=84,r[2]=104,r[3]=100;break;case 1:r[0]=77,r[1]=84,r[2]=114,r[3]=107;break;default:throw new Error("Attempted to create a midi chunk with a type which is unimplemented")}return r.set(n,4),r}function F(t,e,n){if(!P())throw new Error("Number of tracks not allowed for specified file format");const r=new Uint8Array(14);if(r.set(k(0,U)),r[8]=t>>8&255,r[9]=t&255,r.set(d.unsigned_16_bit(e),10),u(n,15))throw new Error("Ticks per quarter note would overflow the maximum 15 bits");return r.set(d.unsigned_16_bit(n),12),r}function B(t){const e=O(t),n=k(1,e);let r=8;return t.forEach(i=>{const a=d.variable_length(i.v_time);n.set(a,r),r+=a.length,n.set(i.event,r),r+=i.event.length}),n}const c={builder:null,current_pattern_reader:null};function R(t){if(!t.target)throw new Error("Failed to access event target");const e=t.target.files;if(!e)throw new Error("Files undefined on event target. make sure input is a file input type");const n=e[0].stream();c.current_pattern_reader=n.getReader()}function x(t,e){if(!t.target)throw new Error("Failed to access event target");const n=t.target.files;if(!n)throw new Error("Files undefined on event target. make sure input is a file input type");if(!n.length){e.disabled=!0;return}e.disabled=!1}async function j(t){c.builder=new S;let e=!1;for(;!e;){let{done:n,value:r}=await t.read();if(n){e=!0;continue}if(r===void 0)throw new Error("No value present while simultaneously not done with reading");c.builder.process_value(r)}}async function $(){if(!c.builder)throw new Error("Attempted to download midi files that are not built yet. make sure to build midi files before attempting to call this function");D(c.builder).forEach(e=>{if(Number(e.bank)===0&&Number(e.pad)===128)return;const n=document.createElement("a"),r=btoa(String.fromCharCode(...e.data));n.href=`data:audio/midi;base64,${r}`,n.download=`${e.bank}-${e.pad}.mid`,n.click()})}function H(t,e){t.addEventListener("mousedown",()=>{const n=document.createElement("input");n.type="file",n.addEventListener("change",R),n.addEventListener("change",r=>{x(r,e)}),n.click()}),e.addEventListener("mousedown",async()=>{if(!c.current_pattern_reader)throw new Error(`
        No current reader set, please make sure current_pattern_reader is set to a valid reader,
        you should really make sure that button is disabled if we somehow got here
      `);await j(c.current_pattern_reader),$()})}const w="pattern_file_upload",g="build_midi_files";function v(t){const e=document.getElementById(t);if(!e)throw new Error("Element not found, make sure ID's match and that the element is in the DOM");return e}function G(){document.querySelector("#app").innerHTML=`
    <img src="bg_img.png" width="600" id="bg_img" />
    <div id="outer_container">
      <div id="inner_container">
        <h2>SP404 Midi File Generator 0.1</h2>
        <button id="${w}">Upload Pattern Bin File</button>
        <button disabled id="${g}">Save As Midi Files</button>
        <div class="text_container" id="instructions_container">
          <h4>Usage</h4>
          <p>
            1: Click the "Upload Pattern Bin File" and select your pattern bin you wish to generate midi files for.
            <br/>
            <br/>
            2: Click the "Save As Midi Files" button.
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
  `,H(v(w),v(g))}G();
