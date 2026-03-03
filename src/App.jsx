import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const generateTimeSlots = () => {
  const slots = []
  let hour = 9
  let minutes = 0

  while (hour < 20) {
    const startHour = hour % 12 || 12
    const startMin = minutes === 0 ? '00' : '30'
    const startAmPm = hour < 12 ? 'am' : 'pm'

    let nextHour = hour
    let nextMin = minutes + 30
    if (nextMin === 60) {
      nextHour++
      nextMin = 0
    }

    const endHour = nextHour % 12 || 12
    const endMin = nextMin === 0 ? '00' : '30'
    const endAmPm = nextHour < 12 ? 'am' : 'pm'

    slots.push(`${startHour}:${startMin}${startAmPm} - ${endHour}:${endMin}${endAmPm}`)

    hour = nextHour
    minutes = nextMin
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Portrait',
    studio: 'Studio A',
    date: '',
    time: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])

  const fetchAvailability = async () => {
    if (!formData.date || !formData.studio) return

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('booking_date', formData.date)
        .eq('studio', formData.studio)

      if (error) throw error
      setBookedSlots(data.map(b => b.booking_time))
    } catch (err) {
      console.error('Error fetching availability:', err)
    }
  }

  useEffect(() => {
    // Reset time selection when date or studio changes
    setFormData(prev => ({ ...prev, time: '' }))
    fetchAvailability()

    // Subscribe to realtime updates for this date and studio
    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchAvailability()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [formData.date, formData.studio])

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
      // 1. Double check availability before insert
      const { data: existing, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', formData.date)
        .eq('booking_time', formData.time)
        .eq('studio', formData.studio)
        .maybeSingle()

      if (checkError) throw checkError
      if (existing) {
        setError('This slot was just booked by someone else. Please select another time.')
        fetchAvailability()
        return
      }

      // 2. Perform the insert
      const { error } = await supabase.from('bookings').insert([
        {
          name: formData.name,
          email: formData.email,
          service: formData.service,
          studio: formData.studio,
          booking_date: formData.date,
          booking_time: formData.time,
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
          <a href="#studios">Studios</a>
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

      {/* Studio Preview Section */}
      <section id="studios" className="studio-preview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">OUR STUDIOS</h2>
            <p className="section-subtitle">Exquisite spaces for your creative vision</p>
          </div>
          <div className="studio-grid">
            <div className="studio-card">
              <div className="studio-image">
                <img src="/src/assets/Photoshoot/StudioA.jpeg" alt="Studio A" />
                <div className="studio-overlay">
                  <h3>Studio A</h3>
                  <p>Warm, narrative, and soulful</p>
                </div>
              </div>
              <div className="studio-info">
                <h4>Studio A - The Classic</h4>
                <p>The Heritage Perfect for vintage-inspired portraits and lifestyle sessions, featuring rich wood textures and authentic retro accents for a soulful, timeless feel.</p>
              </div>
            </div>
            <div className="studio-card">
              <div className="studio-image">
                <img src="/src/assets/Photoshoot/StudioB.jpeg" alt="Studio B" />
                <div className="studio-overlay">
                  <h3>Studio B</h3>
                  <p>Sentimental, warm, and cozy</p>
                </div>
              </div>
              <div className="studio-info">
                <h4>Studio B - The Nostalgic</h4>
                <p>The Nostalgia Step back into a simpler time with our curated ruang tamu set. Featuring classic rattan armchairs, vintage vinyl displays, and warm timber walls, it’s the perfect backdrop for capturing heartfelt family reunions and heritage-themed portraits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                      <label>Studio Selection</label>
                      <select name="studio" value={formData.studio} onChange={handleChange}>
                        <option value="Studio A">Studio A</option>
                        <option value="Studio B">Studio B</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input name="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>
                  </div>

                  {formData.date && (
                    <div className="form-group">
                      <label>Select Time Slot</label>
                      <div className="time-slots-grid">
                        {TIME_SLOTS.map(slot => {
                          const isBooked = bookedSlots.includes(slot)
                          const isSelected = formData.time === slot
                          return (
                            <button
                              key={slot}
                              type="button"
                              className={`time-slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                              disabled={isBooked}
                              onClick={() => handleChange({ target: { name: 'time', value: slot } })}
                            >
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

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
