const slides=document.querySelectorAll(".slide"),dots=document.querySelectorAll(".dot");
const nextBtn=document.querySelector(".right-arrow"),prevBtn=document.querySelector(".left-arrow");
let currentSlide=0,autoSlide,cartCountVal=0;
const EXCHANGE_RATE=83;
function showSlide(i){if(!slides||!slides.length)return;slides.forEach(s=>s.classList.remove("active"));dots.forEach(d=>d.classList.remove("active"));if(slides[i])slides[i].classList.add("active");if(dots[i])dots[i].classList.add("active")}
function nextSlide(){if(!slides||!slides.length)return;currentSlide=(currentSlide+1)%slides.length;showSlide(currentSlide)}
function prevSlide(){if(!slides||!slides.length)return;currentSlide=(currentSlide-1+slides.length)%slides.length;showSlide(currentSlide)}
function startSlider(){if(!slides||!slides.length)return;autoSlide=setInterval(nextSlide,5000)}
function restartSlider(){if(!slides||!slides.length)return;clearInterval(autoSlide);startSlider()}
startSlider();
if(nextBtn)nextBtn.addEventListener("click",()=>{nextSlide();restartSlider()});
if(prevBtn)prevBtn.addEventListener("click",()=>{prevSlide();restartSlider()});
dots.forEach((dot,i)=>dot.addEventListener("click",()=>{currentSlide=i;showSlide(currentSlide);restartSlider()}));

function getCart(){try{return JSON.parse(localStorage.getItem("velora_cart"))||[]}catch(e){return[]}}
function saveCart(c){localStorage.setItem("velora_cart",JSON.stringify(c))}
function addToCart(product,quantity){
  const cart=getCart(),idx=cart.findIndex(i=>i.id==product.id);
  const inrPrice=Math.round(product.price*EXCHANGE_RATE),dp=Math.round(product.discountPercentage||0);
  const cd=Math.round(inrPrice*(Math.round(dp/3||5)/100));
  const cc=document.getElementById("coupon-chk"),applied=cc?cc.checked:false;
  const fp=inrPrice-(applied?cd:0),img=product.images&&product.images.length>0?product.images[0]:product.thumbnail;
  if(idx>-1){cart[idx].quantity+=quantity;cart[idx].price=fp}
  else cart.push({id:product.id,title:product.title,price:fp,image:img,quantity,description:product.description||""});
  saveCart(cart);updateCartHeaderBadge();
}
function updateCartHeaderBadge(){
  const cart=getCart(),tc=cart.reduce((s,i)=>s+i.quantity,0);cartCountVal=tc;
  const b=document.getElementById("cart-badge");if(b)b.textContent=tc;
  document.querySelectorAll(".cart-icon span").forEach(el=>el.textContent=tc);
}
function showFeedbackToast(msg){
  let t=document.getElementById("velora-toast");
  if(!t){t=document.createElement("div");t.id="velora-toast";Object.assign(t.style,{position:"fixed",bottom:"30px",right:"30px",backgroundColor:"#000",color:"#fff",padding:"15px 30px",borderRadius:"30px",boxShadow:"0 10px 25px rgba(0,0,0,0.2)",zIndex:"10000",fontFamily:"inherit",fontSize:"14px",fontWeight:"bold",transition:"all 0.3s ease",opacity:"0",transform:"translateY(20px)"});document.body.appendChild(t)}
  t.textContent=msg;t.style.opacity="1";t.style.transform="translateY(0)";
  setTimeout(()=>{t.style.opacity="0";t.style.transform="translateY(20px)"},2500);
}

