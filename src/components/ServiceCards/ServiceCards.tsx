import {
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
} from "lucide-react";

import styles from "./ServiceCards.module.css";

const services = [
  {
    id: 1,
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Fast and reliable delivery across Nigeria.",
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "100% Genuine Products",
    description: "Shop with confidence. Every product is verified.",
  },
  {
    id: 3,
    icon: CreditCard,
    title: "Secure Payment",
    description: "Safe and convenient payment options.",
  },
  {
    id: 4,
    icon: Headphones,
    title: "Warranty & Support",
    description: "We're here before and after your purchase.",
  },
];

export default function ServiceCards() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.services}>
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div className={styles.service} key={service.id}>
                <div className={styles.iconWrapper}>
                  <Icon size={23} strokeWidth={1.8} />
                </div>

                <div className={styles.content}>
                  <h3>{service.title}</h3>

                  <p>{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}