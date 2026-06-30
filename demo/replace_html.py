import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace title and add meta
html = re.sub(r'<title>.*?</title>', '<title>SRS Silk Traders — Chickpet, Bengaluru</title>\n  <meta name=\"description\" content=\"SRS Silk Traders in Chickpet, Bengaluru offers premium pure silk sarees, kanjeevaram silks, and custom blouse stitching. Wholesale and retail.\">\n  <meta name=\"keywords\" content=\"Silk Sarees in Chickpet, Wholesale Silk Sarees Bengaluru, Best Saree Shop Avenue Road, SRS Silk Traders, Custom Saree Stitching\">', html)

# Replace Nav logo
html = html.replace('Devisri Kalamkari\n      <span>Srikalahasti · Heritage Art</span>', 'SRS Silk Traders\n      <span>Chickpet, Bengaluru · Premium Silks</span>')

# Replace Hero
html = html.replace('<div class="hero-eyebrow">✦ Authentic Pen Kalamkari ✦</div>', '<div class="hero-eyebrow">✦ Authentic Pure Silk ✦</div>')
html = html.replace('<h1>The Art of<br><em>Kalamkari</em><br>Lives Here</h1>', '<h1>The Elegance of<br><em>Silk</em><br>Lives Here</h1>')
html = html.replace('Hand-painted and block-printed textiles crafted by artisan families in Srikalahasti, Andhra Pradesh — using centuries-old techniques and natural dyes.', 'Premium pure silk sarees, handwoven Kanjeevarams, and exquisite bridal collections from the heart of Chickpet, Bengaluru.')

badges_old = '''<span class="badge">🖌️ Hand-painted</span>
        <span class="badge">🌿 Natural dyes</span>
        <span class="badge">🏺 Heritage craft</span>
        <span class="badge">✅ Women-owned</span>'''
badges_new = '''<span class="badge">✨ Pure Silk</span>
        <span class="badge">🥻 Wholesale & Retail</span>
        <span class="badge">✂️ Custom Stitching</span>
        <span class="badge">⭐ 4.7 Rated</span>'''
html = html.replace(badges_old, badges_new)

hero_img_old = '''<img
        src="home.png"
        alt="Artisan hand-painting kalamkari motifs with a bamboo pen on cotton fabric"
        onerror="this.style.background='#d4b896';this.style.display='block'"
      />
      <div class="hero-tag">📍 Srikalahasti, AP</div>'''
hero_img_new = '''<img
        src="srs_hero_image_1779810349059.png"
        alt="Beautiful Indian woman wearing a rich Kanjeevaram pure silk saree"
        onerror="this.style.background='#d4b896';this.style.display='block'"
      />
      <div class="hero-tag">📍 Chickpet, Bengaluru</div>'''
html = html.replace(hero_img_old, hero_img_new)

html = html.replace('✦ &nbsp; Natural · Handmade · Authentic · Shipped Pan-India &nbsp; ✦', '✦ &nbsp; Pure Silk · Wholesale & Retail · Custom Stitching · Global Shipping &nbsp; ✦')

html = html.replace('<p>Every piece painted or printed by hand in our Bhaskarpeta workshop</p>', '<p>Exquisite silk sarees for weddings, special occasions, and bulk wholesale</p>')

filters_old = '''<button class="filter-btn" data-cat="saree">Sarees</button>
      <button class="filter-btn" data-cat="dupatta">Dupattas</button>
      <button class="filter-btn" data-cat="fabric">Fabric / Yardage</button>
      <button class="filter-btn" data-cat="kurta">Kurta Sets</button>'''
filters_new = '''<button class="filter-btn" data-cat="bridal">Bridal Silk</button>
      <button class="filter-btn" data-cat="soft_silk">Soft Silk</button>
      <button class="filter-btn" data-cat="wholesale">Wholesale Bundles</button>'''
html = html.replace(filters_old, filters_new)

custom_banner_old = '''<h3>Want Something Unique?</h3>
        <p>We take custom orders — your motif, your colour palette, your fabric. Contact us and our artisans will bring your vision to life.</p>
      </div>
      <a href="#contact" class="btn-primary btn-light">Customise My Order →</a>'''
