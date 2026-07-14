import React, { useState } from 'react';
import axios from 'axios';

const hours = [
    { day: 'Monday', time: '10:00 AM – 6:30 PM' },
    { day: 'Tuesday', time: '10:00 AM – 6:30 PM' },
    { day: 'Wednesday', time: '10:00 AM – 6:30 PM' },
    { day: 'Thursday', time: '10:00 AM – 6:30 PM' },
    { day: 'Friday', time: '10:00 AM – 6:30 PM' },
    { day: 'Saturday', time: '10:00 AM – 6:30 PM' },
    { day: 'Sunday', time: '10:00 AM – 6:30 PM' },
];

const PHONE = '093412 18059';
const PHONE_TEL = '+919341218059';
const ADDRESS = '1st Floor, Murugan Building, Sriram Market, No. 510/A, Avenue Rd, beside Davanam Jewels, Kumbarpet, Huriopet, Chickpet, Bengaluru, Karnataka 560002';
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=SRS+Silk+Traders+Chickpet+Bengaluru';

const categoryFieldMap = {
    bulk: { label: 'Estimated Quantity', placeholder: 'e.g. 50 sarees' },
    seller: { label: 'Business Name / Type', placeholder: 'e.g. Boutique, Reseller, Wholesaler' },
    stitching: { label: 'Garment Type', placeholder: 'e.g. Blouse, Dhoti, Petticoat' },
};

const ContactUs = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', category: 'general', extra: '', message: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ loading: false, success: null, error: null });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        if (!form.message.trim()) errs.message = 'Please tell us a bit about your inquiry';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setStatus({ loading: true, success: null, error: null });
        try {
            await axios.post(`http://${window.location.hostname}:5000/api/contact`, form);
            setStatus({ loading: false, success: 'Thank you! Your inquiry has been received — we will get back to you soon.', error: null });
            setForm({ name: '', email: '', phone: '', category: 'general', extra: '', message: '' });
        } catch (err) {
            setStatus({ loading: false, success: null, error: 'Something went wrong. Please try again or call us directly.' });
        }
    };

    const extraField = categoryFieldMap[form.category];

    return (
        <section id="contact" className="contact-section">
            <div className="contact-wrapper">
                {/* Left: Info */}
                <div className="contact-info">
                    <span className="contact-eyebrow">✨ Get In Touch ✨</span>
                    <h2>Contact Us</h2>
                    <p>
                        Whether you're planning a wedding shopping trip, looking to place a bulk order,
                        or want to partner with us as a seller — we'd love to hear from you.
                    </p>

                    <div className="contact-details">
                        <div className="contact-detail-item">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>{ADDRESS}</span>
                        </div>
                        <div className="contact-detail-item">
                            <i className="fa-solid fa-phone"></i>
                            <a href={`tel:${PHONE_TEL}`}>{PHONE}</a>
                        </div>
                        <div className="contact-detail-item">
                            <i className="fa-solid fa-clock"></i>
                            <div>
                                {hours.map(h => (
                                    <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '13px' }}>
                                        <span>{h.day}</span><span>{h.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                        Get Directions <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>

                    <div className="contact-note" style={{ marginTop: '24px' }}>
                        <strong>We can help with:</strong>
                        <ul>
                            <li>General order inquiries</li>
                            <li>Bulk & wholesale orders</li>
                            <li>Becoming a seller / business partnership</li>
                            <li>Custom stitching & tailoring</li>
                        </ul>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="contact-form-wrap">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Name <span className="req">*</span></label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
                                <span className="field-error">{errors.name}</span>
                            </div>
                            <div className="form-group">
                                <label>Email <span className="req">*</span></label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
                                <span className="field-error">{errors.email}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phone (optional)</label>
                            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>What is this regarding?</label>
                            <select name="category" value={form.category} onChange={handleChange}>
                                <option value="general">General Order Inquiry</option>
                                <option value="bulk">Bulk Order Inquiry</option>
                                <option value="seller">Become a Seller / Business Partnership</option>
                                <option value="stitching">Custom Stitching / Tailoring</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {extraField && (
                            <div className="custom-fields">
                                <div className="custom-fields-title">
                                    <i className="fa-solid fa-circle-info"></i> A bit more detail helps us respond faster
                                </div>
                                <div className="form-group">
                                    <label>{extraField.label}</label>
                                    <input type="text" name="extra" placeholder={extraField.placeholder} value={form.extra} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Message <span className="req">*</span></label>
                            <textarea name="message" value={form.message} onChange={handleChange} className={errors.message ? 'error' : ''} />
                            <span className="field-error">{errors.message}</span>
                        </div>

                        <button type="submit" className="form-submit" disabled={status.loading}>
                            {status.loading ? 'Sending...' : 'Send Message'}
                        </button>

                        {status.success && (
                            <div className="form-success">
                                <i className="fa-solid fa-circle-check"></i> {status.success}
                            </div>
                        )}
                        {status.error && (
                            <div className="form-success" style={{ background: '#fee2e2', borderColor: '#f8b4b4', color: '#b91c1c' }}>
                                <i className="fa-solid fa-circle-exclamation"></i> {status.error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;