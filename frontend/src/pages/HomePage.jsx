import { Link } from "react-router-dom";
import { MapPin, ArrowRight, ArrowUpRight } from "lucide-react";
import Testimonials from "../components/Testimonials";
import Facilities from "../components/Facilities";
import LocationComponent from "../components/LocationComponent";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden bg-[#faf7f2] text-[#17322e]">
      {/* Fullscreen Hero Section with Clear Screen Boundary and Transparent Text Layering */}
      <section className="relative h-screen min-h-[660px] w-full overflow-hidden flex flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-12 text-white">
        {/* Full Morning Town Photo — Natural Light, Crisp Edge at Screen End */}
        <div className="absolute inset-0">
          <img
            src="/static/mount1.jpg"
            alt="Morning sunlight over Karnaprayag town, Alaknanda river, and the Garhwal Himalayas"
            className="h-full w-full object-cover object-[center_35%]"
            loading="eager"
          />
          {/* Subtle top scrim exclusively for navbar link legibility */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 via-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 my-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            {/* Left: Transparent Editorial Text (Photo fully visible behind text) */}
            <div className="lg:col-span-7 xl:col-span-7">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#f1c8af] shadow-sm" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffe2cc] [text-shadow:_0_1px_4px_rgb(0_0_0_/_80%)]">
                  Karnaprayag • Garhwal Himalayas
                </span>
              </div>

              <p className="mt-4 font-grand text-3xl sm:text-4xl text-[#ffe2cc] [text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]">
                Welcome to our mountain home
              </p>

              <h1 className="mt-2 font-merriweather text-3xl font-semibold leading-[1.14] text-white sm:text-5xl lg:text-6xl [text-shadow:_0_3px_12px_rgb(0_0_0_/_85%)]">
                Where sacred rivers meet, and mountain quiet begins.
              </h1>

              <p className="mt-5 max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-white/95 [text-shadow:_0_1px_6px_rgb(0_0_0_/_85%)]">
                Tucked above the morning mist of Karnaprayag where the Alaknanda and
                Pindar rivers merge, Geeta Homestay is a peaceful family retreat.
                Find warm hospitality, fresh home-cooked Garhwali meals, and deep rest
                with panoramic views of the valley.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  to="/rooms"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#f7efe3] px-7 py-3.5 text-sm font-semibold text-[#17322e] shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition hover:bg-white"
                >
                  <span>Explore Rooms & Rates</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <a
                  href="https://maps.app.goo.gl/tr8YhF4AuSyNbhWh9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-black/25 px-6 py-3.5 text-sm font-medium text-white shadow-md backdrop-blur-sm transition hover:border-white hover:bg-white/20"
                >
                  <MapPin className="h-4 w-4 text-[#ffe2cc]" />
                  <span>Locate in Karnaprayag</span>
                </a>
              </div>

              {/* Authentic Footnotes */}
              <div className="mt-8 border-t border-white/30 pt-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-white/90 [text-shadow:_0_1px_4px_rgb(0_0_0_/_80%)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ffe2cc]" />
                    2-min walk to Sangam
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ffe2cc]" />
                    Fresh home-cooked meals
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ffe2cc]" />
                    Gateway to Badrinath & Chopta
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Transparent Location Text (No white background, photo completely visible) */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 justify-end self-end pb-2">
              <div className="max-w-xs text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_85%)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffe2cc]">
                  <MapPin className="h-3.5 w-3.5 text-[#ffe2cc]" />
                  <span>Karnaprayag Town</span>
                </div>
                <p className="mt-1 text-xs text-white/95 leading-relaxed">
                  Morning sunlight breaking through the gorge over the Alaknanda & Pindar confluence.
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-white/30 pt-2 text-[11px] text-white/80">
                  <span>Panch Prayag</span>
                  <span className="font-semibold text-[#ffe2cc]">750m Elevation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Authentic Homestay Philosophy & Story */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left Narrative Pillar */}
            <div className="lg:col-span-5">
              <p className="font-grand text-3xl text-[#8b4e31]">
                A real Himalayan home
              </p>
              <h2 className="mt-2 font-merriweather text-2xl font-semibold leading-tight text-[#17322e] sm:text-4xl">
                Not a commercial hotel. A personal hearth in the hills.
              </h2>
              <p className="mt-6 text-base font-light leading-relaxed text-[#52605b] sm:text-lg">
                We opened Geeta Homestay for travelers who seek authentic simplicity.
                Here, your day begins with freshly brewed ginger chai on the sunlit
                balcony, punctuated by temple bells and the distant rush of the river
                confluence.
              </p>
              <p className="mt-4 text-base font-light leading-relaxed text-[#52605b]">
                Our family is here to welcome you with sincere Garhwali warmth,
                point you toward peaceful pilgrim paths, and serve hot, wholesome
                meals made with love.
              </p>

              <div className="mt-8">
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b4e31] transition hover:text-[#17322e]"
                >
                  <span>See available rooms & view photos</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Asymmetrical Feature Storytelling (Hierarchy instead of uniform grid) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Feature Card 1: Dominant */}
              <div className="rounded-[30px] border border-[#e7ded1] bg-white p-7 sm:p-9 shadow-[0_15px_40px_rgba(23,50,46,0.04)]">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b4e31]">
                  Sacred Confluence
                </span>
                <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-[#17322e]">
                  Steps from Karnaprayag Sangam & Karna Temple
                </h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#596661]">
                  Karnaprayag is one of the five holy confluences (Panch Prayag). Our homestay
                  is situated within immediate walking distance of the sangam where the
                  Alaknanda and Pindar embrace, surrounded by revered shrines including the
                  ancient Uma Devi Temple.
                </p>
              </div>

              {/* Feature Card 2: Rest & Dining */}
              <div className="rounded-[30px] border border-[#ebd8c7] bg-[#fbf4ec] p-7 sm:p-9">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b4e31]">
                  Comfort & Nourishment
                </span>
                <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-[#17322e]">
                  Fresh home cooking & sound mountain sleep
                </h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#596661]">
                  Long mountain roads demand real rest. Enjoy clean, spacious rooms with
                  reliable hot water, comfortable mattresses, and home-cooked meals prepared
                  fresh upon request — from morning parathas to comforting evening dal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Room Invitation Strip */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[36px] bg-[#17322e] px-6 py-12 text-[#fff8ef] shadow-[0_30px_70px_rgba(23,50,46,0.18)] sm:px-12 sm:py-16 lg:px-16">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <p className="font-grand text-3xl text-[#f1c8af]">
                  Plan your peaceful retreat
                </p>
                <h2 className="mt-2 text-2xl font-semibold sm:text-4xl text-[#fffdfa]">
                  Thoughtfully prepared rooms for individuals, couples & families.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#d3ddd7] sm:text-base">
                  Every room is maintained with fresh linens, spotless private bathrooms,
                  ventilation, and quiet windows looking out toward the mountains.
                </p>
              </div>

              <div className="flex flex-col sm:items-start lg:col-span-4 lg:items-end justify-center">
                <Link
                  to="/rooms"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7efe3] px-8 py-4 text-sm font-semibold text-[#17322e] transition hover:bg-white shadow-md"
                >
                  <span>View All Rooms</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-xs text-[#b8c9c2]">
                  Instant online reservation • Razorpay secured
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Components */}
      <LocationComponent />
      <Facilities />
      <Testimonials />
    </div>
  );
};

export default HomePage;

