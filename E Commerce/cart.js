let activeDiscountPercent = parseInt(localStorage.getItem("velora_discount_percent") || "0", 10);
let isGiftWrapSelected = localStorage.getItem("velora_gift_wrap") === "true";

function getCart(){try{return JSON.parse(localStorage.getItem("velora_cart"))||[]}catch(e){return[]}}
function saveCart(c){localStorage.setItem("velora_cart",JSON.stringify(c))}
function updateCartHeaderBadge(){const c=getCart(),tc=c.reduce((s,i)=>s+i.quantity,0);const b=document.getElementById("cart-badge");if(b)b.textContent=tc}

function renderCart(){
  const cart=getCart(),container=document.getElementById("cart-items-container"),countHeader=document.getElementById("cart-count-header");
  const subtotalEl=document.getElementById("cart-summary-subtotal"),taxEl=document.getElementById("cart-summary-tax"),totalEl=document.getElementById("cart-summary-total");
  const discountEl=document.getElementById("cart-summary-discount");
  const giftwrapEl=document.getElementById("cart-summary-giftwrap");

  updateCartHeaderBadge();if(!container)return;
  const totalItems=cart.reduce((s,i)=>s+i.quantity,0);
  if(countHeader)countHeader.textContent=`You have ${totalItems} item${totalItems===1?'':'s'} in your cart`;

  if(cart.length===0){
    container.innerHTML=`<div style="text-align:center;padding:50px 20px;"><i class="fa-solid fa-basket-shopping" style="font-size:48px;color:#ccc;margin-bottom:15px;"></i><h3>Your cart is empty</h3><p style="color:gray;margin:10px 0 25px;">Browse our collections and add items to your cart.</p><a href="index.html" style="display:inline-block;padding:12px 30px;background:#000;color:#fff;text-decoration:none;font-weight:bold;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#000'">Go Shopping</a></div>`;
    if(subtotalEl)subtotalEl.textContent="Subtotal : Rs 0";
    if(discountEl)discountEl.style.display="none";
    if(giftwrapEl)giftwrapEl.style.display="none";
    if(taxEl)taxEl.textContent="Tax : Rs 0";
    if(totalEl)totalEl.textContent="Total : Rs 0";
    return;
  }

  let html="",subtotal=0;
  cart.forEach((item,i)=>{
    const is=item.price*item.quantity;subtotal+=is;
    html+=`<div class="item" data-id="${item.id}"><img src="${item.image}" alt="${item.title}"><div class="details"><h3>${item.title}</h3><p>${item.description?item.description.substring(0,80)+'...':'Premium fashion item'}</p><span>Rs ${item.price.toLocaleString('en-IN')} each</span></div><div class="quantity"><span class="qty-btn dec-qty" data-id="${item.id}">-</span><span>${item.quantity}</span><span class="qty-btn inc-qty" data-id="${item.id}">+</span></div><div class="price"><h3>Rs ${is.toLocaleString('en-IN')}</h3><p class="remove-item-btn" data-id="${item.id}" style="color:#ef4444;font-weight:bold;">Remove</p></div></div>${i<cart.length-1?'<hr>':''}`;
  });
  container.innerHTML=html;

  // Calculate discount
  const discount=Math.round(subtotal*(activeDiscountPercent/100));
  if(discountEl){
    if(discount>0){
      discountEl.textContent=`Discount (${activeDiscountPercent}%): -Rs ${discount.toLocaleString('en-IN')}`;
      discountEl.style.display="block";
    }else{
      discountEl.style.display="none";
    }
  }

  // Calculate gift wrap
  const giftwrapCost=isGiftWrapSelected?50:0;
  if(giftwrapEl){
    if(isGiftWrapSelected){
      giftwrapEl.textContent=`Gift Wrapping: Rs ${giftwrapCost}`;
      giftwrapEl.style.display="block";
    }else{
      giftwrapEl.style.display="none";
    }
  }

  // Persist states
  localStorage.setItem("velora_discount_percent", activeDiscountPercent);
  localStorage.setItem("velora_gift_wrap", isGiftWrapSelected);

  // Subtotal after discount, plus gift wrap, and 5% GST
  const taxableAmount=Math.max(0,subtotal-discount+giftwrapCost);
  const tax=Math.round(taxableAmount*0.05);
  const grand=taxableAmount+tax;

  if(subtotalEl)subtotalEl.textContent=`Subtotal : Rs ${subtotal.toLocaleString('en-IN')}`;
  if(taxEl)taxEl.textContent=`Tax (GST 5%) : Rs ${tax.toLocaleString('en-IN')}`;
  if(totalEl)totalEl.textContent=`Total : Rs ${grand.toLocaleString('en-IN')}`;
}

