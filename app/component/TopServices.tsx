"use client";

const services = [
  {
    title: "Buy a Home",
    description:
      "Explore verified flats, villas & plots across India’s top cities.",
    icon: "🏠",
    button: "Browse Properties",
  },
  {
    title: "Sell Property",
    description:
      "List your property and connect with thousands of genuine buyers.",
    icon: "📈",
    button: "Post Property",
  },
  {
    title: "Rent a Home",
    description:
      "Find rental apartments, PGs & commercial spaces easily.",
    icon: "🔑",
    button: "Explore Rentals",
  },
  {
    title: "New Projects",
    description:
      "Discover newly launched and upcoming residential projects.",
    icon: "🏗",
    button: "View Projects",
  },
];

export default function TopServices() {
  return (
    <section className="bg-[#f9fafb] py-24 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">

        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0f2342]">
            Our{" "}
            <span className="text-amber-500">
              Real Estate Services
            </span>
          </h2>
          <p className="text-slate-500 mt-4 text-sm max-w-[600px] mx-auto">
            Whether you're buying, selling or renting — Think4BuySale provides
            complete real estate solutions.
          </p>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 text-center group hover:-translate-y-3"
            >
              {/* Icon */}
              <div className="text-5xl mb-6">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#0f2342] mb-3">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 mb-6">
                {service.description}
              </p>

              {/* Button */}
              <button className="mt-auto bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition">
                {service.button}
              </button>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
