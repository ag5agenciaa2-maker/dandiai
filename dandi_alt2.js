/* DANDI · ALT 2 HERITAGE · main JS */
document.body.classList.add('js');

var prog=document.getElementById('prog');
window.addEventListener('scroll',function(){
  prog.style.width=(window.scrollY/(document.body.scrollHeight-window.innerHeight)*100)+'%';
});

var ro=new IntersectionObserver(function(e){
  e.forEach(function(x){if(x.isIntersecting)x.target.classList.add('on')})
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv,.rvl,.rvr,.mf-quote').forEach(function(el){ro.observe(el)});

var sdots=document.querySelectorAll('.snav-dot');
var so=new IntersectionObserver(function(e){
  e.forEach(function(x){
    if(x.isIntersecting){
      var id=x.target.id;
      sdots.forEach(function(d){d.classList.toggle('active',d.dataset.s===id)})
    }
  })
},{threshold:.35});
document.querySelectorAll('section').forEach(function(s){so.observe(s)});
sdots.forEach(function(d){
  d.addEventListener('click',function(){
    var t=document.getElementById(d.dataset.s);
    if(t)t.scrollIntoView({behavior:'smooth'})
  })
});

(function(){
  var audio=document.getElementById('bg-audio');
  var btn=document.getElementById('audio-toggle');
  if(!audio||!btn)return;
  var label=btn.querySelector('span');
  var started=false;
  function setUI(p){if(p){label.textContent='SOUND ON';btn.classList.add('playing')}else{label.textContent='SOUND OFF';btn.classList.remove('playing')}}
  audio.addEventListener('loadedmetadata',function(){audio.currentTime=8});
  audio.addEventListener('ended',function(){audio.currentTime=8;audio.play()});
  function tryPlay(){
    if(audio.currentTime<8)audio.currentTime=8;
    var p=audio.play();
    if(p&&p.then){
      p.then(function(){started=true;setUI(true)}).catch(function(){
        setUI(false);
        document.addEventListener('click',firstClick,{once:true});
        document.addEventListener('keydown',firstClick,{once:true});
      });
    }
  }
  function firstClick(){
    if(started)return;
    if(audio.currentTime<8)audio.currentTime=8;
    audio.play().then(function(){started=true;setUI(true)}).catch(function(){});
  }
  if(audio.readyState>=2)tryPlay();
  else audio.addEventListener('canplay',tryPlay,{once:true});
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    if(audio.paused){
      if(audio.currentTime<8)audio.currentTime=8;
      audio.play().then(function(){started=true;setUI(true)}).catch(function(){});
    }else{audio.pause();setUI(false)}
  });
  setUI(false);
})();
