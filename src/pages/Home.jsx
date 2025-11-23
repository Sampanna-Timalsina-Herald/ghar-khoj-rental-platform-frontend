import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Nepal Rentals</h1>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Signup
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full bg-blue-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold">Find Your Perfect Rental Home in Nepal</h1>
        <p className="text-lg mt-3">
          Rooms • Flats • Apartments • Hostels • Houses for Rent Across Nepal
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by location (e.g., Kathmandu, Pokhara...)"
            className="w-80 sm:w-96 px-4 py-3 rounded-l-lg text-black outline-none"
          />
          <button className="bg-yellow-400 px-6 py-3 rounded-r-lg text-black font-semibold">
            Search
          </button>
        </div>
      </div>

      {/* Popular Cities */}
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-6">Popular Cities</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {["Kathmandu", "Lalitpur", "Pokhara", "Bhaktapur", "Butwal"].map(
            (city) => (
              <div
                key={city}
                className="bg-white shadow-md rounded-lg py-6 text-center hover:shadow-xl cursor-pointer"
              >
                {city}
              </div>
            )
          )}
        </div>
      </div>

      {/* Featured Listings */}
      <div className="max-w-6xl mx-auto mt-16 px-4">
        <h2 className="text-2xl font-bold mb-6">Featured Rentals</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={`https://source.unsplash.com/400x300/?room,apartment,house,nepal&sig=${item}`}
                alt="Room"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">Beautiful Room in Kathmandu</h3>
                <p className="text-gray-600 mt-2">Rs. 10,000 / month</p>
                <p className="text-sm text-gray-500 mt-1">Near Kalanki, Kathmandu</p>

                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white py-6 mt-20 text-center">
        <p>© {new Date().getFullYear()} Nepal Rental Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
