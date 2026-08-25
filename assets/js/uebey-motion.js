(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const selectors=['.section-heading','.section-kicker-row','.catalog-head','.why-copy','.benefit-list','.company-panel','.reseller-grid','.contact-grid'];
const mark=()=>document.querySelectorAll(selectors.join(',')).forEach(el=>{if(!el.classList.contains('um-ready'))el.classList.add('um-ready')});
mark();
if(reduce)document.querySelectorAll('.um-ready').forEach(x=>x.classList.add('um-in'));
else if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('um-in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'70px 0px -30px'});document.querySelectorAll('.um-ready').forEach(x=>io.observe(x))}
else document.querySelectorAll('.um-ready').forEach(x=>x.classList.add('um-in'));

if(fine&&!reduce){
 const hero=document.querySelector('.hero-visual');
 hero?.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;hero.style.transform=`rotateY(${(x*3.2).toFixed(2)}deg) rotateX(${(-y*2.4).toFixed(2)}deg) translateY(-2px)`},{passive:true});
 hero?.addEventListener('pointerleave',()=>hero.style.transform='',{passive:true});
 document.querySelectorAll('.metal-panel').forEach(p=>p.addEventListener('pointermove',e=>{const r=p.getBoundingClientRect();p.style.setProperty('--mx',`${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);p.style.setProperty('--my',`${((e.clientY-r.top)/r.height*100).toFixed(1)}%`)},{passive:true}));
}

const enhanceProduct=card=>{if(card.dataset.umMotion)return;card.dataset.umMotion='1';if(fine&&!reduce){card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--ry',`${(x*3).toFixed(2)}deg`);card.style.setProperty('--rx',`${(-y*2.5).toFixed(2)}deg`)},{passive:true});card.addEventListener('pointerleave',()=>{card.style.setProperty('--ry','0deg');card.style.setProperty('--rx','0deg')},{passive:true})}};
document.querySelectorAll('.product-card').forEach(enhanceProduct);
const grid=document.querySelector('#productGrid');
if(grid&&'MutationObserver'in window)new MutationObserver(()=>grid.querySelectorAll('.product-card').forEach(enhanceProduct)).observe(grid,{childList:true,subtree:true});
})();
