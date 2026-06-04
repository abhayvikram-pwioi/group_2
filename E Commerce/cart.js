function getCart(){try{return JSON.parse(localStorage.getItem("velora_cart"))||[]}catch(e){return[]}}
function saveCart(c){localStorage.setItem("velora_cart",JSON.stringify(c))}
function updateCartHeaderBadge(){const c=getCart(),tc=c.reduce((s,i)=>s+i.quantity,0);const b=document.getElementById("cart-badge");if(b)b.textContent=tc}
function renderCart(){
  const cart=getCart(),container=document.getElementById("cart-items-container"),countHeader=document.getElementById("cart-count-header");
  const subtotalEl=document.getElementById("cart-summary-subtotal"),taxEl=document.getElementById("cart-summary-tax"),totalEl=document.getElementById("cart-summary-total");
  updateCartHeaderBadge();if(!container)return;
  const totalItems=cart.reduce((s,i)=>s+i.quantity,0);
  if(countHeader)countHeader.textContent=`You have ${totalItems} item${totalItems===1?'':'s'} in your cart`;
  if(cart.length===0){
    container.innerHTML=`<div style="text-align:center;padding:50px 20px;"><i class="fa-solid fa-basket-shopping" style="font-size:48px;color:#ccc;margin-bottom:15px;"></i><h3>Your cart is empty</h3><p style="color:gray;margin:10px 0 25px;">Browse our collections and add items to your cart.</p><a href="index.html" style="display:inline-block;padding:12px 30px;background:#000;color:#fff;text-decoration:none;font-weight:bold;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#000'">Go Shopping</a></div>`;
    if(subtotalEl)subtotalEl.textContent="Subtotal : Rs 0";if(taxEl)taxEl.textContent="Tax : Rs 0";if(totalEl)totalEl.textContent="Total : Rs 0";return;
  }
  let html="",subtotal=0;
  cart.forEach((item,i)=>{
    const is=item.price*item.quantity;subtotal+=is;
    html+=`<div class="item" data-id="${item.id}"><img src="${item.image}" alt="${item.title}"><div class="details"><h3>${item.title}</h3><p>${item.description?item.description.substring(0,80)+'...':'Premium fashion item'}</p><span>Rs ${item.price.toLocaleString('en-IN')} each</span></div><div class="quantity"><span class="qty-btn dec-qty" data-id="${item.id}">-</span><span>${item.quantity}</span><span class="qty-btn inc-qty" data-id="${item.id}">+</span></div><div class="price"><h3>Rs ${is.toLocaleString('en-IN')}</h3><p class="remove-item-btn" data-id="${item.id}" style="color:#ef4444;font-weight:bold;">Remove</p></div></div>${i<cart.length-1?'<hr>':''}`;
  });
  container.innerHTML=html;
  const tax=Math.round(subtotal*0.05),grand=subtotal+tax;
  if(subtotalEl)subtotalEl.textContent=`Subtotal : Rs ${subtotal.toLocaleString('en-IN')}`;
  if(taxEl)taxEl.textContent=`Tax : Rs ${tax.toLocaleString('en-IN')}`;
  if(totalEl)totalEl.textContent=`Total : Rs ${grand.toLocaleString('en-IN')}`;
}
document.addEventListener("DOMContentLoaded",()=>{
  renderCart();
  const container=document.getElementById("cart-items-container"),clearBtn=document.getElementById("cart-clear-btn"),checkoutBtn=document.getElementById("cart-checkout-btn");
  if(container)container.addEventListener("click",(e)=>{
    const t=e.target,id=t.getAttribute("data-id");if(!id)return;
    let cart=getCart();const idx=cart.findIndex(i=>i.id==id);if(idx===-1)return;
    if(t.classList.contains("inc-qty")){if(cart[idx].quantity<10)cart[idx].quantity+=1}
    else if(t.classList.contains("dec-qty")){if(cart[idx].quantity>1)cart[idx].quantity-=1;else cart.splice(idx,1)}
    else if(t.classList.contains("remove-item-btn"))cart.splice(idx,1);
    saveCart(cart);renderCart();
  });
  if(clearBtn)clearBtn.addEventListener("click",()=>{if(confirm("Are you sure you want to clear your shopping cart?")){saveCart([]);renderCart()}});
  if(checkoutBtn)checkoutBtn.addEventListener("click",()=>{
    const cart=getCart();if(cart.length===0){alert("Your cart is empty! Please add some products before checking out.");return}
    const bt=checkoutBtn.textContent;checkoutBtn.disabled=true;checkoutBtn.textContent="Processing Checkout...";checkoutBtn.style.background="#555";
    setTimeout(()=>{alert("Secure checkout simulated successfully! Thank you for ordering from VELORA.");saveCart([]);renderCart();checkoutBtn.disabled=false;checkoutBtn.textContent=bt;checkoutBtn.style.background="#000"},1500);
  });
});
