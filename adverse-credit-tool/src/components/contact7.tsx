import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CardSpotlight } from "./ui/card-spotlight";

interface Contact7Props {
  title?: string;
  description?: string;
  emailLabel?: string;
  emailDescription?: string;
  email?: string;
  officeLabel?: string;
  officeDescription?: string;
  officeAddress?: string;
  phoneLabel?: string;
  phoneDescription?: string;
  phone?: string;
  chatLabel?: string;
  chatDescription?: string;
  chatLink?: string;
}

const Contact7 = ({
  title = "Contact CreditMatch",
  description = "Get in touch with our support team for quick assistance.",
  emailLabel = "Email",
  emailDescription = "Our advisers respond to all emails within 24 hours.",
  email = "support@creditmatch.com",
  officeLabel = "Head Office",
  officeDescription = "Visit us to discuss your mortgage matching needs.",
  officeAddress = "123 Market Street, London, UK",
  phoneLabel = "Phone",
  phoneDescription = "Available Mon-Fri, 9am-5pm (UK time).",
  phone = "+44 20 1234 5678",
  chatLabel = "Live Chat",
  chatDescription = "Connect instantly with our support advisers.",
  chatLink = "Start Chat",
}: Contact7Props) => {
  return (
    <section className="bg-background ">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2">
          <CardSpotlight className="rounded-lg p-6">
            <span className="bg-accent  mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <Mail className="h-6 w-auto" />
            </span>
            <p className="mb-2  text-lg font-semibold">{emailLabel}</p>
            <p className="text-muted-foreground  mb-3">{emailDescription}</p>
            <a
              href={`mailto:${email}`}
              className="font-semibold z-20 hover:underline"
            >
              {email}
            </a>
          </CardSpotlight>
          <CardSpotlight className="rounded-lg p-6" >
            <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <MapPin className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{officeLabel}</p>
            <p className="text-muted-foreground mb-3">{officeDescription}</p>
            <a href="#" className="font-semibold hover:underline">
              {officeAddress}
            </a>
          </CardSpotlight>
          <CardSpotlight className="rounded-lg p-6" >
            <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <Phone className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{phoneLabel}</p>
            <p className="text-muted-foreground mb-3">{phoneDescription}</p>
            <a href={`tel:${phone}`} className="font-semibold hover:underline">
              {phone}
            </a>
          </CardSpotlight>
          <CardSpotlight className="rounded-lg p-6">
            <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <MessageCircle className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{chatLabel}</p>
            <p className="text-muted-foreground mb-3">{chatDescription}</p>
            <a href="#" className="font-semibold hover:underline">
              {chatLink}
            </a>
          </CardSpotlight>
        </div>
      </div>
    </section>
  );
};

export { Contact7 };