custom_banner_new = '''<h3>Perfect Stitching & Blouse Design</h3>
        <p>We offer premium custom blouse stitching with intricate embroidery to match your beautiful silk saree. Delivered quickly with perfect fit!</p>
      </div>
      <a href="#contact" class="btn-primary btn-light">Request Stitching →</a>'''
html = html.replace(custom_banner_old, custom_banner_new)

gallery_head_old = '''<h2>The Craft in Action</h2>
      <p>From our workshop in Bhaskarpeta — every piece is painted by hand</p>'''
gallery_head_new = '''<h2>Our Shop & Craft</h2>
      <p>Visit us in Chickpet or order online. We provide the finest silks and tailoring.</p>'''
html = html.replace(gallery_head_old, gallery_head_new)

about_old = '''<div class="about-text">
      <h2>Our Story</h2>
      <p>Devisri Kalamkari is a women-owned family workshop in Bhaskarpeta, Srikalahasti. Muniram and his sister Bhargavi lead a team of dedicated artisans who have inherited the 3,000-year-old pen kalamkari tradition — using bamboo pens, natural tamarind dyes, and hand-block printing to create one-of-a-kind textiles.</p>
      <p style="margin-top:12px">We ship directly from the workshop to your door, and every purchase directly supports the artisan families behind each piece.</p>
    </div>
    <div class="about-facts">
      <div class="fact">
        <span class="fact-icon">🎋</span>
        <div>
          <strong>Bamboo pen technique</strong>
          <span>Srikalahasti style — free-hand drawing</span>
        </div>
      </div>
      <div class="fact">
        <span class="fact-icon">🌿</span>
        <div>
          <strong>100% natural dyes</strong>
          <span>Indigo, pomegranate, iron, myrobalan</span>
        </div>
      </div>
      <div class="fact">
        <span class="fact-icon">👩‍🎨</span>
        <div>
          <strong>8+ artisan families</strong>
          <span>Employed directly, fairly paid</span>
        </div>
      </div>
      <div class="fact">
        <span class="fact-icon">📦</span>
        <div>
          <strong>Ships pan-India</strong>
          <span>Eco-packed, direct from workshop</span>
        </div>
      </div>
    </div>'''
about_new = '''<div class="about-text">
      <h2>About SRS Silk Traders</h2>
      <p>Located in the heart of Chickpet, Bengaluru, SRS Silk Traders is your trusted destination for premium silk sarees. With a stellar 4.7 rating from hundreds of happy customers, we are known for our nice collections, comfortable prices, and excellent service.</p>
      <p style="margin-top:12px">Whether you are a retail customer looking for a bridal saree or a manufacturer looking for wholesale supply, we have you covered. We also offer perfect custom blouse stitching and can ship internationally.</p>
    </div>
    <div class="about-facts">
      <div class="fact">
        <span class="fact-icon">✨</span>
        <div>
          <strong>Premium Quality</strong>
          <span>Pure Kanjeevaram & Soft Silk</span>
        </div>
      </div>
      <div class="fact">
        <span class="fact-icon">✂️</span>
        <div>
          <strong>Perfect Stitching</strong>
          <span>Custom blouse designs</span>
        </div>
      </div>
      <div class="fact">
        <span class="fact-icon">📦</span>
        <div>
          <strong>Wholesale & Retail</strong>
          <span>Bulk orders welcome</span>
        </div>
      </div>
      <div class="fact">
        <span class="fact-icon">🌍</span>
        <div>
          <strong>Global Shipping</strong>
          <span>We ship worldwide (e.g., USA)</span>
        </div>
      </div>
    </div>'''
html = html.replace(about_old, about_new)

html = html.replace('<img src="customizable_kalamkari.webp" alt="Customise Your Kalamkari Order" class="contact-banner-img" />', '<img src="srs_custom_banner_1779810442171.png" alt="Customise Your Silk Order" class="contact-banner-img" />')

