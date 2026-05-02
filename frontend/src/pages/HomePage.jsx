import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ShieldCheck, Trees, Coffee } from "lucide-react";
import Testimonials from "../components/Testimonials";
import Facilities from "../components/Facilities";
import ScrollPrompt from "../components/ScrollPrompt";
import LocationComponent from "../components/LocationComponent";

const highlights = [
  { icon: ShieldCheck, label: "Trusted stay" },
  { icon: Trees, label: "Quiet view" },
  { icon: Coffee, label: "Homely feel" },
];

const HomePage = () => {
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollPrompt(window.scrollY <= 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-x-hidden">
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(16,39,34,0.28) 0%, rgba(16,39,34,0.65) 100%), url(static/mount1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-40 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8">
            <div className="max-w-3xl text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Geeta Homestay
              </div>
              <h1 className="text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-8xl">
                Cozy stay. Calm view. Easy booking.
              </h1>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/rooms"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fff4ea] px-6 py-3.5 text-sm font-semibold text-[#17322e] transition hover:bg-white"
                >
                  <Calendar className="h-4 w-4" />
                  Book now
                </Link>
                <button
                  onClick={() =>
                    window.open("https://maps.app.goo.gl/tr8YhF4AuSyNbhWh9", "_blank")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <MapPin className="h-4 w-4" />
                  Locate us
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {highlights.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                  >
                    <Icon className="mb-2 h-5 w-5 text-[#ffe0c8]" />
                    <p className="text-sm font-medium text-white/88">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showScrollPrompt && <ScrollPrompt />}

      <LocationComponent />
      <Facilities />
      <Testimonials />
    </div>
  );
};

export default HomePage;