const WISHLIST_KEY='veloraWishlist_v1';
function getWishlist(){try{return JSON.parse(localStorage.getItem(WISHLIST_KEY))||[]}catch(e){return[]}}
function saveWishlist(w){localStorage.setItem(WISHLIST_KEY,JSON.stringify(w));updateWishlistBadge()}
function updateWishlistBadge(){const w=getWishlist();document.querySelectorAll('.wishlist-count, #wishlistBadge').forEach(el=>el.textContent=w.length)}
function isInWishlist(id){return getWishlist().some(i=>String(i.id)===String(id))}
function syncHearts(){document.querySelectorAll('.product-card[data-id]').forEach(card=>{const id=card.getAttribute('data-id'),btn=card.querySelector('.wishlist-btn'),icon=btn?btn.querySelector('i'):null;if(!btn||!icon)return;if(isInWishlist(id)){btn.classList.add('active');icon.className='fa-solid fa-heart';icon.style.color='#ff4b4b'}else{btn.classList.remove('active');icon.className='fa-regular fa-heart';icon.style.color=''}})}
function toggleWishlistForCard(card){const id=card.getAttribute('data-id');if(!id)return;let w=getWishlist();if(w.some(i=>String(i.id)===String(id))){w=w.filter(i=>String(i.id)!==String(id))}else{const imgEl=card.querySelector('.product-image img'),titleEl=card.querySelector('h3'),priceEl=card.querySelector('.price');w.push({id,img:imgEl?imgEl.src:'',title:titleEl?titleEl.textContent.trim():'',price:priceEl?priceEl.textContent.trim():''})}saveWishlist(w);syncHearts();renderWishlist()}

const wishlistOverlay=document.getElementById('wishlistOverlay'),wishlistModal=document.getElementById('wishlistModal'),wishlistGrid=document.getElementById('wishlistGrid'),wishlistEmpty=document.getElementById('wishlistEmpty'),wishlistCountText=document.getElementById('wishlistCount');
function renderWishlist(){const w=getWishlist();if(!wishlistGrid||!wishlistCountText||!wishlistEmpty)return;wishlistCountText.textContent=`${w.length} item${w.length===1?'':'s'}`;if(!w.length){wishlistGrid.innerHTML='';wishlistEmpty.style.display='block';return}wishlistEmpty.style.display='none';wishlistGrid.innerHTML=w.map(i=>`<article class="wishlist-card" data-id="${i.id}"><img src="${i.img}" alt="${i.title}"><div class="wishlist-card-body"><h3>${i.title}</h3><span>${i.price}</span><div class="wishlist-actions"><button class="wishlist-btn-action" data-id="${i.id}">ADD TO CART</button><button class="wishlist-btn-remove" data-id="${i.id}">REMOVE</button></div></div></article>`).join('')}
function openWishlistModal(){if(!wishlistOverlay||!wishlistModal)return;renderWishlist();wishlistOverlay.classList.add('show');wishlistModal.classList.add('show');document.body.style.overflow='hidden'}
function closeWishlistModal(){if(!wishlistOverlay||!wishlistModal)return;wishlistOverlay.classList.remove('show');wishlistModal.classList.remove('show');document.body.style.overflow='auto'}

document.querySelectorAll('#wishlistBtn').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();openWishlistModal()}));
if(wishlistOverlay)wishlistOverlay.addEventListener('click',closeWishlistModal);
const closeWishlist=document.getElementById('closeWishlist');if(closeWishlist)closeWishlist.addEventListener('click',closeWishlistModal);

if(wishlistGrid){
  wishlistGrid.addEventListener('click',async(e)=>{
    const rem=e.target.closest('.wishlist-btn-remove');
    if(rem){const id=rem.getAttribute('data-id');let w=getWishlist();w=w.filter(i=>String(i.id)!==String(id));saveWishlist(w);renderWishlist();syncHearts();return}
    const add=e.target.closest('.wishlist-btn-action');
    if(add){const id=add.getAttribute('data-id');const p=await fetchProductDetails(id);if(p)addToCart(p,1);showFeedbackToast('Added item to Cart!');renderWishlist()}
  });
}

