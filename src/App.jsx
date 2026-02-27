import { useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Portrait',
    date: '',
    time: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const services = [
    { title: '15 Minutes', price: 'RM89', icon: '⏱️', description: 'Perfect for quick, high-quality family or individual portraits.' },
    { title: '20 Minutes', price: 'RM109', icon: '�', description: 'Our most popular package for a balanced session.' },
    { title: '30 Minutes', price: 'RM139', icon: '�', description: 'Extended session for more poses and variety.' }
  ]

  const extraCharges = [
    { icon: '👥', item: 'Extra Pax (above 7)', price: 'RM15 / pax' },
    { icon: '⏳', item: 'Extra 10 Minutes', price: 'RM25' },
    { icon: '⚡', item: 'Express Edit (24h)', price: 'RM30' },
    { icon: '💾', item: 'All Softcopy Add-On', price: 'RM40' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from('bookings').insert([
        {
          name: formData.name,
          email: formData.email,
          service: formData.service,
          booking_date: formData.date,
          phone: formData.phone,
          message: formData.message
        }
      ])

      if (error) throw error

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">LensIA<span>Studio</span></div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Packages</a>
          <a href="#book">Book Now</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero">
        <div className="hero-content">
          <h1>Capture the <span>Moment</span></h1>
          <p>Premium photography services for those who value quality and artistry.</p>
          <a href="#book" className="btn-primary">Book a Session</a>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">STUDIO RAYA 2026</h2>
            <p className="section-subtitle">‣ Price includes up to 7 pax</p>
          </div>

          <h3 className="category-title">Duration Packages</h3>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p className="price">{service.price}</p>
                <p>{service.description}</p>
              </div>
            ))}
          </div>

          <div className="extra-charges">
            <h3 className="category-title">+ Extra Charges</h3>
            <div className="extra-grid">
              {extraCharges.map((extra, index) => (
                <div key={index} className="extra-item">
                  <span className="extra-icon">{extra.icon}</span>
                  <span className="extra-name">{extra.item}</span>
                  <span className="extra-dot"></span>
                  <span className="extra-price">{extra.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="book" className="booking">
        <div className="container">
          <div className="booking-wrapper">
            <div className="booking-info">
              <h2>Ready to <span>Pose?</span></h2>
              <p>Fill out the form and our team will get back to you within 24 hours to confirm your session.</p>
              <div className="contact-details">
                <p>📍 No 1G, Horizon Square, Jalan HVO 1, Bandar Sunsuria, 43900 Sepang, Selangor</p>
                <p>📞 016-7270587</p>
                <p>✉️ hadirbru2025@gmail.com</p>
              </div>
            </div>

            <div className="booking-form-container">
              {submitted ? (
                <div className="success-message">
                  <h3>Thank you!</h3>
                  <p>Your booking request has been received. We'll contact you soon.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-secondary">New Booking</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Abu" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="abu@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="012-3456789" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Service</label>
                      <select name="service" value={formData.service} onChange={handleChange}>
                        {services.map(s => <option key={s.title}>{s.title}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input name="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Message (Optional)</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your needs..." rows="4"></textarea>
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Confirm Request'}
                  </button>
                  {error && <p className="error-text">{error}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 LensIA Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
