'use client';

import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';

interface Contact {
  name: string;
  phone: string;
}

interface ContactSectionProps {
  contacts?: Contact[];
}

export default function ContactSection({ contacts }: ContactSectionProps) {
  if (!contacts || contacts.length === 0) return null;

  const formatWhatsApp = (phone: string) => {
    // Remove all non-numeric characters (e.g. +, -, spaces)
    let cleaned = phone.replace(/\D/g, '');
    
    // If the user entered an international prefix (00), strip it
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    } 
    // If it's a local 10-digit number starting with 0, assume Sri Lanka (+94)
    else if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '94' + cleaned.substring(1);
    }
    
    return cleaned;
  };

  return (
    <section className="py-24 px-4 md:px-6 relative z-10 w-full flex flex-col items-center section-bg-contact">
      <div className="max-w-4xl w-full text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Contact Us</h2>
          <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-6" />
          <p className="font-sans text-charcoal/60 uppercase tracking-[4px] text-xs">Get in touch</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {contacts.map((contact, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-8 rounded-2xl border border-gold-light/20 flex flex-col items-center text-center shadow-sm w-full"
          >
            <h3 className="font-serif text-2xl text-charcoal mb-2">{contact.name}</h3>
            <p className="font-sans text-lg text-charcoal/80 mb-8">{contact.phone}</p>

            <div className="flex flex-col sm:flex-row gap-4 w-full mt-auto">
              <a
                href={`tel:${contact.phone}`}
                className="flex-1 flex justify-center items-center gap-2 py-3 rounded-full border border-gold text-charcoal hover:bg-gold/10 transition-colors shadow-sm"
              >
                <Phone size={16} /> Call
              </a>
              <a
                href={`https://wa.me/${formatWhatsApp(contact.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex justify-center items-center gap-2 py-3 rounded-full bg-[#25D366] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