document.addEventListener("click",async(e)=>{
  const wb=e.target.closest(".wishlist-btn");
  if(wb){const card=wb.closest(".product-card");if(card){toggleWishlistForCard(card);showFeedbackToast(wb.classList.contains("active")?"Item added to your Wishlist!":"Item removed from your Wishlist!")}return}
  const cb=e.target.closest(".cart-btn");
  if(cb){let inc=1,pid=null;const bb=cb.closest(".product-buy-box");
    if(bb){pid=new URLSearchParams(window.location.search).get("id");const q=document.getElementById("buy-box-qty");if(q)inc=parseInt(q.value,10)||1}
    else{const card=cb.closest(".product-card");if(card)pid=card.getAttribute("data-id")}
    if(pid){const p=await fetchProductDetails(pid);if(p)addToCart(p,inc)}
    const ot=cb.innerHTML;cb.innerHTML="✓ ADDED";cb.style.background="#16a34a";cb.style.color="#fff";
    showFeedbackToast(`Added ${inc} item(s) to Cart!`);
    setTimeout(()=>{cb.innerHTML=ot;cb.style.background="#000";cb.style.color="#fff"},1500);return}
  const bn=e.target.closest(".buy-now-btn");
  if(bn){let inc=1;const q=document.getElementById("buy-box-qty");if(q)inc=parseInt(q.value,10)||1;
    const pid=new URLSearchParams(window.location.search).get("id");
    if(pid){const p=await fetchProductDetails(pid);if(p)addToCart(p,inc)}
    const ot=bn.innerHTML;bn.innerHTML="✓ PROCESSING...";bn.style.background="#000";bn.style.color="#fff";
    showFeedbackToast(`Redirecting to Secure Checkout with ${inc} item(s)...`);
    setTimeout(()=>{bn.innerHTML=ot;bn.style.background="#fff";bn.style.color="#000";alert("Checkout Simulation Successful! Thank you for shopping with VELORA.")},1500);return}
  const th=e.target.closest(".thumb-img");
  if(th){const mi=document.getElementById("main-product-img"),ns=th.getAttribute("data-src");if(mi&&ns){mi.src=ns;document.querySelectorAll(".thumb-img").forEach(t=>t.classList.remove("active"));th.classList.add("active")}return}
  const pc=e.target.closest(".product-card");if(pc){const id=pc.getAttribute("data-id");if(id)window.location.href=`product.html?id=${id}`;return}
  const rc=e.target.closest(".recommend-card");if(rc){const id=rc.getAttribute("data-id");if(id)window.location.href=`product.html?id=${id}`;return}
  const src=e.target.closest(".search-result-card");if(src){const id=src.getAttribute("data-id");if(id)window.location.href=`product.html?id=${id}`;return}
});

const cartDrawer=document.querySelector(".cart-drawer"),cartOverlay=document.querySelector(".cart-overlay");
const cartIcon=document.querySelector(".cart-icon"),closeCartBtn=document.querySelector(".close-cart");
if(cartIcon&&cartDrawer&&cartOverlay)cartIcon.addEventListener("click",()=>{cartDrawer.classList.add("show");cartOverlay.classList.add("show");document.body.style.overflow="hidden"});
function closeCart(){if(cartDrawer&&cartOverlay){cartDrawer.classList.remove("show");cartOverlay.classList.remove("show");document.body.style.overflow="auto"}}
if(closeCartBtn)closeCartBtn.addEventListener("click",closeCart);
if(cartOverlay)cartOverlay.addEventListener("click",closeCart);
document.addEventListener("keydown",(e)=>{if(e.key==="Escape"){closeCart();closeWishlistModal()}});

const header=document.querySelector(".header");
window.addEventListener("scroll",()=>{if(header)header.style.boxShadow=window.scrollY>20?"0 10px 25px rgba(0,0,0,0.08)":"0 2px 10px rgba(0,0,0,0.05)"});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",function(e){const t=document.querySelector(this.getAttribute("href"));if(t){e.preventDefault();t.scrollIntoView({behavior:"smooth"})}}));
window.addEventListener("load",()=>{showSlide(0);syncHearts();updateWishlistBadge();updateCartHeaderBadge();console.log("VELORA Fashion Store Loaded Successfully 🚀")});

const searchBtn=document.getElementById("searchBtn"),searchOverlay=document.getElementById("searchOverlay");
const closeSearch=document.getElementById("closeSearch"),searchInput=document.querySelector(".search-box input"),searchRight=document.querySelector('.search-right');
const searchCategories = document.querySelector('.search-categories'), recommendedTitle = document.querySelector('.recommended-title'), recommendedProducts = document.querySelector('.recommended-products'), dressResults = document.getElementById('dressResults');

