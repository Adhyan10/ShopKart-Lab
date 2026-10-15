const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Loads Razorpay Checkout once. Resolves false if the script is blocked or offline.
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
