import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 mt-auto border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="inline-block">
                            <h3 className="text-3xl font-serif font-bold text-gold-500 tracking-wide">
                                Gold Lagbe!
                            </h3>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your trusted premium marketplace for authentic gold jewelry.
                            We connect you with top vendors to ensure quality and elegance in every piece.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-white transition-all duration-300">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-white transition-all duration-300">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-gold-500 inline-block pb-2">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li>
                                <Link to="/" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Shop Collection
                                </Link>
                            </li>
                            <li>
                                <Link to="/vendors" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Our Vendors
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-gold-500 inline-block pb-2">
                            Customer Care
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li>
                                <Link to="/help" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-gold-500 inline-block pb-2">
                            Get in Touch
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-400 mb-6">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-gold-500 mt-0.5 shrink-0" />
                                <span>123 Gold Souk, Jewelry District, Dhaka 1212, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-gold-500 shrink-0" />
                                <span>+880 1234-567890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-gold-500 shrink-0" />
                                <span>support@goldlagbe.com</span>
                            </li>
                        </ul>

                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Subscribe to newsletter"
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm border border-gray-700 transition-all"
                            />
                            <button className="absolute right-1 top-1 bottom-1 bg-gold-500 text-white px-3 rounded-md hover:bg-gold-600 transition-colors">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm text-center md:text-left">
                            &copy; {new Date().getFullYear()} <span className="text-gold-500">Gold Lagbe!</span>. All rights reserved.
                        </p>
                        {/* Payment Methods */}
                        <div className="flex flex-col gap-4">
                            <h5 className="text-white font-bold mb-2">Payment Methods</h5>
                            <div className="flex flex-wrap gap-2">
                                {/* Row 1 */}
                                <div className="h-8 px-2 bg-white rounded flex items-center justify-center border border-gray-200" title="Cash on Delivery">
                                    <span className="text-[10px] font-bold text-green-700 leading-tight text-center">CASH ON<br />DELIVERY</span>
                                </div>
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="Visa">
                                    <img src="/icons/visa.svg" alt="Visa" className="h-full w-full object-contain p-1" />
                                </div>
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="Mastercard">
                                    <img src="/icons/mastercard.svg" alt="Mastercard" className="h-full w-full object-contain p-1" />
                                </div>
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="American Express">
                                    <img src="/icons/amex.svg" alt="Amex" className="h-full w-full object-contain p-1" />
                                </div>
                                <div className="h-8 w-20 bg-white rounded flex items-center justify-center border border-gray-200" title="EMI">
                                    <span className="text-[10px] font-bold text-purple-800 leading-tight text-center">Easy Monthly<br />Installments</span>
                                </div>
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="bKash">
                                    <img src="/icons/bkash.png" alt="bKash" className="h-full w-full object-contain p-1" />
                                </div>

                                {/* Row 2 */}
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="Nagad">
                                    <img src="/icons/nagad.png" alt="Nagad" className="h-full w-full object-contain p-1" />
                                </div>
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="DBBL Nexus">
                                    <img src="/icons/dbbl.png" alt="DBBL" className="h-full w-full object-contain p-1" />
                                </div>
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden" title="Rocket">
                                    <img src="/icons/rocket.png" alt="Rocket" className="h-full w-full object-contain p-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
