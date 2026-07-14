import React from 'react';

const testimonials = [
    { name: "Keerthy Sekhar", text: "We purchased pure silk 9-yard saree and pure silk dhoti — quality was so nice and well within our budget. Highly recommend SRS Silk Traders." },
    { name: "Chethana Nagaraj", text: "Wonderful experience at SRS Silks Chickpet. The staff showed items very patiently. Please do visit!" },
    { name: "Aashini & Gunjan Desai", text: "Very nice sarees with perfect stitching. Blouses were stitched so quickly and perfectly. Will order again from the USA next year." },
    { name: "Radhika Iyer", text: "Beautiful collection of silk sarees at honest prices. Staff helped me pick the perfect one for my daughter's wedding." },
    { name: "Manjunath R", text: "Bought silk dhotis for a family function. Great quality fabric and very courteous staff." },
    { name: "Priya Suresh", text: "Loved the variety of Kanjeevaram sarees. Great customer service and fair pricing compared to other Chickpet shops." },
    { name: "Lakshmi Narayan", text: "Excellent collection for bridal shopping. They helped us match blouse fabric perfectly with the saree." },
    { name: "Vinod Kumar", text: "Good rates and genuine silk quality. Been buying from here for years, never disappointed." },
    { name: "Anita Reddy", text: "Nice ambience and helpful staff. Got a beautiful silk saree for my anniversary." },
    { name: "Suma Shetty", text: "One of the best silk saree shops in Chickpet. Quality and service both are top notch." },
    { name: "Ganesh Babu", text: "Ordered sarees for a bulk wedding order and they managed it beautifully with timely delivery." },
    { name: "Divya Prasad", text: "Loved the fabric quality of the 9-yard saree I bought for my mother. Great experience overall." },
    { name: "Ramesh Chandra", text: "Very cooperative staff, showed us many options patiently without any pressure to buy." },
    { name: "Shalini Rao", text: "Beautiful silk collection with reasonable pricing. My go-to shop for festive sarees now." },
    { name: "Kavya Nair", text: "Impressed with the stitching service too — quick turnaround and neat finishing." },
];

const AboutUs = () => {
    return (
        <div className="about-section-wrap">
            <section id="about" className="about-section">
                <div className="about-text">
                <span className="about-eyebrow">Our Story</span>
                <h2>Weaving Trust Since Generations</h2>
                <p>
                    Nestled in the heart of Chickpet — Bengaluru's historic silk trading hub — SRS Silk Traders
                    has been a trusted name in premium silk sarees for over three decades. What began as a small
                    family-run counter has grown into a name synonymous with authentic Kanjeevaram silks, elegant
                    9-yard sarees, and exquisite wedding collections, while staying true to the honest pricing and
                    personal service our founders started this business with.
                </p>
                <p style={{ marginTop: '16px' }}>
                    Every saree that leaves our store carries the weight of tradition — handpicked from the finest
                    weaving clusters and matched with care to every customer's occasion, whether a wedding, a
                    festival, or an everyday indulgence in beautiful fabric.
                </p>
            </div>

            <div className="about-facts">
                <div className="fact">
                    <span className="fact-icon">⭐</span>
                    <div>
                        <strong>4.7 / 5 Rating</strong>
                        <span>Based on 200+ genuine customer reviews</span>
                    </div>
                </div>
                <div className="fact">
                    <span className="fact-icon">🧵</span>
                    <div>
                        <strong>30+ Years of Legacy</strong>
                        <span>A family business rooted in Chickpet</span>
                    </div>
                </div>
                <div className="fact">
                    <span className="fact-icon">🤝</span>
                    <div>
                        <strong>Bulk & Wholesale Friendly</strong>
                        <span>Trusted by boutiques and event planners</span>
                    </div>
                </div>
            </div>

            <blockquote className="about-pull-quote">
                "Perfect stitching, honest pricing, and sarees that make every occasion unforgettable —
                this is why Chickpet trusts SRS."
            </blockquote>

            <div className="testimonial-strip">
                <div className="testimonial-track">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div className="testimonial-chip" key={i}>
                            <div className="review-stars">★★★★★</div>
                            <p className="review-text">"{t.text}"</p>
                            <div className="review-author">{t.name}</div>
                        </div>
                    ))}
                </div>
            </div>
            </section>
        </div>
    );
};

export default AboutUs;