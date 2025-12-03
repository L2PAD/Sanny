import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import api from '../utils/api';

const Footer = () => {
  const { t } = useLanguage();
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact/callback', callbackForm);
      toast.success(t('callbackRequested') || 'Запрос отправлен! Мы свяжемся с вами.');
      setCallbackForm({ name: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#121212] text-white mt-20">
      {/* Google Map Section */}
      <div className="w-full h-[400px] md:h-[500px] relative">
        <iframe
          title="Наше расположение"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.562920422844!2d30.520526315741807!3d50.44864997947381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce56b2456d3b%3A0x7abb4e2ca04e4e52!2z0YPQuy4g0JrRgNC10YnQsNGC0LjQuiwgMzYsINCa0LjQtdCyLCAwMjAwMA!5e0!3m2!1sru!2sua!4v1234567890123!5m2!1sru!2sua"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        ></iframe>
        
        {/* Map Overlay with Address */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl max-w-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-[#0071E3] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-[#121212] mb-1">Bazaar</h3>
              <p className="text-gray-700 text-sm mb-2">
                проспект Миколи Бажана, 24/1<br />
                Київ, Україна, 02149
              </p>
              <a
                href="https://www.google.com/maps/dir//проспект+Миколи+Бажана,+24/1,+Київ,+02149"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0071E3] hover:text-[#0051c3] text-sm font-semibold inline-flex items-center gap-1"
              >
                {t('getDirections')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Bazaar</h3>
            <p className="text-gray-400">
              {t('ctaDescription')}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contactInfo')}</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p>проспект Миколи Бажана, 24/1</p>
                  <p>Київ, Україна, 02149</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+380502474161" className="hover:text-[#0071E3]">
                    +380 (50) 247-41-61
                  </a>
                  <a href="tel:+380637247703" className="hover:text-[#0071E3]">
                    +380 (63) 724-77-03
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:dynamo1402om@gmail.com" className="hover:text-[#0071E3]">
                  dynamo1402om@gmail.com
                </a>
              </div>
              
              {/* Social Media */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold mb-3">Ми в соцмережах:</p>
                <div className="flex items-center gap-3">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://tiktok.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('workingHours')}</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('mondayFriday')}: 9:00 - 21:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('saturday')}: 10:00 - 20:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('sunday')}: 10:00 - 18:00</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir//проспект+Миколи+Бажана,+24/1,+Київ,+02149"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black">
                <MapPin className="w-4 h-4 mr-2" />
                {t('getDirections')}
              </Button>
            </a>
          </div>

          {/* Callback Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('requestCallback')}</h3>
            <form onSubmit={handleCallbackSubmit} className="space-y-3">
              <Input
                data-testid="callback-name"
                placeholder={t('yourName')}
                value={callbackForm.name}
                onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Input
                data-testid="callback-phone"
                type="tel"
                placeholder={t('yourPhone')}
                value={callbackForm.phone}
                onChange={(e) => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Textarea
                data-testid="callback-message"
                placeholder={t('yourMessage')}
                value={callbackForm.message}
                onChange={(e) => setCallbackForm({ ...callbackForm, message: e.target.value })}
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button
                data-testid="callback-submit"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {loading ? 'Отправка...' : t('send')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 Bazaar. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-white">Политика конфиденциальности</Link>
              <Link to="/" className="hover:text-white">Условия использования</Link>
              <Link to="/" className="hover:text-white">Контакты</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;