document.addEventListener("DOMContentLoaded",()=>{
  renderCart();

  const container=document.getElementById("cart-items-container"),clearBtn=document.getElementById("cart-clear-btn"),checkoutBtn=document.getElementById("cart-checkout-btn");
  const giftWrapChk=document.getElementById("gift-wrap-checkbox");
  const applyPromoBtn=document.getElementById("apply-promo-btn");
  const promoInput=document.getElementById("promo-code-input");
  const promoStatus=document.getElementById("promo-status-msg");

  // Restore coupon display value if promo already applied
  if (promoInput && promoStatus) {
    if (activeDiscountPercent > 0) {
      promoInput.value = `VELORA${activeDiscountPercent}`;
      promoStatus.textContent = `Coupon VELORA${activeDiscountPercent} applied! ${activeDiscountPercent}% Discount applied.`;
      promoStatus.style.color = "#16a34a";
      promoStatus.style.display = "block";
    }
  }

  // Gift wrap listener
  if(giftWrapChk){
    giftWrapChk.checked=isGiftWrapSelected;
    giftWrapChk.addEventListener("change",(e)=>{
      isGiftWrapSelected=e.target.checked;
      renderCart();
    });
  }

  // Promo code listener
  if(applyPromoBtn && promoInput && promoStatus){
    applyPromoBtn.addEventListener("click",()=>{
      const val=promoInput.value.trim().toUpperCase();
      if(val==="VELORA10"){
        activeDiscountPercent=10;
        promoStatus.textContent="Coupon VELORA10 applied! 10% Discount applied.";
        promoStatus.style.color="#16a34a";
        promoStatus.style.display="block";
      }else if(val==="VELORA20"){
        activeDiscountPercent=20;
        promoStatus.textContent="Coupon VELORA20 applied! 20% Discount applied.";
        promoStatus.style.color="#16a34a";
        promoStatus.style.display="block";
      }else if(val===""){
        activeDiscountPercent=0;
        promoStatus.style.display="none";
      }else{
        activeDiscountPercent=0;
        promoStatus.textContent="Invalid Coupon Code.";
        promoStatus.style.color="#ef4444";
        promoStatus.style.display="block";
      }
      renderCart();
    });
  }

  if(container)container.addEventListener("click",(e)=>{
    const t=e.target,id=t.getAttribute("data-id");if(!id)return;
    let cart=getCart();const idx=cart.findIndex(i=>i.id==id);if(idx===-1)return;
    if(t.classList.contains("inc-qty")){if(cart[idx].quantity<10)cart[idx].quantity+=1}
    else if(t.classList.contains("dec-qty")){if(cart[idx].quantity>1)cart[idx].quantity-=1;else cart.splice(idx,1)}
    else if(t.classList.contains("remove-item-btn"))cart.splice(idx,1);
    saveCart(cart);renderCart();
  });

  if(clearBtn)clearBtn.addEventListener("click",()=>{if(confirm("Are you sure you want to clear your shopping cart?")){saveCart([]);renderCart()}});

  if(checkoutBtn)checkoutBtn.addEventListener("click",(e)=>{
    const cart=getCart();
    if(cart.length===0){
      e.preventDefault();
      alert("Your cart is empty! Please add some products before checking out.");
    }
  });
});
