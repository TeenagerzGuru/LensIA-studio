import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const generateTimeSlots = () => {
  const slots = []
  let hour = 9
  let minutes = 0

  while (hour < 22) {
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
    { title: '20 Minutes', price: 'RM109', icon: '⏳️', description: 'Our most popular package for a balanced session.' },
    { title: '30 Minutes', price: 'RM139', icon: '🕰', description: 'Extended session for more poses and variety.' }
  ]

  const extraCharges = [
    { icon: '👥', item: 'Extra Pax (above 7)', price: 'RM15 / pax' },
    { icon: '⏳', item: 'Extra 10 Minutes', price: 'RM25' },
    { icon: '⚡', item: 'Express Edit (24h)', price: 'RM30' },
    { icon: '💾', item: 'All Softcopy Add-On', price: 'RM40' }
  ]

  const studioAReviews = [
    { img: "/SAR5.jpeg", format: "landscape" },
    { img: "/SAR6.jpeg", format: "landscape" },
    { img: "/SAR7.jpeg", format: "portrait" },
    { img: "/SAR8.jpeg", format: "portrait" }
  ]

  const studioBReviews = [
    { img: "/SBR5.jpeg", format: "landscape" },
    { img: "/SBR6.jpeg", format: "landscape" },
    { img: "/SBR7.jpeg", format: "portrait" },
    { img: "/SBR8.jpeg", format: "portrait" }
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
      // 0. Custom Validation
      const nameRegex = /^[A-Za-z\s]{3,}$/
      if (!nameRegex.test(formData.name)) {
        setError('Name must be at least 3 characters and contain only letters.')
        setLoading(false)
        return
      }

      const phoneRegex = /^\d{8,}$/
      if (!phoneRegex.test(formData.phone)) {
        setError('Phone number must be at least 8 digits and contain only numbers.')
        setLoading(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.com$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address ending with .com')
        setLoading(false)
        return
      }

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
          <a href="#reviews">Reviews</a>
          <a href="#book" className="btn-nav-book">Book Now</a>
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
                <img src="/StudioA.jpeg" alt="Studio A" />
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
                <img src="/StudioB.jpeg" alt="Studio B" />
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

      {/* Reviews Section */}
      <section id="reviews" className="reviews">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">TESTIMONIALS</h2>
            <p className="section-subtitle">What our clients express on their face says it all</p>
          </div>

          <div className="reviews-container">
            <div className="studio-reviews-block">
              <h3 className="category-title">Studio A - The Classic</h3>
              <div className="reviews-grid">
                {studioAReviews.map((review, index) => (
                  <div key={index} className={`review-card image-only ${review.format}`}>
                    <img src={review.img} alt={`Studio A Review ${index + 1}`} className="review-img" />
                  </div>
                ))}
              </div>
            </div>

            <div className="studio-reviews-block">
              <h3 className="category-title">Studio B - The Nostalgic</h3>
              <div className="reviews-grid">
                {studioBReviews.map((review, index) => (
                  <div key={index} className={`review-card image-only ${review.format}`}>
                    <img src={review.img} alt={`Studio B Review ${index + 1}`} className="review-img" />
                  </div>
                ))}
              </div>
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
                    <label>Phone Number (WhatsApp)</label>
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
        <div className="footer-content">
          <div className="social-links">
            <a href="https://tiktok.com/@lensiastudio" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
              <svg viewBox="0 0 24 24" fill="#c1a27b" width="24" height="24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.32-2.34-.14-3.33.44-.71.37-1.33.99-1.33 2.02.01.59.28 1.14.63 1.6 1.02 1.33 3.01 1.54 4.18.59.39-.32.65-.77.77-1.27.05-1.03.03-2.05.03-3.08V1h-.04c.03-.32.03-.65.03-.98z" />
              </svg>
            </a>
            <a href="https://wa.me/60167270587" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp">
              <svg viewBox="0 0 24 24" fill="#c1a27b" width="24" height="24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </div>
          <p>&copy; 2026 LensIA Studio. All rights reserved.</p>
          <div className="developer-credit">
            <a href="#" target="_blank" rel="noopener noreferrer">Hafiz Ismail</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
