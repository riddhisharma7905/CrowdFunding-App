"use client";

import { useState, useEffect } from "react";

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector(`script[src="https://checkout.razorpay.com/v1/checkout.js"]`)) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Optional: Cleanup script if component unmounts quickly, but checkout typically stays on the page
    };
  }, []);

  return isLoaded;
}
