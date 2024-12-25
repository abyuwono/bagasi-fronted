import React from 'react';
import { FloatingWhatsApp } from 'react-floating-whatsapp';

const WhatsAppWidget = () => {
  return (
    <FloatingWhatsApp
      phoneNumber="61478884089"
      accountName="Bagasi Customer Support"
      allowClickAway={true}
      allowEsc={true}
      statusMessage="Online"
      chatMessage="Halo! 👋 Ada yang bisa kami bantu?"
      placeholder="Ketik pesan..."
    />
  );
};

export default WhatsAppWidget;
