<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <img src="../../../assets/img/wegagen.png" 
               alt="Wegagen Bank" class="h-10 md:h-12" />
          <div class="hidden md:block h-8 w-px bg-slate-200"></div>
          <span class="hidden md:block text-[#003366] font-bold text-sm uppercase tracking-widest">
           Wegagen Payment  Acceptance
          </span>
        </div>
        <div class="flex items-center space-x-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2 rounded-full">
          <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>SECURE BANKING SESSION</span>
        </div>
      </div>
    </header>

    <section class="bg-[#003366] text-white py-16 px-6 text-center">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-black mb-4 leading-tight">Empower Change Across Ethiopia</h1>
        <p class="text-blue-100 text-lg opacity-80">Your donations are processed through Wegagen Bank's end-to-end encrypted gateway.</p>
      </div>
    </section>

    <main class="max-w-7xl mx-auto px-6 -mt-10 pb-20 flex-grow">
      <div v-if="!selectedNGO" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="ngo in merchants" :key="ngo.id" 
             class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
          <div class="h-48 overflow-hidden relative">
            <img :src="ngo.image" :alt="ngo.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#003366]">
              {{ ngo.category }}
            </div>
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-black text-slate-800 mb-2">{{ ngo.name }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-6">{{ ngo.description }}</p>
            <button @click="initiateDonation(ngo)" 
                    class="w-full bg-[#ef7d00] hover:bg-[#d67000] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all">
              Donate Now
            </button>
          </div>
        </div>
      </div>

      <div v-else class="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button @click="selectedNGO = null" class="mb-6 text-slate-400 hover:text-[#003366] font-bold text-sm flex items-center transition-colors">
          ← Back to Organizations
        </button>

        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div class="bg-[#003366] p-8 text-white text-center">
            <h2 class="text-xl font-bold tracking-tight">Secure Donation to {{ selectedNGO.name }}</h2>
            <p class="text-blue-200 text-[10px] uppercase tracking-[0.2em] mt-2">Verified Philanthropy Account</p>
          </div>

          <div v-if="loading" class="p-16 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef7d00] mx-auto mb-4"></div>
            <p class="text-slate-500 font-medium">Loading encryption layers...</p>
          </div>

          <form v-show="!loading" @submit.prevent="handlePayment" class="p-10 space-y-6">
            <div class="grid grid-cols-3 gap-3">
              <button v-for="amt in [500, 1000, 5000]" :key="amt" type="button"
                      @click="donationAmount = amt"
                      :class="donationAmount === amt ? 'bg-[#003366] text-white' : 'bg-slate-50 text-slate-500'"
                      class="py-3 rounded-xl font-bold border border-slate-100 transition-all">
                {{ amt }} ETB
              </button>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700 uppercase">Cardholder Name</label>
                <input type="text" v-model="cardholderName" placeholder="Full Name" required
                       class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none" />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700 uppercase">Card Number</label>
                <div id="number-container" class="h-[56px] w-full px-4 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#003366] flex items-center"></div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1 space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 uppercase text-center">MM / YYYY</label>
                  <div class="flex space-x-1">
                    <input type="text" v-model="expiryMonth" placeholder="MM" maxlength="2" class="w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm" />
                    <input type="text" v-model="expiryYear" placeholder="YY" maxlength="4" class="w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm" />
                  </div>
                </div>
                <div class="col-span-2 space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 uppercase">CVV</label>
                  <div id="securityCode-container" class="h-[56px] w-full px-4 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#003366]"></div>
                </div>
              </div>
            </div>

            <button type="submit" :disabled="processing" 
                    class="w-full py-5 bg-[#ef7d00] hover:bg-[#d67000] text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50">
              <span v-if="!processing">Confirm {{ donationAmount }} ETB Donation</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24"></svg>
                Encrypting...
              </span>
            </button>
            
            <div class="flex justify-center space-x-4 opacity-30 grayscale pt-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" class="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" class="h-4" />
            </div>
          </form>

          <div v-if="paymentStatus" class="p-6 border-t bg-slate-50">
             <div :class="paymentStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'" class="p-4 rounded-xl text-sm border">
               <p class="font-bold">{{ paymentStatus.title }}</p>
               <p class="text-xs opacity-80">{{ paymentStatus.message }}</p>
             </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-slate-200 py-12">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
        <div>
          <p class="text-[#003366] font-bold text-sm">Wegagen Bank Donoation Checkout</p>
          <p class="text-slate-400 text-xs mt-1">Empowering communities through secure digital giving.</p>
        </div>
        <div class="flex justify-center space-x-6 text-[10px] font-black text-slate-300">
          <span>PCI-DSS COMPLIANT</span>
          <span>SSL ENCRYPTED</span>
          <span>NBE LICENSED</span>
        </div>
        <div class="md:text-right">
          <p class="text-slate-400 text-[10px]">&copy; 2026 Wegagen Bank S.C. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const merchants = [
  { id: '001', name: 'Green Ethiopia', category: 'Environment', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400', description: 'Sustainable reforestation in Northern Ethiopia.' },
  { id: '002', name: 'Hope Education', category: 'Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', description: 'Digital literacy for rural primary schools.' },
  { id: '003', name: 'Clean Water', category: 'Health', image: 'https://images.unsplash.com/photo-1541544741938-0af808891447?w=400', description: 'Solar wells for drought-affected areas.' }
];

const selectedNGO = ref(null);
const loading = ref(false);
const processing = ref(false);
const donationAmount = ref(100);
const cardholderName = ref('');
const expiryMonth = ref('');
const expiryYear = ref('');
const paymentStatus = ref(null);
let microformInstance = null;

const initiateDonation = async (ngo) => {
  selectedNGO.value = ngo;
  loading.value = true;
  paymentStatus.value = null;
  
try {
  const response = await fetch(
    `${import.meta.env.VITE_APP_BASE_URL_LOCAL}/payments/generate-capture-context`,
    { method: 'POST' }
  );

  const jwt = await response.text();

  const payload = JSON.parse(
    atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
  );

  const context = payload.ctx[0].data;

  const script = document.createElement('script');
  script.src = context.clientLibrary;
  script.onload = () => {
    const flex = new window.Flex(jwt);

    microformInstance = flex.microform({
      styles: {
        input: {
          'font-size': '16px',
          'color': '#334155'
        }
      }
    });

    microformInstance
      .createField('number', { placeholder: '•••• •••• •••• ••••' })
      .load('#number-container');

    microformInstance
      .createField('securityCode', { placeholder: '•••' })
      .load('#securityCode-container');

    loading.value = false;
  };

  document.head.appendChild(script);

} catch (err) {
  loading.value = false;
  paymentStatus.value = {
    type: 'error',
    title: 'Security Load Failed',
    message: 'Could not establish secure session.'
  };
}
};

const handlePayment = () => {
  if (!microformInstance) return;
  processing.value = true;

  microformInstance.createToken(
    {
      expirationMonth: expiryMonth.value,
      expirationYear: expiryYear.value
    },
    async (err, token) => {
      if (err) {
        processing.value = false;
        paymentStatus.value = {
          type: 'error',
          title: 'Invalid Card',
          message: err.message
        };
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL_LOCAL}/payments/process-payment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transientToken: token,
              amount: donationAmount.value,
              targetNGO: selectedNGO.value.id
            })
          }
        );
 console.log("donation",res)
        const result = await res.json();

        if (res.ok) {
          paymentStatus.value = {
            type: 'success',
            title: 'Donation Received',
            message: `Thank you for supporting ${selectedNGO.value.name}.`,
            id: result.id
          };
        }
      } catch (e) {
        paymentStatus.value = {
          type: 'error',
          title: 'Network Error',
          message: 'Failed to reach banking server.'
        };
      } finally {
        processing.value = false;
      }
    }
  );
};
</script>

<style scoped>
:deep(iframe) { width: 100% !important; height: 100% !important; }
</style>