contact_info_old = '''<h2>Contact Us &amp;<br>Customise Your Order</h2>
        <p>Looking for a specific design, colour, or fabric? Fill out the form and Muniram or Bhargavi will personally get back to you within 24–48 hours.</p>

        <div class="contact-details">
          <div class="contact-detail-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>H. No. 12/490, Bhaskarpeta, near Chamundeswari Temple, Srikalahasti, AP 517644</span>
          </div>
          <div class="contact-detail-item">
            <i class="fa-solid fa-phone"></i>
            <span>087123 38621</span>
          </div>
          <div class="contact-detail-item">
            <i class="fa-solid fa-clock"></i>
            <span>Mon – Sun, 9 AM – 9 PM</span>
          </div>
          <div class="contact-detail-item">
            <i class="fa-solid fa-truck"></i>
            <span>Free shipping on orders above ₹2,000</span>
          </div>
        </div>

        <div class="contact-note">
          <strong>Customisation options we offer:</strong>
          <ul>
            <li>Specific mythological or floral motifs</li>
            <li>Custom colour palette (natural dyes)</li>
            <li>Fabric choice — cotton, silk, chanderi</li>
            <li>Saree, dupatta, kurta or yardage</li>
            <li>Bulk / wholesale orders</li>
          </ul>
        </div>'''
contact_info_new = '''<h2>Contact Us &amp;<br>Customise Your Order</h2>
        <p>Looking for a specific silk saree, custom blouse stitching, or wholesale supply? Fill out the form and our team will personally get back to you.</p>

        <div class="contact-details">
          <div class="contact-detail-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>1ST FLOOR, Murugan Building, NO 510/A, Avenue Rd, Chickpet, Bengaluru 560002</span>
          </div>
          <div class="contact-detail-item">
            <i class="fa-solid fa-phone"></i>
            <span>093412 18059</span>
          </div>
          <div class="contact-detail-item">
            <i class="fa-solid fa-clock"></i>
            <span>Wed – Tue, 10 AM – 9 PM</span>
          </div>
          <div class="contact-detail-item">
            <i class="fa-solid fa-truck"></i>
            <span>Global shipping available (including USA)</span>
          </div>
        </div>

        <div class="contact-note">
          <strong>Services we offer:</strong>
          <ul>
            <li>Retail Silk Sarees (Bridal, Soft Silk)</li>
            <li>Wholesale / Bulk Orders</li>
            <li>Perfect Blouse Stitching</li>
            <li>Virtual Shopping via WhatsApp</li>
            <li>International Delivery</li>
          </ul>
        </div>'''
html = html.replace(contact_info_old, contact_info_new)

product_options_old = '''<option value="saree">Saree</option>
                <option value="dupatta">Dupatta</option>
                <option value="kurta">Kurta Set</option>
                <option value="fabric">Fabric / Yardage</option>
                <option value="painting">Kalamkari Painting</option>
                <option value="other">Other / Not sure yet</option>'''
product_options_new = '''<option value="bridal_silk">Bridal Silk Saree</option>
                <option value="soft_silk">Soft Silk Saree</option>
                <option value="wholesale">Wholesale Bundle</option>
                <option value="stitching">Custom Blouse Stitching</option>
                <option value="other">Other / Not sure yet</option>'''
html = html.replace(product_options_old, product_options_new)

custom_fields_old = '''<label for="cf-motif">Preferred Motif / Theme</label>
                <input type="text" id="cf-motif" name="motif" placeholder="e.g. Peacock, Krishna, Floral" />
              </div>
              <div class="form-group">
                <label for="cf-fabric">Preferred Fabric</label>
                <select id="cf-fabric" name="fabric">
                  <option value="">— Select —</option>
                  <option value="cotton">Cotton</option>
                  <option value="silk">Silk</option>
                  <option value="chanderi">Chanderi</option>
                  <option value="not_sure">Not sure — suggest one</option>
                </select>
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-group">
                <label for="cf-colors">Colour Preferences</label>
                <input type="text" id="cf-colors" name="colors" placeholder="e.g. Indigo, earthy tones, red &amp; black" />
              </div>
              <div class="form-group">
                <label for="cf-budget">Approximate Budget</label>
                <select id="cf-budget" name="budget">
                  <option value="">— Select —</option>
                  <option value="under_1000">Under ₹1,000</option>
                  <option value="1000_3000">₹1,000 – ₹3,000</option>
                  <option value="3000_6000">₹3,000 – ₹6,000</option>
                  <option value="above_6000">Above ₹6,000</option>
                </select>'''
