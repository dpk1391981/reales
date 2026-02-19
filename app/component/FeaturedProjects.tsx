"use client";

const projects = [
  {
    name: "Prestige Royal Heights",
    location: "Whitefield, Bangalore",
    price: "₹85L - ₹1.6Cr",
    bhk: "2 & 3 BHK",
    status: "Ready to Move",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
  },
  {
    name: "DLF Luxury Towers",
    location: "Gurgaon, Delhi NCR",
    price: "₹1.8Cr - ₹4.2Cr",
    bhk: "3 & 4 BHK",
    status: "Under Construction",
    image:
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1200",
  },
  {
    name: "Lodha Waterfront",
    location: "Worli, Mumbai",
    price: "₹2.5Cr - ₹6Cr",
    bhk: "3, 4 & 5 BHK",
    status: "Ready to Move",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200",
  },
];

export default function FeaturedProjects() {
  return (
    <section className="bg-white py-24 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto">

        {/* Section Header */}
        <div className="mb-14">
          <h2 className="text-4xl font-bold text-[#0f2342]">
            Featured{" "}
            <span className="text-amber-500">Projects</span>
          </h2>
          <p className="text-slate-500 mt-3 text-sm">
            Discover premium residential projects across top Indian cities
          </p>
          <div className="w-16 h-1 bg-amber-500 mt-4 rounded-full" />
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

          {projects.map((project) => (
            <div
              key={project.name}
              className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-[250px] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Status Badge */}
                <span
                  className={`absolute top-4 left-4 text-xs font-semibold px-4 py-1 rounded-full shadow
                    ${
                      project.status === "Ready to Move"
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-[#0f2342]"
                    }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#0f2342] mb-2">
                  {project.name}
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                  📍 {project.location}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-[#0f2342]">
                    {project.price}
                  </span>
                  <span className="text-sm text-slate-600">
                    {project.bhk}
                  </span>
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-[#0f2342] to-[#1a3a6e] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg transition">
                  View Details
                </button>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
