import { Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin, ExternalLink, Info, HelpCircle, IndianRupee } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not on home page, navigate to home first
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">CleanWard</span>
            </Link>
            <p className="text-sm text-muted-foreground font-body">
              Ward-Wise Pollution Awareness & Action Dashboard for Delhi. Empowering citizens and authorities to create cleaner wards.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/map" className="hover:text-primary transition-colors">Ward Map</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">Login / Register</Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faqs')}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  <IndianRupee className="h-3 w-3" />
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Get Involved</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/volunteer" className="hover:text-primary transition-colors flex items-center gap-1">
                  Join as Volunteer <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/ngo" className="hover:text-primary transition-colors flex items-center gap-1">
                  Register Your NGO <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/partnership" className="hover:text-primary transition-colors flex items-center gap-1">
                  Partner with Municipality <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/contribute" className="hover:text-primary transition-colors flex items-center gap-1">
                  Contribute to the Cause <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delhi Municipal Corporation
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:contact@cleanward.delhi.gov.in" className="hover:text-primary transition-colors">
                  contact@cleanward.delhi.gov.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:1800-XXX-XXXX" className="hover:text-primary transition-colors">
                  1800-XXX-XXXX (Toll Free)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 CleanWard - ParallaX. All rights reserved.</p>
          <p className="mt-1">
            An initiative under Swachh Bharat Mission | Data sourced from CPCB, DPCC & Municipal Records
          </p>
        </div>
      </div>
    </footer>
  );
}
