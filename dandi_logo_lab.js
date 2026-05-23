/* DANDI · LOGO LAB · main JS */
var prog=document.getElementById('prog');
window.addEventListener('scroll',function(){
  prog.style.width=(window.scrollY/(document.body.scrollHeight-window.innerHeight)*100)+'%';
});

var ro=new IntersectionObserver(function(e){
  e.forEach(function(x){if(x.isIntersecting)x.target.classList.add('on')})
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(function(el){ro.observe(el)});

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