function showRecommended() {
  if (searchCategories) searchCategories.style.display = '';
  if (recommendedTitle) recommendedTitle.style.display = '';
  if (recommendedProducts) recommendedProducts.style.display = '';
  if (dressResults) { dressResults.classList.remove('active'); dressResults.style.display = 'none'; }
  const results = document.querySelector('.search-results'); if (results) results.remove();
}
async function showDressResults() {
  if (searchCategories) searchCategories.style.display = 'none';
  if (recommendedTitle) recommendedTitle.style.display = 'none';
  if (recommendedProducts) recommendedProducts.style.display = 'none';
  if (dressResults) { dressResults.classList.add('active'); dressResults.style.display = 'block'; }
  const results = document.querySelector('.search-results'); if (results) results.remove();

  const dg = dressResults ? dressResults.querySelector('.dress-grid') : null;
  if (dg) {
    dg.innerHTML = `<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px 0;"><div class="spinner" style="margin: 0 auto 10px;"></div><p>Loading dresses...</p></div>`;
    const dresses = await fetchCategoryProducts("womens-dresses");
    if (dresses && dresses.length > 0) {
      dg.innerHTML = dresses.map(createProductCardHTML).join("");
      syncHearts();
    } else {
      dg.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px 0;">No dresses found or failed to connect to API.</p>`;
    }
  }
}

if(searchBtn&&searchOverlay)searchBtn.addEventListener("click",()=>{searchOverlay.classList.add("show");showRecommended();if(searchInput)setTimeout(()=>searchInput.focus(),200)});
if(closeSearch&&searchOverlay)closeSearch.addEventListener("click",()=>{searchOverlay.classList.remove("show");if(searchInput)searchInput.value='';const r=document.querySelector('.search-results');if(r)r.remove()});

function renderSearchResults(query) {
  if (!searchRight) return;
  const r=document.querySelector('.search-results');if(r)r.remove();
  const q=(query||'').trim().toLowerCase();if(!q)return;
  const cards=Array.from(document.querySelectorAll('.product-card[data-id]'));
  const matches=cards.map(c=>({card:c,title:(c.querySelector('h3')?.textContent||'').trim()})).filter(m=>m.title.toLowerCase().includes(q));
  const res=document.createElement('div');res.className='search-results';
  res.style.cssText='padding:20px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;';
  if(!matches.length){res.innerHTML='<p>No results found.</p>';}
  else{res.innerHTML=matches.map(({card})=>{const img=card.querySelector('.product-image img')?.src||'',title=card.querySelector('h3')?.textContent||'',price=card.querySelector('.price')?.textContent||'',id=card.getAttribute('data-id')||'';return`<div class="search-result-card" data-id="${id}" style="border:1px solid #eee;border-radius:12px;overflow:hidden;background:#fff;cursor:pointer;"><img src="${img}" style="width:100%;height:180px;object-fit:cover;display:block;" alt="${title}"><div style="padding:12px;"><h4 style="margin:0 0 8px;font-size:16px;">${title}</h4><div style="font-weight:700;">${price}</div></div></div>`}).join('');}
  searchRight.appendChild(res);
}

if(searchInput)searchInput.addEventListener("input",(e)=>{
  const v=(e.target.value||'').trim().toLowerCase();
  if(!v){showRecommended();return}
  if(v==='d'||v==='dress'||v==='dresses'||v.includes('dress')){showDressResults();return}
  renderSearchResults(v);
});

document.querySelectorAll('.popular-tags button').forEach(btn => {
  btn.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = btn.textContent;
      searchInput.dispatchEvent(new Event('input'));
    }
  });
});

