import Script from "next/script";

/**
 * Widget chat Tawk.to (miễn phí, realtime).
 * Chỉ hiển thị khi đã cấu hình NEXT_PUBLIC_TAWK_PROPERTY_ID + NEXT_PUBLIC_TAWK_WIDGET_ID.
 * Lấy 2 mã này trong Tawk.to Dashboard → Administration → Channels → Chat Widget.
 */
export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
  if (!propertyId || !widgetId) return null;

  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
    </Script>
  );
}
