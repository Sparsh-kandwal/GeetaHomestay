import { Wifi, Car, Droplet, UtensilsCrossed, Clock } from "lucide-react";

const Facilities = () => {
  const facilities = [
    { name: "Free Parking", icon: Car, description: "Easy arrival for road trips and family stays." },
    { name: "High-Speed WiFi", icon: Wifi, description: "Reliable connection for work, calls, and streaming." },
    { name: "Hot Water", icon: Droplet, description: "Comfortable bathing after a day outdoors." },
    { name: "Food Available", icon: UtensilsCrossed, description: "Fresh, simple meals to keep your stay convenient." },
    { name: "24/7 Service", icon: Clock, description: "Helpful support whenever guests need assistance." },
  ];

  return (
    <section className="py-20 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b4e31]">
            Comfort essentials
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-[#17322e]">
            Thoughtful facilities for an easy, restful stay
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#6f746d] sm:text-base">
            Every part of the stay is designed to feel relaxed, practical, and genuinely welcoming.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {facilities.map((facility) => (
            <div
              key={facility.name}
              className="rounded-[28px] border border-[#e7dfd2] bg-white p-6 shadow-[0_15px_35px_rgba(23,50,46,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(23,50,46,0.12)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5f2]">
                <facility.icon className="h-7 w-7 text-[#1f5b52]" />
              </div>
              <p className="mt-5 text-lg font-semibold text-[#17322e]">{facility.name}</p>
              <p className="mt-2 text-sm leading-6 text-[#6f746d]">{facility.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