async function fetchCategoryProducts(cat){try{const r=await fetch(`https://dummyjson.com/products/category/${cat}`);if(!r.ok)throw new Error(r.status);return(await r.json()).products||[]}catch(e){return[]}}
function getRatingStarsHTML(r){const rr=Math.round(r||5);return'★'.repeat(rr)+'☆'.repeat(5-rr)}
function createProductCardHTML(p){
  const ip=Math.round(p.price*EXCHANGE_RATE);
  return`<div class="product-card" data-id="${p.id}"><div class="product-image"><img src="${p.thumbnail||p.images[0]}" alt="${p.title}"><button class="wishlist-btn"><i class="fa-regular fa-heart"></i></button></div><h3>${p.title}</h3><p class="price">₹${ip.toLocaleString('en-IN')}</p><div class="rating">${getRatingStarsHTML(p.rating)}</div><button class="cart-btn">ADD TO CART</button></div>`;
}
function createRecommendCardHTML(p){
  const ip=Math.round(p.price*EXCHANGE_RATE);
  return`<div class="recommend-card" data-id="${p.id}"><img src="${p.thumbnail||p.images[0]}" alt="${p.title}"><p>${p.title}</p><span>₹${ip.toLocaleString('en-IN')}</span></div>`;
}
async function fetchProductDetails(id){try{const r=await fetch(`https://dummyjson.com/products/${id}`);if(!r.ok)throw new Error(r.status);return await r.json()}catch(e){return null}}
function renderProductDetails(p){
  const ip=Math.round(p.price*EXCHANGE_RATE),dp=Math.round(p.discountPercentage||0),mrp=Math.round(ip/(1-dp/100));
  const fp=`₹${ip.toLocaleString('en-IN')}`,fm=`₹${mrp.toLocaleString('en-IN')}`,stars=getRatingStarsHTML(p.rating);
  const dd=new Date();dd.setDate(dd.getDate()+3);const fd=dd.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  const imgs=p.images&&p.images.length>0?p.images:[p.thumbnail];
  const thumbs=imgs.map((img,i)=>`<div class="thumb-img ${i===0?'active':''}" data-src="${img}"><img src="${img}" alt="${p.title} ${i+1}"></div>`).join("");
  return`<div class="product-gallery"><div class="main-image-wrapper"><img id="main-product-img" src="${imgs[0]}" alt="${p.title}"></div><div class="thumbnail-strip">${thumbs}</div></div>
<div class="product-info"><h1 class="product-title">${p.title}</h1><a href="#" class="product-brand">Visit the ${p.brand||'VELORA'} Store</a>
<div class="product-rating-stars"><span class="stars">${stars}</span><span class="rating-value">${p.rating||5} out of 5</span><a href="#" class="rating-link">(${p.reviews?p.reviews.length:12} customer reviews)</a></div><hr>
<div class="price-box"><div class="price-row"><span class="discount-badge">-${dp}%</span><span class="current-price">${fp}</span></div><div class="mrp-price">M.R.P.: <span>${fm}</span></div><p style="font-size:12px;color:#565959;margin-top:5px;">Inclusive of all taxes</p></div>
<div class="coupon-box"><input type="checkbox" id="coupon-chk"><label for="coupon-chk"><span class="coupon-label">Coupon</span> Apply ${Math.round(dp/3||5)}% coupon. <a href="#" style="color:#007185;text-decoration:none;">Details</a></label></div><hr>
<div class="offers-section"><h4><i class="fa-solid fa-tags" style="color:#ffa41c;margin-right:8px;"></i> Offers</h4><div class="offers-grid"><div class="offer-card"><strong>Cashback</strong> Upto ₹50 cashback as Velora Pay balance.</div><div class="offer-card"><strong>Bank Offer</strong> Upto ₹750 discount on select Credit Cards.</div><div class="offer-card"><strong>Partner Offers</strong> Buy 2 and get 10% off on qualifying items.</div></div></div>
<div class="services-row"><div class="service-item"><i class="fa-solid fa-money-bill-wave"></i><span>Pay on Delivery</span></div><div class="service-item"><i class="fa-solid fa-arrow-rotate-left"></i><span>${p.returnPolicy||'30 Days Returnable'}</span></div><div class="service-item"><i class="fa-solid fa-truck-fast"></i><span>${p.shippingInformation||'Ships in 3-5 days'}</span></div><div class="service-item"><i class="fa-solid fa-lock"></i><span>Secure Transaction</span></div></div><hr>
<div class="specs-table-container"><h4>Product Specifications</h4><table class="specs-table"><tr><td>Brand</td><td>${p.brand||'VELORA'}</td></tr><tr><td>Category</td><td>${p.category}</td></tr><tr><td>SKU</td><td>${p.sku||'N/A'}</td></tr><tr><td>Weight</td><td>${p.weight?p.weight+'g':'N/A'}</td></tr><tr><td>Dimensions</td><td>${p.dimensions?`${p.dimensions.width} x ${p.dimensions.height} x ${p.dimensions.depth} cm`:'N/A'}</td></tr><tr><td>Warranty</td><td>${p.warrantyInformation||'N/A'}</td></tr></table></div><hr>
<div style="margin-top:10px;"><h4 style="font-size:16px;margin-bottom:10px;color:#111;">About this item</h4><p style="font-size:14px;line-height:1.6;color:#333;">${p.description}</p></div></div>
<div class="product-buy-box"><div class="buy-box-price">${fp}</div><p class="delivery-info"><strong>FREE delivery</strong> by <strong>${fd}</strong>.</p><p class="delivery-info" style="font-size:12px;color:#565959;">Or fastest delivery <strong>Tomorrow</strong>. Order within <strong>53 mins</strong>.</p>
<p class="location-info"><i class="fa-solid fa-location-dot"></i> Delivering to Gurugram 122001 - Update location</p>
<h3 class="stock-status ${p.stock>0?'in-stock':'low-stock'}">${p.stock>0?'In stock':'Out of stock'}</h3>
<div class="qty-selector"><span>Quantity:</span><select id="buy-box-qty"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>
<div class="buy-box-btns"><button class="cart-btn">ADD TO CART</button><button class="buy-now-btn">BUY NOW</button></div>
<div class="buy-box-merchant"><table><tr><td>Ships from</td><td style="color:#333;">Velora</td></tr><tr><td>Sold by</td><td style="color:#333;">${p.brand||'VELORA'}</td></tr></table></div>
<button class="wishlist-btn"><i class="fa-regular fa-heart" style="margin-right:8px;"></i> Add to Wish List</button></div>`;
}
function setupProductDetailsListeners(p){
  const qs=document.getElementById("buy-box-qty"),cc=document.getElementById("coupon-chk");
  const bp=Math.round(p.price*EXCHANGE_RATE),dp=Math.round(p.discountPercentage||0),cd=Math.round(bp*(Math.round(dp/3||5)/100));
  function up(){const q=parseInt(qs?qs.value:1,10),ck=cc?cc.checked:false,cpu=bp-(ck?cd:0),tp=cpu*q;
    const cpe=document.querySelector(".price-box .current-price");if(cpe)cpe.textContent=`₹${cpu.toLocaleString('en-IN')}`;
    const bpe=document.querySelector(".buy-box-price");if(bpe)bpe.textContent=`₹${tp.toLocaleString('en-IN')}`}
  if(qs)qs.addEventListener("change",up);if(cc)cc.addEventListener("change",up);
  document.querySelectorAll(".offer-card").forEach(c=>{c.style.cursor="pointer";c.addEventListener("click",()=>{if(cc){cc.checked=!cc.checked;up();showFeedbackToast(`Coupon ${cc.checked?'Applied':'Removed'}!`)}})});
}
let catalogProducts=[];
async function initCatalogPage(){
  const dg=document.getElementById("dresses-grid-container");if(!dg)return;
  const cats=["womens-dresses","tops","womens-bags","womens-shoes","mens-shirts"];
  dg.innerHTML=`<div class="loading-state"><div class="spinner"></div><p>Loading premium collection...</p></div>`;
  try{const r=await Promise.all(cats.map(c=>fetchCategoryProducts(c)));catalogProducts=r.flat()}catch(e){dg.innerHTML=`<p style="grid-column:1/-1;text-align:center;color:red;">Failed to load collection.</p>`;return}
  setupCatalogListeners();applyFiltersAndSort();
}
function setupCatalogListeners(){
  const ftb=document.getElementById("filterToggleBtn"),fs=document.getElementById("filterSidebar"),fai=document.getElementById("filterAngleIcon");
  if(ftb&&fs)ftb.addEventListener("click",()=>{fs.classList.toggle("active");if(fai)fai.className=fs.classList.contains("active")?"fa-solid fa-angle-down":"fa-solid fa-angle-right"});
  const st=document.getElementById("sidebarTabs");
  if(st)st.addEventListener("click",(e)=>{const t=e.target.closest(".tab-item");if(!t)return;document.querySelectorAll("#sidebarTabs .tab-item").forEach(el=>el.classList.remove("active"));t.classList.add("active");document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));const ap=document.getElementById(`panel-${t.getAttribute("data-tab")}`);if(ap)ap.classList.add("active")});
  const tss=document.getElementById("topSortSelect"),ssr=document.getElementsByName("sidebar-sort");
  if(tss)tss.addEventListener("change",()=>{ssr.forEach(r=>{if(r.value===tss.value)r.checked=true});applyFiltersAndSort()});
  ssr.forEach(r=>r.addEventListener("change",()=>{if(r.checked){if(tss)tss.value=r.value;applyFiltersAndSort()}}));
  const ab=document.getElementById("sidebarApplyBtn");if(ab)ab.addEventListener("click",()=>{applyFiltersAndSort();showFeedbackToast("Filters applied!")});
  const clb=document.getElementById("sidebarClearBtn");
  if(clb)clb.addEventListener("click",()=>{document.querySelectorAll(".cat-filter").forEach(cb=>cb.checked=(cb.value==="womens-dresses"||cb.value==="tops"));document.querySelectorAll(".price-filter").forEach(cb=>cb.checked=false);document.querySelectorAll(".rating-filter").forEach(cb=>cb.checked=false);if(tss)tss.value="featured";ssr.forEach(r=>r.checked=(r.value==="featured"));applyFiltersAndSort();showFeedbackToast("Filters cleared.")});
}
function applyFiltersAndSort(){
  const dg=document.getElementById("dresses-grid-container"),cs=document.getElementById("filterCountSummary");if(!dg)return;
  const sc=Array.from(document.querySelectorAll(".cat-filter:checked")).map(c=>c.value);
  const sp=Array.from(document.querySelectorAll(".price-filter:checked")).map(c=>c.value);
  const sr=Array.from(document.querySelectorAll(".rating-filter:checked")).map(c=>parseInt(c.value,10));
  const tss=document.getElementById("topSortSelect"),sm=tss?tss.value:"featured";
  let f=catalogProducts.filter(p=>{
    if(sc.length>0&&!sc.includes(p.category))return false;
    const ip=Math.round(p.price*EXCHANGE_RATE);
    if(sp.length>0){let m=false;if(sp.includes("under-1000")&&ip<1000)m=true;if(sp.includes("1000-2000")&&ip>=1000&&ip<=2000)m=true;if(sp.includes("2000-5000")&&ip>=2000&&ip<=5000)m=true;if(sp.includes("above-5000")&&ip>5000)m=true;if(!m)return false}
    if(sr.length>0&&p.rating<Math.min(...sr))return false;return true;
  });
  const sorts={new:(a,b)=>b.id-a.id,"name-asc":(a,b)=>a.title.localeCompare(b.title),"name-desc":(a,b)=>b.title.localeCompare(a.title),"price-asc":(a,b)=>a.price-b.price,"price-desc":(a,b)=>b.price-a.price,"discount-desc":(a,b)=>(b.discountPercentage||0)-(a.discountPercentage||0)};
  if(sorts[sm])f.sort(sorts[sm]);
  if(cs)cs.textContent=`Showing ${f.length} Product${f.length===1?'':'s'}`;
  dg.innerHTML=f.length===0?`<div style="grid-column:1/-1;text-align:center;padding:60px 0;"><i class="fa-solid fa-circle-info" style="font-size:36px;color:#ccc;margin-bottom:10px;"></i><h3>No matching products found</h3><p style="color:gray;">Try relaxing your filters or clicking CLEAR.</p></div>`:f.map(createProductCardHTML).join("");
  syncHearts();
}
async function initDynamicProducts(){
  updateCartHeaderBadge();
  const dg=document.getElementById("dresses-grid-container"),rg=document.getElementById("recommended-products-grid");
  const fg=document.getElementById("featured-products-grid"),mg=document.getElementById("more-products-grid");
  const dc=document.getElementById("product-details-loader");
  if(dc){const id=new URLSearchParams(window.location.search).get("id");
    if(id){const p=await fetchProductDetails(id);if(p){document.title=`${p.title} - VELORA`;dc.innerHTML=renderProductDetails(p);setupProductDetailsListeners(p)}else dc.innerHTML=`<div style="text-align:center;padding:50px 0;"><p>Product not found.</p></div>`}
    else dc.innerHTML=`<div style="text-align:center;padding:50px 0;"><p>No product selected.</p></div>`}
  if(dg)await initCatalogPage();
  if(rg||fg||mg){const[d,s]=await Promise.all([fetchCategoryProducts("womens-dresses"),fetchCategoryProducts("mens-shirts")]);
    const all=[...d,...s];if(all.length>0){const fl=[...d.slice(0,2),...s.slice(0,2)],ml=[...d.slice(2,4),...s.slice(2,4)],rl=[...d.slice(4,5),...s.slice(4,5)];
    if(d.length>0&&s.length>0)rl.push(d[0]);
    if(fg&&fl.length>0)fg.innerHTML=fl.map(createProductCardHTML).join("");
    if(mg&&ml.length>0)mg.innerHTML=ml.map(createProductCardHTML).join("");
    if(rg&&rl.length>0)rg.innerHTML=rl.map(createRecommendCardHTML).join("")}}
  syncHearts();
}
document.addEventListener("DOMContentLoaded",initDynamicProducts);

