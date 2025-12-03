import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Instagram } from 'lucide-react';
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2541.8355344869385!2d30.62019931574054!3d50.419936679474754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c5c6e3d3b3b3%3A0x1234567890abcdef!2z0L_RgNC-0YHQv9C10LrRgiDQnNC40LrQvtC70Lgg0JHQsNC20LDQvdCwLCAyNC8xLCDQmtC40ZfQsiwg0KPQutGA0LDRl9C90LAsIDAyMTQ5!5e0!3m2!1suk!2sua!4v1234567890123!5m2!1suk!2sua"
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
              <h3 className="font-bold text-lg text-[#121212] mb-1">Y-store</h3>
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

      {/* Contact Info & Navigation Links */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Y-store</h3>
            <p className="text-gray-400">
              {t('ctaDescription')}
            </p>
          </div>

          {/* Contact Info */}
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
            </div>
          </div>

          {/* Delivery & Payment */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('deliveryPayment')}</h3>
            <div className="space-y-2">
              <Link to="/delivery-payment" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('deliveryInfo')}
              </Link>
              <Link to="/delivery-payment" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('paymentMethods')}
              </Link>
              <Link to="/delivery-payment" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('shippingCosts')}
              </Link>
              <Link to="/delivery-payment" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('fastDelivery')}
              </Link>
            </div>
          </div>

          {/* Exchange & Returns */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('exchangeReturn')}</h3>
            <div className="space-y-2">
              <Link to="/exchange-return" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('returnPolicy')}
              </Link>
              <Link to="/exchange-return" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('exchangeConditions')}
              </Link>
              <Link to="/exchange-return" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('warrantyService')}
              </Link>
              <Link to="/exchange-return" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('refundProcess')}
              </Link>
            </div>
          </div>

          {/* About Us & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('aboutCompany')}</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('aboutUs')}
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('contacts')}
              </Link>
              <Link to="/terms" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('privacyPolicy')}
              </Link>
              <Link to="/terms" className="block text-gray-300 hover:text-[#0071E3] transition-colors">
                {t('agreement')}
              </Link>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3">{t('followUs')}</p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://t.me/yourtelegram" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Telegram"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
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
                  href="viber://chat?number=%2B380502474161" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Viber"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.35.5C6.697.5 2.09 5.107 2.09 10.76c0 1.904.522 3.684 1.427 5.214L2 20.5l4.74-1.474c1.452.803 3.13 1.264 4.91 1.264 5.653 0 10.26-4.607 10.26-10.26C21.91 5.107 17.303.5 12.35.5zm5.8 13.96c-.226.634-1.132 1.165-1.85 1.314-.493.098-.947.442-3.206-.668-2.715-1.337-4.458-4.123-4.594-4.312-.136-.19-1.11-1.477-1.11-2.817 0-1.34.704-1.998.952-.77.247.002.588.092.845.092.248 0 .548-.097.858.656.317.772 1.08 2.634 1.174 2.825.095.19.158.412.032.603-.127.19-.19.308-.38.474-.19.165-.4.37-.57.497-.19.143-.388.297-.167.583.222.286.987 1.628 2.12 2.635 1.458 1.297 2.687 1.698 3.067 1.888.38.19.603.158.825-.095.222-.254.95-1.108 1.204-1.49.254-.38.507-.317.857-.19.35.126 2.223 1.048 2.603 1.238.38.19.634.285.73.444.095.158.095.92-.13 1.553z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours & Callback Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-12 border-t border-white/10">
          {/* Working Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('workingHours')}</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('mondayFriday')}: 9:00 - 19:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('saturday')}: 10:00 - 18:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t('sunday')}: 10:00 - 18:00</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                <span className="text-green-400 font-semibold">🌐 {t('language') === 'ru' ? 'Заказы: online 24/7' : 'Замовлення: online 24/7'}</span>
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
            <p>© 2025 Y-store. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/contact" className="hover:text-white">{t('contactInfo')}</Link>
              <Link to="/delivery-payment" className="hover:text-white">{t('deliveryPayment')}</Link>
              <Link to="/exchange-return" className="hover:text-white">{t('exchangeReturn')}</Link>
              <Link to="/about" className="hover:text-white">{t('aboutUs')}</Link>
              <Link to="/terms" className="hover:text-white">{t('agreement')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;