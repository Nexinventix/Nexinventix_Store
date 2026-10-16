"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  Truck,
  Target,
  Eye,
  Heart,
  Lightbulb,
} from "lucide-react";

import Header from "@/components/Header/Header";
import styles from "./About.module.css";
import Footer from "@/components/Footer/Footer";

const values = [
  {
    icon: BadgeCheck,
    title: "Quality Products",
    description:
      "We aim to make it easier for customers to discover technology products that meet their needs and expectations.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description:
      "We believe in clear product information, honest communication, and a straightforward shopping experience.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "We want every customer to feel supported when choosing products, placing orders, and making purchase decisions.",
  },
  {
    icon: Truck,
    title: "Convenient Shopping",
    description:
      "Our goal is to make browsing, comparing, and purchasing gadgets convenient from wherever you are.",
  },
];

const commitments = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make technology more accessible by helping individuals and businesses discover gadgets and accessories suited to their needs.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become a trusted destination for technology products, known for convenience, customer care, and dependable service.",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "We are guided by customer satisfaction, integrity, continuous improvement, and a commitment to making technology shopping easier.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className={styles.aboutPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              GET TO KNOW US
            </span>

            <h1>
              Technology for
              <br />
              <span>everyday progress.</span>
            </h1>

            <p>
              Welcome to Nexinventix Gadget Store, your destination
              for discovering gadgets and technology accessories
              for work, learning, business, and everyday life.
            </p>

            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.primaryButton}>
                Explore Our Products
                <ArrowRight size={18} />
              </Link>

              <Link href="/contact" className={styles.secondaryButton}>
                Contact Us
              </Link>
            </div>

            <div className={styles.heroTrust}>
              <ShieldCheck size={18} />
              <span>
                Built around convenience, trust, and customer care.
              </span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualOrb} />

            <div className={styles.visualCardMain}>
              <div className={styles.visualCardTop}>
                <span className={styles.visualStatus} />
                TECHNOLOGY THAT MOVES YOU
              </div>

              <div className={styles.visualDevice}>
                <div className={styles.deviceScreen}>
                  <div className={styles.deviceScreenTop}>
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className={styles.deviceContent}>
                    <div className={styles.deviceLineLong} />
                    <div className={styles.deviceLineShort} />

                    <div className={styles.deviceBlocks}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>

                <div className={styles.deviceBase} />
              </div>

              <div className={styles.visualCardBottom}>
                <div>
                  <strong>Discover.</strong>
                  <span>Choose with confidence.</span>
                </div>

                <div className={styles.visualArrow}>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>

            <div className={styles.floatingBadge}>
              <Lightbulb size={20} />
              <div>
                <strong>Smart Choices</strong>
                <span>For modern living</span>
              </div>
            </div>

            <div className={styles.floatingDot} />
          </div>
        </section>

        {/* Introduction */}
        <section className={styles.storySection}>
          <div className={styles.storyLabel}>
            <span className={styles.sectionEyebrow}>OUR STORY</span>
            <span className={styles.storyLine} />
          </div>

          <div className={styles.storyGrid}>
            <div className={styles.storyHeading}>
              <h2>
                More than gadgets.
                <br />
                <span>A better way to shop.</span>
              </h2>
            </div>

            <div className={styles.storyText}>
              <p>
                Technology plays an important role in how we work,
                learn, communicate, and grow. Finding the right
                device or accessory should be a straightforward
                experience.
              </p>

              <p>
                Nexinventix Gadget Store is focused on bringing
                technology products together in one convenient place,
                helping customers explore available options and find
                products that suit their requirements.
              </p>

              <p>
                Whether you are equipping your workspace, upgrading
                your devices, supporting your studies, or shopping
                for everyday accessories, we want to make your
                experience simple and convenient.
              </p>

              <Link href="/shop" className={styles.textLink}>
                Discover our collection
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.valuesSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>
              THE NEXINVENTIX DIFFERENCE
            </span>

            <h2>
              What matters
              <br />
              <span>to us.</span>
            </h2>

            <p>
              Our approach is centred on making technology shopping
              clearer, more convenient, and more customer-focused.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <article className={styles.valueCard} key={value.title}>
                  <div className={styles.valueCardTop}>
                    <div className={styles.valueIcon}>
                      <Icon size={23} />
                    </div>

                    <span className={styles.valueNumber}>
                      0{index + 1}
                    </span>
                  </div>

                  <h3>{value.title}</h3>

                  <p>{value.description}</p>

                  <div className={styles.valueCardLine} />
                </article>
              );
            })}
          </div>
        </section>

        {/* Mission, Vision and Values */}
        <section className={styles.commitmentSection}>
          <div className={styles.commitmentIntro}>
            <span className={styles.sectionEyebrow}>
              WHAT GUIDES US
            </span>

            <h2>
              Purpose behind
              <br />
              <span>every connection.</span>
            </h2>

            <p>
              Our mission, vision, and values shape the experience
              we want to build for every customer.
            </p>
          </div>

          <div className={styles.commitmentList}>
            {commitments.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  className={styles.commitmentItem}
                  key={item.title}
                >
                  <div className={styles.commitmentIcon}>
                    <Icon size={22} />
                  </div>

                  <div className={styles.commitmentContent}>
                    <span className={styles.commitmentNumber}>
                      0{index + 1}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>
                  </div>

                  <ArrowRight
                    size={19}
                    className={styles.commitmentArrow}
                  />
                </article>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaGlow} />

          <div className={styles.ctaContent}>
            <span className={styles.ctaEyebrow}>
              YOUR NEXT DISCOVERY STARTS HERE
            </span>

            <h2>
              Ready to find your
              <br />
              next favourite gadget?
            </h2>

            <p>
              Explore our collection and discover technology
              products for your everyday needs.
            </p>

            <div className={styles.ctaActions}>
              <Link href="/shop" className={styles.ctaPrimary}>
                Shop Now
                <ArrowRight size={18} />
              </Link>

              <Link href="/contact" className={styles.ctaSecondary}>
                Talk to Us
              </Link>
            </div>
          </div>

          <div className={styles.ctaDecoration} aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}