/* ====== DRAG & DROP TO CART ====== */
(function(){
  const ddz=document.createElement("div");
  ddz.className="drag-drop-zone";ddz.id="dragDropZone";
  ddz.innerHTML=`<i class="fa-solid fa-bag-shopping"></i><span>Drop</span>`;
  document.body.appendChild(ddz);
  let ghost=null,draggedId=null;
  function makeDraggable(card){
    if(card.getAttribute("draggable")==="true")return;
    card.setAttribute("draggable","true");
    const hint=document.createElement("div");hint.className="drag-hint";hint.textContent="Drag to cart";
    card.style.position="relative";card.appendChild(hint);
    card.addEventListener("dragstart",(e)=>{
      draggedId=card.getAttribute("data-id");if(!draggedId){e.preventDefault();return}
      card.classList.add("dragging");ddz.classList.add("visible");
      ghost=document.createElement("div");ghost.className="drag-ghost";
      const img=card.querySelector(".product-image img"),title=card.querySelector("h3");
      if(img){const gi=document.createElement("img");gi.src=img.src;ghost.appendChild(gi)}
      if(title){const gs=document.createElement("span");gs.textContent=title.textContent;ghost.appendChild(gs)}
      document.body.appendChild(ghost);e.dataTransfer.setDragImage(ghost,70,70);
      e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",draggedId);
    });
    card.addEventListener("dragend",()=>{
      card.classList.remove("dragging");ddz.classList.remove("visible","drag-over");
      if(ghost){ghost.remove();ghost=null}draggedId=null;
    });
  }
  ddz.addEventListener("dragover",(e)=>{e.preventDefault();e.dataTransfer.dropEffect="move";ddz.classList.add("drag-over")});
  ddz.addEventListener("dragleave",()=>ddz.classList.remove("drag-over"));
  ddz.addEventListener("drop",async(e)=>{
    e.preventDefault();ddz.classList.remove("drag-over");
    const pid=e.dataTransfer.getData("text/plain");
    if(!pid)return;
    ddz.classList.add("drop-success");ddz.innerHTML=`<i class="fa-solid fa-check"></i><span>Added!</span>`;
    try{
      const p=await fetchProductDetails(pid);
      if(p)addToCart(p,1);
      if(typeof showFeedbackToast==="function")showFeedbackToast("Item dropped into cart!");
    }catch(err){}
    setTimeout(()=>{
      ddz.classList.remove("drop-success","visible");
      ddz.innerHTML=`<i class="fa-solid fa-bag-shopping"></i><span>Drop</span>`;
    },1200);
  });
  function scanCards(){document.querySelectorAll(".product-card[data-id]").forEach(makeDraggable)}
  const obs=new MutationObserver(scanCards);
  obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",scanCards);
})();
