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
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const services = [
    { title: 'Portrait', price: '$150', icon: '👤', description: 'Professional individual shots for your portfolio or socials.' },
    { title: 'Wedding', price: '$1200', icon: '💍', description: 'Capturing your special day with high-end storytelling.' },
    { title: 'Event', price: '$400', icon: '🎉', description: 'Corporate events, parties, and celebrations.' },
    { title: 'Commercial', price: '$800', icon: '🏢', description: 'Product photography and brand visuals.' }
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
        <div className="logo">STUDIO<span>X</span></div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
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
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p className="price">Starting at {service.price}</p>
                <p>{service.description}</p>
              </div>
            ))}
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
                <p>📍 123 Artsy Lane, Creativille</p>
                <p>📞 (555) 012-3456</p>
                <p>✉️ hello@studiox.com</p>
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
                    <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
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
        <p>&copy; 2026 StudioX Photography. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
