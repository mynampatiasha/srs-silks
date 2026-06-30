import React from 'react';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="hero-eyebrow">✨ Authentic Pure Silk ✨</div>
        <h1>The Elegance of<br/><em>Silk</em><br/>Lives Here</h1>
        <p>Premium pure silk sarees, handwoven Kanjeevarams, and exquisite bridal collections from the heart of Chickpet, Bengaluru.</p>
        <div className="hero-badges">
          <span className="badge">🧵 Pure Silk</span>
          <span className="badge">🏢 Wholesale & Retail</span>
          <span className="badge">✂️ Custom Stitching</span>
          <span className="badge">⭐ 4.7 Rated</span>
        </div>
        <div className="hero-cta">
          <a href="#collection" className="btn-primary">Shop Collection</a>
          <a href="#contact" className="btn-secondary">Customise an Order</a>
        </div>
      </div>
      <div className="hero-img">
        <img 
          src="/srs_hero_image_1779810349059.png" 
          alt="Beautiful Indian woman wearing a rich Kanjeevaram pure silk saree"
          onError={(e) => { e.target.style.background='#d4b896'; e.target.style.display='block'; }}
        />
        <div className="hero-tag">📍 Chickpet, Bengaluru</div>
      </div>
    </section>
  );
};

export default Hero;
