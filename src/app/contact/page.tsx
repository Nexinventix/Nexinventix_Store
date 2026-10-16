"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  ChevronDown,
} from "lucide-react";

import Header from "@/components/Header/Header";
import styles from "./Contact.module.css";
import Footer from "@/components/Footer/Footer";


const contactOptions = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us your questions or enquiries.",
    value: "Contact our team",
    href: "mailto:YOUR_EMAIL@example.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak with our team about your enquiry.",
    value: "+234 906 472 8676",
    href: "tel:+2349064728676",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Chat with us about products and orders.",
    value: "+234 815 070 4661",
    href: "https://wa.me/2348150704661",
  },
];

const faqs = [
  {
    question: "How can I enquire about a product?",
    answer:
      "Visit our Shop page to explore available products. You can also contact our team with the product name and your questions so we can assist you.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Browse the products in our store, select the item you want, and follow the available purchase instructions. If you need assistance, contact our team.",
  },
  {
    question: "Can I ask about product availability?",
    answer:
      "Yes. Send us the product name or link and ask about its current availability before making your purchase.",
  },
  {
    question: "How do I get help with an existing order?",
    answer:
      "Contact our team with your order reference, if available, and a brief description of the assistance you need. Avoid sending payment card details or passwords.",
  },
];

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleChange(
    field: keyof FormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name || !email || !subject || !message) {
      setStatus("error");
      setStatusMessage("Please complete all fields before submitting.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setStatus("error");
      setStatusMessage("Please enter a valid email address.");
      return;
    }

    /*
      This currently opens the visitor's default email application.
      Replace this handler with a backend/API request when your
      contact form endpoint is ready.
    */
    const recipient = "nexinventix@gmail.com";

    if (recipient === "nexinventix@gmail.com") {
      const subjectLine = encodeURIComponent(subject);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );

      setStatus("success");
      setStatusMessage(
        "Your message is ready. Your email application will open so you can send it."
      );

      window.location.href =
        `mailto:${recipient}?subject=${subjectLine}&body=${body}`;

      return;
    }

    const subjectLine = encodeURIComponent(subject);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href =
      `mailto:${recipient}?subject=${subjectLine}&body=${body}`;

    setStatus("success");
    setStatusMessage(
      "Your email application has been asked to open with your message."
    );
  }

  return (
    <>
      <Header />

      <main className={styles.contactPage}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              WE'RE HERE TO HELP
            </span>

            <h1>
              Let's talk
              <br />
              <span>technology.</span>
            </h1>

            <p>
              Have a question about a gadget, need help with an
              order, or want to learn more about our products?
              We'd love to hear from you.
            </p>

            <a href="#contact-form" className={styles.heroButton}>
              Send Us a Message
              <ArrowRight size={18} />
            </a>

            <div className={styles.heroTrust}>
              <ShieldCheck size={17} />
              <span>Your enquiry matters to us.</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualCircle} />

            <div className={styles.messageCard}>
              <div className={styles.messageCardHeader}>
                <div className={styles.messageAvatar}>
                  <Headphones size={22} />
                </div>

                <div>
                  <strong>Customer Support</strong>
                  <span>We're ready to listen</span>
                </div>

                <span className={styles.messageDot} />
              </div>

              <div className={styles.chatBubble}>
                Hello! How can we help you today?
              </div>

              <div className={styles.chatBubbleReply}>
                I have a question about a product.
              </div>

              <div className={styles.chatInput}>
                <span>Write your message...</span>

                <span className={styles.sendIcon}>
                  <Send size={15} />
                </span>
              </div>
            </div>

            <div className={styles.floatingMail}>
              <Mail size={22} />
            </div>

            <div className={styles.floatingMessage}>
              <MessageCircle size={21} />
            </div>
          </div>
        </section>

        {/* Contact options */}
        <section className={styles.contactOptions}>
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <a
                key={option.title}
                href={option.href}
                className={styles.contactCard}
              >
                <div className={styles.contactIcon}>
                  <Icon size={22} />
                </div>

                <div className={styles.contactCardContent}>
                  <h2>{option.title}</h2>
                  <p>{option.description}</p>

                  <span className={styles.contactCardLink}>
                    {option.value}
                    <ArrowRight size={15} />
                  </span>
                </div>
              </a>
            );
          })}
        </section>

        {/* Main contact area */}
        <section className={styles.contactSection}>
          <div className={styles.contactIntro}>
            <span className={styles.sectionEyebrow}>
              GET IN TOUCH
            </span>

            <h2>
              How can we
              <br />
              <span>help you?</span>
            </h2>

            <p>
              Send us a message using the form. Include enough
              detail to help us understand your enquiry.
            </p>

            <div className={styles.contactDetails}>
            <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                <Mail size={19} />
                </div>

                <div>
                <span>Email</span>
                <p>nexinventix@gmail.com</p>
                </div>
            </div>

            <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                <Phone size={19} />
                </div>

                <div>
                <span>Phone</span>
                <p>
                    <a href="tel:+2349064728676">
                        +234 906 472 8676
                    </a>
                </p>
                </div>
            </div>

            <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                <MessageCircle size={19} />
                </div>

                <div>
                <span>WhatsApp</span>
                <p>
                    <a
                    href="https://wa.me/2348150704661"
                    target="blank"
                    rel="noopener noreferrer"
                    >
                    +234 815 070 4661
                    </a>
                </p>
                </div>
            </div>

            <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                <MapPin size={19} />
                </div>

                <div>
                <span>Location</span>
                <p>Ajegunle, Lagos, Nigeria</p>
                </div>
            </div>

            <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                <Clock size={19} />
                </div>

                <div>
                <span>Business Hours</span>
                <p>Contact us to confirm our current hours.</p>
                </div>
            </div>
            </div>

          </div>

          <div className={styles.formCard} id="contact-form">
            <div className={styles.formHeading}>
              <span className={styles.formEyebrow}>
                CONTACT FORM
              </span>

              <h2>Send us a message</h2>

              <p>
                Fill in the details below and prepare your enquiry.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-name">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    autoComplete="name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-subject">
                  Subject <span>*</span>
                </label>

                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  placeholder="What is your enquiry about?"
                  value={form.subject}
                  onChange={(event) =>
                    handleChange("subject", event.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-message">
                  Your Message <span>*</span>
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={(event) =>
                    handleChange("message", event.target.value)
                  }
                  required
                />
              </div>

              {status !== "idle" && (
                <div
                  className={
                    status === "success"
                      ? styles.successMessage
                      : styles.errorMessage
                  }
                  role={status === "error" ? "alert" : "status"}
                >
                  {status === "success" ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <ShieldCheck size={19} />
                  )}

                  <span>{statusMessage}</span>
                </div>
              )}

              <button type="submit" className={styles.submitButton}>
                Prepare Message
                <Send size={17} />
              </button>

              <p className={styles.formDisclaimer}>
                Please do not include passwords, payment card details,
                or other sensitive information.
              </p>
            </form>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.faqSection}>
          <div className={styles.faqIntro}>
            <span className={styles.sectionEyebrow}>
              QUICK ANSWERS
            </span>

            <h2>
              Frequently asked
              <br />
              <span>questions.</span>
            </h2>

            <p>
              Find answers to common questions about shopping
              with Nexinventix.
            </p>

            <Link href="/shop" className={styles.faqShopLink}>
              Explore the shop
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  className={`${styles.faqItem} ${
                    isOpen ? styles.faqItemOpen : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>

                    <ChevronDown
                      size={19}
                      className={styles.faqChevron}
                    />
                  </button>

                  {isOpen && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className={styles.bottomCta}>
          <div>
            <span>NEED A NEW GADGET?</span>

            <h2>Your next discovery starts here.</h2>

            <p>
              Browse our collection of technology products and accessories.
            </p>
          </div>

          <Link href="/shop" className={styles.ctaButton}>
            Shop All Products
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}