custom_fields_new = '''<label for="cf-motif">Specific Requirements</label>
                <input type="text" id="cf-motif" name="motif" placeholder="e.g. Blouse stitching, Bridal colors" />
              </div>
              <div class="form-group">
                <label for="cf-fabric">Preferred Fabric</label>
                <select id="cf-fabric" name="fabric">
                  <option value="">— Select —</option>
                  <option value="kanjeevaram">Kanjeevaram Silk</option>
                  <option value="soft_silk">Soft Silk</option>
                  <option value="banarasi">Banarasi Silk</option>
                  <option value="not_sure">Not sure — suggest one</option>
                </select>
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-group">
                <label for="cf-colors">Colour Preferences</label>
                <input type="text" id="cf-colors" name="colors" placeholder="e.g. Red & Gold, Pastel Green" />
              </div>
              <div class="form-group">
                <label for="cf-budget">Approximate Budget</label>
                <select id="cf-budget" name="budget">
                  <option value="">— Select —</option>
                  <option value="under_5000">Under ₹5,000</option>
                  <option value="5000_10000">₹5,000 – ₹10,000</option>
                  <option value="10000_20000">₹10,000 – ₹20,000</option>
                  <option value="above_20000">Above ₹20,000</option>
                </select>'''
html = html.replace(custom_fields_old, custom_fields_new)

html = html.replace('Muniram or Bhargavi will get back to you within 24–48 hours.', 'Our team will get back to you shortly.')

footer_old = '''<div class="footer-brand">
        <div class="footer-logo">Devisri Kalamkari</div>
        <p>Authentic hand-painted textiles from Srikalahasti, Andhra Pradesh. Every piece tells a story.</p>
        <div class="footer-badges">
          <span>✅ Women-owned</span>
          <span>🏳️‍🌈 LGBTQ+ friendly</span>
        </div>
      </div>'''
footer_new = '''<div class="footer-brand">
        <div class="footer-logo">SRS Silk Traders</div>
        <p>Premium silk sarees, kanjeevarams, and expert blouse stitching from Chickpet, Bengaluru.</p>
        <div class="footer-badges">
          <span>✅ Top Rated (4.7)</span>
          <span>🚚 Global Shipping</span>
        </div>
      </div>'''
html = html.replace(footer_old, footer_new)

footer_contact_old = '''<div class="footer-contact">
        <strong>Find Us</strong>
        <p>H. No. 12/490, Bhaskarpeta<br>near Chamundeswari Temple<br>Srikalahasti, AP 517644</p>
        <p>📞 087123 38621</p>
        <p>🕐 Mon – Sun · 9 AM – 9 PM</p>
      </div>
    </div>
    <div class="footer-bottom">
      © 2025 Devisri Kalamkari · All rights reserved · Made with ♥ in Srikalahasti
    </div>'''
footer_contact_new = '''<div class="footer-contact">
        <strong>Find Us</strong>
        <p>1ST FLOOR, Murugan Building<br>Avenue Rd, Chickpet<br>Bengaluru, Karnataka 560002</p>
        <p>📞 093412 18059</p>
        <p>🕐 Wed – Tue · 10 AM – 9 PM</p>
      </div>
    </div>
    <div class="footer-bottom">
      © 2026 SRS Silk Traders · All rights reserved · Made with ♥ in Bengaluru
    </div>'''
html = html.replace(footer_contact_old, footer_contact_new)

html = html.replace("Place Order via WhatsApp", "Order on WhatsApp")
html = html.replace("Customise Your Kalamkari Order", "Customise Your Silk Order")


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
